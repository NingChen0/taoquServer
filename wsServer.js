const WebSocket = require("ws");
var db = require("./db.js"); //加载db模块，使用暴露出来的conn
let clients = {}; // 存储用户ID和WebSocket连接的映射

module.exports = (server) => {
    // 创建WebSocket服务器
    const wss = new WebSocket.Server({ server });
    // 监听连接事件
    wss.on("connection", (ws, req) => {
        console.log("Client connected");
        // 通过请求头获取当前登录用户的ID
        // const userId = parseInt(req.url.slice(-1));
        let parts = req.url.split("=");
        // 获取等号后面的部分，并转换为数字
        let userId = parseInt(parts[1], 10); // 使用 parseInt 并指定基数为 10
        // console.log(req.url.slice(-1));

        if (userId) {
            clients[userId] = ws;
            console.log(`User ${userId} connected`);
        }
        // 接收消息
        ws.on("message", (messages) => {
            // console.log("Received message:", messages);
            const data = JSON.parse(messages);
            const { sender_id, receiver_id, message, created_at, goodsId } =
                data;
            console.log(data);

            // 将消息保存到数据库
            const sql =
                "INSERT INTO messages (sender_id, receiver_id, message,created_at,goodsId) VALUES (?,?,?,?,?)";
            db.conn.query(
                sql,
                [sender_id, receiver_id, message, created_at, goodsId],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log("Message saved to database:", result);
                    // 发送消息给特定用户
                    let receiverId = receiver_id;
                    if (clients[receiverId]) {
                        clients[receiverId].send(
                            JSON.stringify({
                                sender_id,
                                receiver_id,
                                message,
                                created_at,
                                goodsId,
                            })
                        );
                    } else {
                        console.log(`User ${receiverId} is not online`);
                        // 可以在此处理离线消息存储等逻辑
                    }
                    // 广播消息给所有客户端
                    // wss.clients.forEach((client) => {
                    //     if (client.readyState === WebSocket.OPEN) {
                    //         client.send(
                    //             JSON.stringify({
                    //                 sender_id,
                    //                 receiver_id,
                    //                 message,
                    //                 created_at,
                    //                 goodsId,
                    //             })
                    //         );
                    //     }
                    // });
                }
            );
        });

        ws.on("close", () => {
            console.log("Client disconnected");
            // 当连接关闭时移除对应的用户
            for (const id in clients) {
                if (clients[id] === ws) {
                    console.log(`User ${id} disconnected`);
                    delete clients[id];
                    break;
                }
            }
        });
    });
};
