const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
var LOCAL_BIND_PORT = 3000;
var app = express();

const bodyParaser = require("body-parser");
const { response } = require("express");
var db = require("./db.js"); //加载db模块，使用暴露出来的conn
//引入封装好的jwt模块
const Token = require("./jwt");

app.use(bodyParaser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
// 跨域
//设置跨域访问
app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type,Content-Length, Authorization,Origin,Accept,X-Requested-With"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.header("Access-Control-Allow-Credentials", true);
    res.header("X-Powered-By", " 3.2.1");
    res.header("Content-Type", "application/json;charset=utf-8");
    res.header("Access-Control-Expose-Headers", "Authorization"); //如果前端需要获取自定义的响应头的话，需要服务器端设置Access-Control-Expose-Headers
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
});
//测试访问
app.get("/test", (req, res) => {
    return res.send("result+success");
});
//token验证 去除登录和上传时的验证/user/imgUpload
app.use((req, res, next) => {
    if (
        req.url.includes("login") ||
        req.url.includes("/api/upload") ||
        req.url.includes("/temp") ||
        req.url.includes("/userHeadPhotos")
    ) {
        next();
        return;
    }
    // console.log(req.headers);
    const token = req.headers["authorization"]?.split(" ")[1]; //不存在authorization，则不执行本条
    // console.log(token);
    if (token != "null") {
        // console.log("11+"+token);
        const payload = Token.verify(token);
        console.log("payload+" + payload.token);
        if (payload.token) {
            //重新计算token时间
            const newToken = Token.generate(
                { id: payload.id, name: payload.name },
                "1h"
            );
            res.header("Authorization", newToken);
            // console.log('ssucdess');
            next();
        } else {
            // console.log(401);
            res.status(401).send({ errCode: -1, errInfo: "token过期" });
        }
    } else {
        res.status(401).send({ errCode: -1, errInfo: "token过期" });
    }
});

//登录
app.post("/user/login", (req, res) => {
    console.log(req.body);
    let data = req.body;
    let { username, password } = data; //解构赋值
    let sql = "select * from user where userName=? and password=?";

    // 登录操作
    let sqlParam = [username, password];
    db.conn.query(sql, sqlParam, (err, result) => {
        if (err) {
            return console.log(err);
        }
        // console.log(result);
        let user = result[0]; // 取查找出的账户名
        if (!user) {
            // 账号非法
            return res.json({
                message: "登录失败，请检查账号和密码是否正确",
            });
        } else {
            // 登陆成功
            // jwt
            const token = Token.generate(
                { id: user.id, name: user.username },
                "1h"
            );
            res.header("Authorization", token);

            // 发送一次响应即可
            return res.json({
                id: user.id,
                userName: user.userName,
                headImg: user.headImg,
                success: "Login success",
            });
        }
    });
});
//注册账号
app.post("/user/register", (req, res) => {
    console.log(req.body);
    let data = req.body;
    let { username, password } = data; //解构赋值
    let headImg = "http://localhost:3000/userHeadPhotos/defaultUser.png";
    let sql =
        "INSERT INTO `user`(`userName`,`password`,`headImg`,`sex`, `userType`) VALUES(?,?,?,?,?)";
    // 注册操作写入数据表
    let sqlParam = [username, password, headImg, "0", "user"];
    db.conn.query(sql, sqlParam, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "用户名已被注册！请重新输入...",
            });
        }
        console.log(result);
        return res.json({
            state: true,
            message: "注册成功",
        });
    });
});
//获取用户信息
app.get("/mine/info", function (req, res) {
    console.log(req.query);
    let id = req.query.id;
    let sql = "select * from user where id=?";
    // 查询数据库
    let sqlParam = [id];
    db.conn.query(sql, sqlParam, function (err, result) {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "获取用户信息失败！请稍后再试...",
            });
        }
        return res.json({
            state: true,
            message: "获取用户信息成功",
            data: result,
        });
    });
});
// 配置 multer存储路径
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //请求对象 req、文件对象 file 和一个回调函数 cb
        cb(null, "./uploads/temp"); // 文件存储路径 // 存储到临时目录
    },
    //确定文件名称，file.originalname==文件原始扩展名
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 文件名
    },
});
//创建multer实例
const upload = multer({ storage });

