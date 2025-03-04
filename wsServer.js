module.exports = (server) => {
    const WebSocket = require("ws");
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        console.log("New client connected");

        // 接收消息
        ws.on("message", async (message) => {
            const data = JSON.parse(message);
            const { senderId, receiverId, content } = data;

            // 将消息保存到数据库（假设有一个 saveMessage 函数）
            try {
                await saveMessage(senderId, receiverId, content);

                // 广播消息给所有客户端
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(
                            JSON.stringify({
                                senderId,
                                receiverId,
                                content,
                                timestamp: new Date(),
                            })
                        );
                    }
                });
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        // 关闭连接
        ws.on("close", () => {
            console.log("Client disconnected");
        });
    });

    // 示例：保存消息到数据库
    const saveMessage = async (senderId, receiverId, content) => {
        const mysql = require("mysql2/promise");
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "password",
            database: "chat_app",
        });

        const [result] = await connection.execute(
            "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
            [senderId, receiverId, content]
        );

        await connection.end();
        return result;
    };
};