// 图片上传接口
app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res
            .status(400)
            .json({ error: "No file uploaded,没有文件上传！" });
    }

    const filePath = `/temp/${req.file.filename}`;
    res.json({ url: `http://localhost:3000${filePath}` }); // 返回图片访问路径
});
// 用户信息修改
app.post("/mine/updateUserInfo", (req, res) => {
    console.log(req.body);
    let data = req.body;
    //解构赋值
    let {
        id,
        username,
        password,
        introduction,
        headImg,
        resident,
        sex,
        age,
        isAvatarUploaded,
    } = data; //解构赋值
    // 判断是否上传头像
    if (isAvatarUploaded) {
        // 将图片从临时目录移动到正式目录,将字符串按斜杠分割成一个数组，
        // .pop() 方法获取并移除数组的最后一个元素，返回该元素
        const tempPath = `uploads/temp/${headImg.split("/").pop()}`;
        const newPath = `uploads/userHeadPhotos/${headImg.split("/").pop()}`;
        // 存储旧头像信息
        let oldHeadImg = "";
        fs.rename(tempPath, newPath, (err) => {
            if (err) {
                console.error("Failed to move image:", err);
                return res
                    .status(500)
                    .json({ success: false, message: "Failed to save image" });
            }
            // 获取旧头像信息
            let getImgSQL = "SELECT headImg FROM user WHERE id=?";
            db.conn.query(getImgSQL, [id], (err, result) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        state: false,
                        message: "查找失败",
                    });
                }
                let oldUrl = result[0].headImg;
                oldHeadImg = `uploads/userHeadPhotos/${oldUrl
                    .split("/")
                    .pop()}`;
                console.log(oldHeadImg);
            });
            // 数据库操作, 插入图片路径到数据库
            const updatedUser = {
                headImg: `http://localhost:3000/userHeadPhotos/${headImg
                    .split("/")
                    .pop()}`,
            };
            let sql =
                "UPDATE user SET `userName`=?,`password`=?,`introduction`=?,`resident`=?,`sex`=?,`age`=?,`headImg`=? WHERE `id`=?";

            // 入数据表
            let sqlParam = [
                username,
                password,
                introduction,
                resident,
                sex,
                age,
                updatedUser.headImg,
                id,
            ];
            db.conn.query(sql, sqlParam, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.json({
                        state: false,
                        message: "更新用户信息失败",
                    });
                }
                //删除旧的头像
                // 如果旧头像存在，删除旧头像文件
                if (oldHeadImg) {
                    if (fs.existsSync(oldHeadImg)) {
                        fs.unlink(oldHeadImg, (err) => {
                            if (err) {
                                console.error(
                                    "Failed to delete image:删除失败：",
                                    err
                                );
                            }
                            console.log("Old image deleted.");
                        });
                    }
                } else {
                    console.log("没有旧头像");
                }

                console.log(result);
                return res.json({
                    state: true,
                    message: "修改成功",
                    headImg: updatedUser.headImg,
                    isAvatarUploaded: true,
                });
            });
        });
    } else {
        // 如果没有新头像，直接更新其他信息
        let sql =
            "UPDATE user SET `userName`=?,`password`=?,`introduction`=?,`resident`=?,`sex`=?,`age`=? WHERE `id`=?";

        // 入数据表
        let sqlParam = [
            username,
            password,
            introduction,
            resident,
            sex,
            age,
            id,
        ];
        db.conn.query(sql, sqlParam, (err, result) => {
            if (err) {
                console.log(err);
                return res.json({
                    state: false,
                    message: "用户名已被注册！请重新输入...",
                });
            }
            console.log(result);
            return res.json({
                state: true,
                message: "修改成功",
                isAvatarUploaded: false,
            });
        });
    }
});
// 静态资源服务,uploads文件夹作为静态资源根目录
app.use(express.static("./uploads"));
// 定时清理任务（清理临时目录中的未使用图片）
setInterval(() => {
    fs.readdir("uploads/temp/", (err, files) => {
        if (err)
            return console.error("Unable to scan directory: 不能扫描" + err);

        files.forEach((file) => {
            fs.unlink(`uploads/temp/${file}`, (err) => {
                if (err)
                    return console.error(
                        "Unable to delete file:未能清理 " + err
                    );
            });
        });
    });
}, 60 * 60 * 1000); // 每小时清理一次
// 启动服务
console.log(
    `Start static file server at ::${LOCAL_BIND_PORT}, Press ^ + C to exit`
);
app.listen(LOCAL_BIND_PORT);
