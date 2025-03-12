const express = require("express");
const multer = require("multer");
const http = require("http"); // 引入 http 模块
const path = require("path");
const fs = require("fs");
var LOCAL_BIND_PORT = 3000;
var app = express();

// 创建 HTTP 服务器
const server = http.createServer(app);
const webSocketServer = require("./wsServer.js");
// 初始化WebSocket服务器
webSocketServer(server);
const bodyParaser = require("body-parser");
const { response } = require("express");
var db = require("./db.js"); //加载db模块，使用暴露出来的conn
//引入封装好的jwt模块
const Token = require("./jwt");
//引入自定义fileoperation模块
const FileOperation = require("./fileutils.js");
app.use(bodyParaser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
// 跨域
//设置跨域访问
app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    // 允许的请求头列表中
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type,Content-Length, Authorization,Origin,Accept,X-Requested-With,userid"
    );
    // 设置允许的 HTTP 方法
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    // 允许凭证（cookies）
    res.header("Access-Control-Allow-Credentials", true);
    res.header("X-Powered-By", " 3.2.1");
    res.header("Content-Type", "application/json;charset=utf-8");
    res.header("Access-Control-Expose-Headers", "Authorization,userId"); //如果前端需要获取自定义的响应头的话，需要服务器端设置Access-Control-Expose-Headers
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
        req.url.includes("/upload") ||
        req.url.includes("/temp") ||
        req.url.includes("/goodsPic") ||
        req.url.includes("/register") ||
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
// 时间线
app.get("/timeline", (req, res) => {
    console.log(req.body);
    let sql = "select * from timeline order by timestamp desc";
    db.conn.query(sql, (err, result) => {
        if (err) {
            res.res.json({
                state: false,
                message: "数据库错误，请稍后重试",
            });
            return console.log(err);
        }
        return res.json({
            state: true,
            result,
        });
    });
});
//管理员登录
app.post("/admin/login", (req, res) => {
    console.log(req.body);
    let data = req.body;
    let { username, password } = data;
    let sql =
        "select * from user where userName=? and password=? and userType='admin'";
    db.conn.query(sql, [username, password], (err, result) => {
        if (err) {
            return console.log(err);
        }
        if (result.length > 0) {
            //登录成功
            // jwt
            const token = Token.generate(
                { id: result[0].id, name: result[0].userName },
                "1h"
            );
            res.header("Authorization", token);
            // console.log(result);
            return res.json({
                id: result[0].id,
                userName: result[0].userName,
                state: true,
                message: "登录成功",
                headImg: result[0].headImg,
                userType: result[0].userType,
            });
        }
        return res.json({
            state: false,
            message: "用户名或密码错误！请重新输入...",
        });
    });
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
//统计今日注册的用户数量
app.get("/user/count", (req, res) => {
    let sql =
        "select count(*) as count from user where DATE_FORMAT(createTime,'%Y-%m-%d') = DATE_FORMAT(NOW(),'%Y-%m-%d')";
    db.conn.query(sql, (err, result) => {
        if (err) {
            return console.log(err);
        }
        return res.json({
            state: true,
            count: result[0].count,
        });
    });
});
//注册账号
app.post("/user/register", (req, res) => {
    console.log(req.body);
    let data = req.body;
    let { username, password, createTime } = data; //解构赋值
    let headImg = "http://localhost:3000/userHeadPhotos/defaultUser.jpg";
    let sql =
        "INSERT INTO `user`(`userName`,`createTime`,`password`,`headImg`,`sex`, `userType`) VALUES(?,?,?,?,?,?)";
    // 注册操作写入数据表
    let sqlParam = [username, createTime, password, headImg, "0", "user"];
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
//更新密码
app.post("/user/updatePassword", function (req, res) {
    let data = req.body;
    let { id, password } = data;
    let sql = "update user set password=? where id=?";
    db.conn.query(sql, [password, id], function (err, result) {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "更新用户信息失败！请稍后再试...",
            });
        }
        return res.json({
            state: true,
            message: "更新用户信息成功",
        });
    });
});
//更新用户管理员状态
app.post("/user/updateUserType", function (req, res) {
    let data = req.body;
    let { id, userType } = data;
    let sql = "update user set userType=? where id=?";
    db.conn.query(sql, [userType, id], function (err, result) {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "更新用户信息失败！请稍后再试...",
            });
        }
        return res.json({
            state: true,
            message: "更新用户信息成功",
        });
    });
});

// 获取所有的用户信息
app.get("/user/list", function (req, res) {
    let sql = "select * from user";
    db.conn.query(sql, function (err, result) {
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
// 删除用户
app.post("/user/delete", function (req, res) {
    let data = req.body;
    let { id } = data;
    let sql = "delete from user where id=?";
    db.conn.query(sql, [id], function (err, result) {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "删除用户信息失败！请稍后再试...",
            });
        }
        return res.json({
            state: true,
            message: "删除用户信息成功",
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
    res.json({ code: 200, url: `http://localhost:3000${filePath}` }); // 返回图片/、临时视频文件访问路径
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
                // 如果旧头像存在，删除旧头像文件,且旧头像不是默认头像才删除
                if (oldHeadImg && !oldHeadImg.includes("defaultUser")) {
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
//  统计今天的订单价格数据
app.get("/order/getOrderPriceCount", (req, res) => {
    const sql = `select sum(price) as countPrice,COUNT(id) AS countOrder, DATE_FORMAT(payTime, '%Y-%m-%d') as date from orders where payTime >= DATE_FORMAT(CURDATE(), '%Y-%m-%d') group by date`;
    db.conn.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "数据库查询失败",
                error: "数据库查询失败",
            });
        }
        if (result.length === 0) {
            return res.json({
                state: true,
                message: "查询成功",
                data: [
                    {
                        countPrice: 0,
                        countOrder: 0,
                        count: 0,
                    },
                ],
            });
        }
        return res.json({
            state: true,
            message: "查询成功",
            data: result,
        });
    });
});
// 统计最近7天每天新发布商品的数据 //折线图
app.get("/goods/getNewGoodsCount", (req, res) => {
    const sql = `select count(id) as count, DATE_FORMAT(created, '%Y-%m-%d') as date from goods where created >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) group by date`;
    db.conn.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "数据库查询失败",
                error: "数据库查询失败",
            });
        }
        return res.json({
            state: true,
            message: "查询成功",
            data: result,
        });
    });
});
//统计商品各分类的数量信息且在本月之内 //雷达图
app.get("/goods/getGoodsCountByCategory", (req, res) => {
    const sql = `select count(g.id) as count,cate.category from goods g join goodscategory cate on cate.id=g.tag where g.created >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
    AND g.created < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)group by tag`;
    db.conn.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "数据库查询失败",
                error: "数据库查询失败",
            });
        }
        return res.json({
            state: true,
            message: "查询成功",
            result,
        });
    });
});
//统计本月所有订单的交易金额 top栏
app.get("/order/getOrderPrice", (req, res) => {
    const sql = `
    SELECT 
      SUM(price) AS totalPrice 
    FROM 
      orders 
    WHERE 
      payTime >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND 
      payTime < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH);`;
    db.conn.query(sql, (err, result) => {
        if (err) {
            res.json({ state: false, message: "数据库查询失败" });
        }
        return res.json({
            state: true,
            message: "查询成功",
            data: result[0].totalPrice,
        });
    });
});
//订单先分类，再统计各类的总金额 //饼图
app.get("/goods/getOrderCountByCategory", (req, res) => {
    const sql = `
    SELECT 
      c.category AS name, 
      SUM(o.price) AS value
    FROM 
      orders o
    JOIN 
      goods g ON o.goodsId = g.id
    JOIN 
      goodscategory c ON g.tag = c.id 
    GROUP BY 
     c.category;`;
    db.conn.query(sql, (err, result) => {
        if (err) {
            res.json({ state: false, message: "数据库查询失败" });
        }
        return res.json({
            state: true,
            message: "查询成功",
            data: result,
        });
    });
});
//获取所有商品信息
app.get("/goods/getGoods", (req, res) => {
    const sql = `
        SELECT 
          g.id AS goodsId, 
          g.title, 
          g.content, 
          g.price, 
          g.pageView, 
          g.created,
          g.updated,
          g.tag,
          g.surfacePicture,
          g.pictureUrl,
          g.videoUrl,
          g.orderState,
          u.id AS userId, 
          u.userName, 
          u.headImg,
          c.id AS category_id,
          c.category AS category_name
        FROM 
          goods g
        JOIN 
          user u ON g.userId = u.id
        JOIN 
          goodscategory c ON g.tag = c.id`;
    db.conn.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "数据库查询失败",
            });
        }
        return res.json({
            state: true,
            message: "查询成功",
            data: result,
        });
    });
});

// 获取商品信息排除已下架的
app.get("/goods/getAllGoods", function (req, res) {
    const sql = `
        SELECT 
          g.id AS goodsId, 
          g.title, 
          g.content, 
          g.price, 
          g.pageView, 
          g.created,
          g.updated,
          g.tag,
          g.surfacePicture,
          g.pictureUrl,
          g.videoUrl,
          u.id AS userId, 
          u.userName, 
          u.headImg,
          c.id AS category_id,
          c.category AS category_name
        FROM 
          goods g
        JOIN 
          user u ON g.userId = u.id
        JOIN 
          goodscategory c ON g.tag = c.id
          WHERE 
            g.isDelete != 1
      `;
    db.conn.query(sql, function (err, result) {
        if (err) {
            console.log(err);

            return res.status(500).json({
                state: false,
                message: "数据库查询失败",
                error: "数据库查询失败",
            });
        }
        res.json({
            state: true,
            message: "查询成功",
            data: result,
        });
    });
});
// 通过id获取商品信息
app.get("/goods/getGoodsById", (req, res) => {
    let id = req.query.id;
    const sql = `SELECT 
          g.id AS goodsId, 
          g.title, 
          g.content, 
          g.price, 
          g.pageView, 
          g.created,
          g.updated,
          g.tag,
          g.surfacePicture,
          g.pictureUrl,
          g.videoUrl,
          u.id AS userId, 
          u.userName, 
          u.headImg,
          c.id AS category_id,
          c.category AS category_name
        FROM 
          goods g
        JOIN 
          user u ON g.userId = u.id
        JOIN 
          goodscategory c ON g.tag = c.id
        WHERE g.id = ?`;
    console.log("getID : " + id);

    db.conn.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                state: false,
                message: "数据库查询失败",
                error: "数据库查询失败",
            });
        }
        res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
// 通过userId获取用户商品信息
app.get("/goods/getGoodsByUserId", (req, res) => {
    let userId = req.query.userId;
    const sql = `SELECT 
        g.id AS goodsId, 
        g.title, 
        g.content, 
        g.price, 
        g.pageView, 
        g.created,
        g.updated,
        g.tag,
        g.surfacePicture,
        g.pictureUrl,
        g.videoUrl,
        u.id AS userId, 
        u.userName, 
        u.headImg,
        c.id AS category_id,
        c.category AS category_name
      FROM 
        goods g
      JOIN 
        user u ON g.userId = u.id
      JOIN 
        goodscategory c ON g.tag = c.id
      WHERE g.userId = ? AND g.isDelete != 1`;
    // console.log("getUserID : " + userId);

    db.conn.query(sql, [userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                state: false,
                message: "数据库查询失败",
                error: "数据库查询失败",
            });
        }
        console.log(result);

        res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
//获取商品的所有标签
app.get("/goods/getAllTags", (req, res) => {
    const sql = `SELECT * FROM goodscategory`;
    db.conn.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                state: false,
                message: "数据库查询失败",
                error: "数据库查询失败",
            });
        }
        res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
//删除某一个商品标签
app.get("/goods/deleteTag", (req, res) => {
    var category = req.query.category;
    const sql = `DELETE FROM goodscategory WHERE category = ?`;
    db.conn.query(sql, [category], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                state: false,
                message: "数据库查询失败",
            });
        }
        res.json({
            state: true,
            message: "删除成功",
        });
    });
});
//添加商品标签
app.get("/goods/addTag", (req, res) => {
    var category = req.query.category;
    const sql = `INSERT INTO goodscategory (category) VALUES (?)`;
    db.conn.query(sql, [category], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                state: false,
                message: "数据库查询失败",
            });
        }
        res.json({
            state: true,
            message: "添加成功",
        });
    });
});
//通过标签获取商品信息
app.get("/goods/getGoodsByTag", (req, res) => {
    var tag = req.query.tag;
    const sql = `
        SELECT 
          g.id AS goodsId, 
          g.title, 
          g.content, 
          g.price, 
          g.pageView, 
          g.created,
          g.updated,
          g.tag,
          g.surfacePicture,
          g.pictureUrl,
          g.videoUrl,
          u.id AS userId, 
          u.userName, 
          u.headImg,
          c.id AS category_id,
          c.category AS category_name
        FROM 
          goods g
        JOIN 
          user u ON g.userId = u.id
        JOIN 
          goodscategory c ON g.tag = c.id
        WHERE g.tag = ? AND g.isDelete != 1`;

    db.conn.query(sql, [tag], (err, result) => {
        if (err) {
            console.log(err);

            return res.status(500).json({
                state: false,
                message: "数据库查询失败",
                error: "数据库查询失败",
            });
        }
        res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
//添加图片类商品信息
app.post("/goods/addGoods", (req, res) => {
    // console.log(req.body);
    // 解构赋值
    let {
        created,
        userId,
        surfacePicture,
        title,
        content,
        price,
        tag,
        pictureurl,
        isAvatarUploaded,
    } = req.body;
    // 将图片从/temp 移到/goodsPic中
    const surfaceTempPath = `uploads/temp/${surfacePicture.split("/").pop()}`;
    let newSurfacePath = `uploads/goodsPic/${surfacePicture.split("/").pop()}`;
    // console.log("数组类型" + typeof pictureurl + " w+" + pictureurl);
    // 移动封面图片
    fs.rename(surfaceTempPath, newSurfacePath, (err) => {
        if (err) {
            console.error("Failed to move image:", err);
            return res
                .status(500)
                .json({ state: false, message: "封面图片保存失败" });
        }
    });
    surfacePicture = `http://localhost:3000/goodsPic/${surfacePicture
        .split("/")
        .pop()}`;
    //循环移动图片
    for (let i = 0; i < pictureurl.length; i++) {
        let tempPath = `uploads/temp/${pictureurl[i].split("/").pop()}`;
        let newPath = `uploads/goodsPic/${pictureurl[i].split("/").pop()}`;
        fs.rename(tempPath, newPath, (err) => {
            if (err) {
                console.error("Failed to move image:", err);
                return res
                    .status(500)
                    .json({ state: false, message: "商品内容图片保存失败" });
            }
        });
    }
    // 使用 map 方法处理pictureurl 数据,替换路径
    const updatedUrls = pictureurl.map((url) =>
        url.replace("/temp/", "/goodsPic/")
    );
    //将数据保存到数据库
    let sql = `insert into goods(created,userId,title,content,tag,surfacePicture,price,pictureUrl,pageView) values(?,?,?,?,?,?,?,?,?)`;
    let sqlParams = [
        created,
        userId,
        title,
        content,
        tag,
        surfacePicture,
        price,
        JSON.stringify(updatedUrls),
        0,
    ];

    db.conn.query(sql, sqlParams, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "发布失败",
            });
        }
    });
    return res.json({
        state: true,
        message: "发布成功",
    });
});
//添加视频类商品信息
app.post("/goods/addVideoGoods", (req, res) => {
    let {
        created,
        userId,
        surfacePicture,
        title,
        content,
        price,
        tag,
        videourl,
        isAvatarUploaded,
    } = req.body;
    // 将封面图片和视频从/temp 移到/goodsPic中
    const surfaceTempPath = `uploads/temp/${surfacePicture.split("/").pop()}`;
    const videoTempPath = `uploads/temp/${videourl.split("/").pop()}`;
    let newSurfacePath = `uploads/goodsPic/${surfacePicture.split("/").pop()}`;
    const newVideoPath = `uploads/goodsPic/${videourl.split("/").pop()}`;
    // 移动封面图片
    fs.rename(surfaceTempPath, newSurfacePath, (err) => {
        if (err) {
            console.error("Failed to move image:", err);
            return res
                .status(500)
                .json({ state: false, message: "封面图片保存失败" });
        }
    });
    // 移动视频
    fs.rename(videoTempPath, newVideoPath, (err) => {
        if (err) {
            console.error("Failed to move video:", err);
            return res
                .status(500)
                .json({ state: false, message: "商品视频保存失败" });
        }
    });
    surfacePicture = `http://localhost:3000/goodsPic/${surfacePicture
        .split("/")
        .pop()}`;
    videourl = `http://localhost:3000/goodsPic/${videourl.split("/").pop()}`;
    //将数据保存到数据库
    let sql = `insert into goods(created,userId,title,content,tag,surfacePicture,price,videourl,pageView) values(?,?,?,?,?,?,?,?,?)`;
    let sqlParams = [
        created,
        userId,
        title,
        content,
        tag,
        surfacePicture,
        price,
        videourl,
        0,
    ];
    db.conn.query(sql, sqlParams, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "发布失败",
            });
        }
    });
    return res.json({
        state: true,
        message: "发布成功",
    });
});

//用户修改发布的商品信息
app.post("/goods/updateGoods", (req, res) => {
    const { updateForm, deletedFileList } = req.body;
    let {
        goodsId,
        title,
        content,
        updated,
        tag,
        price,
        surfacePicture,
        pictureUrl,
        videoUrl,
    } = updateForm;
    let newSurfacePicture = surfacePicture;
    //判断封面图片是否新上传
    if (surfacePicture.includes("temp")) {
        newSurfacePicture = `http://localhost:3000/goodsPic/${surfacePicture
            .split("/")
            .pop()}`;
        let tempPath = `uploads/temp/${surfacePicture.split("/").pop()}`;
        let newPath = `uploads/goodsPic/${newSurfacePicture.split("/").pop()}`;
        // 移动封面图片;
        // 判断文件是否存在
        if (fs.existsSync(tempPath)) {
            fs.rename(tempPath, newPath, (err) => {
                if (err) {
                    console.error("Failed to move pic:", err);
                    return res.status(500).json({
                        state: false,
                        message: "商品封面图片保存失败",
                    });
                }
            });
        }
    }
    //判断是否新上传视频文件
    let newVideoUrl = videoUrl;
    if (videoUrl.includes("temp")) {
        newVideoUrl = `http://localhost:3000/goodsPic/${videoUrl
            .split("/")
            .pop()}`;
        let tempPath = `uploads/temp/${videoUrl.split("/").pop()}`;
        let newPath = `uploads/goodsPic/${newVideoUrl.split("/").pop()}`;
        // 移动封面图片;
        // 判断文件是否存在
        if (fs.existsSync(tempPath)) {
            fs.rename(tempPath, newPath, (err) => {
                if (err) {
                    console.error("Failed to move pic:", err);
                    return res.status(500).json({
                        state: false,
                        message: "视频保存失败",
                    });
                }
            });
        }
    }
    let newPictureUrl = JSON.parse(pictureUrl);
    //循环移动图片list
    for (let i = 0; i < newPictureUrl.length; i++) {
        //判断图片是否是新上传的
        if (newPictureUrl[i].includes("temp")) {
            let tempPath = `uploads/temp/${newPictureUrl[i].split("/").pop()}`;
            let newPath = `uploads/goodsPic/${newPictureUrl[i]
                .split("/")
                .pop()}`;
            // //判断文件是否存在
            if (fs.existsSync(tempPath)) {
                fs.rename(tempPath, newPath, (err) => {
                    if (err) {
                        console.error("Failed to move image:", err);
                        return res.status(500).json({
                            state: false,
                            message: "商品内容图片保存失败",
                        });
                    }
                });
            }
            // 处理pictureurl 数据,替换路径
            newPictureUrl[i] = newPictureUrl[i].replace("/temp/", "/goodsPic/");
        }
    }
    //删除旧图片
    for (let i = 0; i < deletedFileList.length; i++) {
        let filePath = `uploads/goodsPic/${deletedFileList[i].url
            .split("/")
            .pop()}`;
        //判断文件是否存在
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("Failed to delete file:", err);
                }
            });
        }
    }

    const sql = `update goods set title=?,content=?,updated=?,tag=?,price=?,surfacePicture=?,pictureUrl=?,videoUrl=? where id=?`;
    let sqlParams = [
        title,
        content,
        updated,
        tag,
        price,
        newSurfacePicture,
        JSON.stringify(newPictureUrl),
        newVideoUrl,
        goodsId,
    ];
    db.conn.query(sql, sqlParams, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "修改失败",
            });
        }
    });
    res.json({
        state: true,
        message: "修改成功",
    });
});
//删除商品
app.post("/goods/deleteGoods", (req, res) => {
    const { goodsId, deletedFiles } = req.body;
    console.log("id" + goodsId);

    let sql = `delete from goods where id=?`;
    db.conn.query(sql, goodsId, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "删除失败",
            });
        }
        //删除旧图片
        for (let i = 0; i < deletedFiles.length; i++) {
            //判断是否为空
            if (deletedFiles[i].url == "" || deletedFiles[i].url == null) {
                continue;
            }
            let filePath = `uploads/goodsPic/${deletedFiles[i].url
                .split("/")
                .pop()}`;
            //判断文件是否存在
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error("Failed to delete file:", err);
                    }
                });
            }
        }
        return res.json({
            state: true,
            message: "删除成功",
        });
    });
});
// 用户添加购物车
app.post("/shop/addshopCar", (req, res) => {
    const { goods, buyerId } = req.body;
    if (goods.length == 0) {
        return res.json({
            state: false,
            message: "请选择商品",
        });
    }
    let {
        content,
        goodsId,
        userId,
        price,
        title,
        surfacePicture,
        userName,
        headImg,
    } = goods;
    //使用tryCatch
    try {
        //当同一用户buerId，和goodsId重复时，不添加，从数据库中查询，如果存在，则不添加
        let sql1 = `select * from shopcar where goodsId=? and buyerId=?`;
        db.conn.query(sql1, [goodsId, buyerId], (err, result) => {
            if (err) {
                console.log(err);
                return res.json({
                    state: false,
                    message: "查找失败",
                });
            }
            if (result.length > 0) {
                return res.json({
                    state: false,
                    message: "购物车中该商品已存在",
                });
            } else {
                let sql = `insert into shopcar(content,price,title,goodsSurface,sellerId,buyerId,sellerName,sellerImg,goodsId) values(?,?,?,?,?,?,?,?,?)`;
                let sqlParams = [
                    content,
                    price,
                    title,
                    surfacePicture,
                    userId,
                    buyerId,
                    userName,
                    headImg,
                    goodsId,
                ];
                db.conn.query(sql, sqlParams, (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.json({
                            state: false,
                            message: "添加失败",
                        });
                    }
                    return res.json({
                        state: true,
                        message: "添加成功",
                    });
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.json({
            state: false,
            message: "添加失败",
        });
    }
});
//用户获取购物车
app.get("/shop/getshopCar", (req, res) => {
    const buyerId = req.query.userId;
    console.log(buyerId);

    let sql = `select s.*,g.orderState from shopcar s JOIN goods g ON s.goodsId=g.id  where s.buyerId=?`;
    db.conn.query(sql, [buyerId], (err, result) => {
        if (err) {
            console.log(err);

            return res.status(500).json({
                state: false,
                message: "数据库查询失败",
                error: "数据库查询失败",
            });
        }
        res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
// 用户删除购物车
app.post("/shop/deleteShopCar", (req, res) => {
    const { shopCarId, buyerId } = req.body;
    let sql = `delete from shopcar where id=? and buyerId=?`;
    db.conn.query(sql, [shopCarId, buyerId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "删除失败",
            });
        }
        return res.json({
            state: true,
            message: "删除成功",
        });
    });
});
//用户获取地址信息
app.get("/address/getAddressList", (req, res) => {
    const userId = req.query.userId;
    console.log(userId);
    let sql = `select * from useraddress where userId=?`;
    db.conn.query(sql, [userId], (err, result) => {
        if (err) {
            console.log(err);

            return res.status(500).json({
                state: false,
                message: "数据库查询失败",
                error: "数据库查询失败",
            });
        }
        res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
// 用户添加地址
app.post("/address/addAddress", (req, res) => {
    const { userId, address, name, phone } = req.body;
    let sql = `insert into useraddress(userId,address,name,phone,isDefault) values(?,?,?,?,?)`;
    db.conn.query(sql, [userId, address, name, phone, 0], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "添加失败",
            });
        }
        return res.json({
            state: true,
            message: "添加成功",
        });
    });
});
// 用户删除地址
app.post("/address/deleteAddress", (req, res) => {
    const { addressId, userId } = req.body;
    let sql = `delete from useraddress where id=? and userId=?`;
    db.conn.query(sql, [addressId, userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "删除失败",
            });
        }
        return res.json({
            state: true,
            message: "删除成功",
        });
    });
});
// 用户修改地址
app.post("/address/updateAddress", (req, res) => {
    const { id, userId, address, name, phone } = req.body;
    let sql = `update useraddress set address=?,name=?,phone=? where id=? and userId=?`;
    db.conn.query(sql, [address, name, phone, id, userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "修改失败",
            });
        }
        return res.json({
            state: true,
            message: "修改成功",
        });
    });
});
// 用户设置默认地址
app.post("/address/setDefaultAddress", (req, res) => {
    const { addressId, userId } = req.body;
    // 先将所有地址的isDefault设置为0
    let sql = `update useraddress set isDefault=? where userId=?`;
    db.conn.query(sql, [0, userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "设置失败",
            });
        }
    });
    // 将选中的地址的isDefault设置为1
    sql = `update useraddress set isDefault=? where id=? and userId=?`;
    db.conn.query(sql, [1, addressId, userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "设置失败",
            });
        }
        return res.json({
            state: true,
            message: "设置成功",
        });
    });
});
// 用户提交订单，添加订单
app.post("/order/submitOrder", (req, res) => {
    let {
        orderNum,
        createTime,
        payTime,
        price,
        buyerId,
        sellerId,
        goodsId,
        addressId,
        remark,
        surfacePicture,
        title,
    } = req.body;
    //如果该商品的goodsId在orders表中存在，则不添加返回错误
    let sql = `select * from orders where goodsId=?`;
    db.conn.query(sql, [goodsId], (err, result) => {
        if (result.length > 0) {
            return res.json({
                state: false,
                message: "来晚了哦，该商品已售空",
            });
        } else {
            // 不存在插入订单
            try {
                let sql = `insert into orders(orderNum,createTime,payTime,price,buyerId,sellerId,goodsId,addressId,remark,surfacePicture,title) values(?,?,?,?,?,?,?,?,?,?,?)`;
                db.conn.query(
                    sql,
                    [
                        orderNum,
                        createTime,
                        payTime,
                        price,
                        buyerId,
                        sellerId,
                        goodsId,
                        addressId,
                        remark,
                        surfacePicture,
                        title,
                    ],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                            return res.json({
                                state: false,
                                message: "提交失败",
                            });
                        }

                        // 插入成功时，则将该商品在goods表中该商品的orderState设置为oeders的id,isDelete设置为1
                        sql = `update goods set orderState=?,isDelete=? where id=?`;
                        db.conn.query(sql, ["已售出", 1, goodsId], (err) => {
                            if (err) {
                                console.log(err);
                                return res.json({
                                    state: false,
                                    message: "提交失败",
                                });
                            }
                        });

                        return res.json({
                            state: true,
                            message: "提交成功",
                        });
                    }
                );
            } catch (err) {
                console.log(err);
                return res.json({
                    state: false,
                    message: "提交失败",
                });
            }
        }
    });
});
//管理员获取所有订单
app.get("/orders/getAllOrders", (req, res) => {
    let sql = `select o.*,addr.name as addressName,addr.phone,addr.address,g.content,u.headImg as sellerImg,u.userName AS sellerName from orders o JOIN user u on o.sellerId=u.id JOIN goods g ON g.id=o.goodsId JOIN useraddress addr on o.addressId=addr.id `;
    db.conn.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "获取失败",
            });
        }
        return res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
// 用户获取订单
app.get("/orders/getOrdersByUserId", (req, res) => {
    const { userId } = req.query;
    let sql = `select o.*,addr.name as addressName,addr.phone,addr.address,g.content,u.headImg as sellerImg,u.userName AS sellerName from orders o JOIN user u on o.sellerId=u.id JOIN goods g ON g.id=o.goodsId JOIN useraddress addr on o.addressId=addr.id where o.buyerId=?`;
    db.conn.query(sql, [userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "获取失败",
            });
        }
        result.forEach((item) => {
            item.seller = {
                sellerImg: item.sellerImg,
                sellerName: item.sellerName,
            };
        });
        return res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
//获取订单全部信息 倒序 //工作台数据
app.get("/orders/getOrders", (req, res) => {
    let sql = `select o.*,addr.name as addressName,addr.phone,addr.address,g.content,u.headImg as buyerImg,u.userName AS buyerName from orders o JOIN user u on o.buyerId=u.id JOIN goods g ON g.id=o.goodsId JOIN useraddress addr on o.addressId=addr.id order by o.id desc`;
    db.conn.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "获取失败",
            });
        }
        return res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
//根据卖家id获取订单
app.get("/orders/getOrdersBySellerId", (req, res) => {
    const { sellerId } = req.query;
    let sql = `select o.*,addr.name as addressName,addr.phone,addr.address,g.content,u.headImg as sellerImg,u.userName AS sellerName from orders o JOIN user u on o.buyerId=u.id JOIN goods g ON g.id=o.goodsId JOIN useraddress addr on o.addressId=addr.id where o.sellerId=?`;
    db.conn.query(sql, [sellerId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "获取失败",
            });
        }
        return res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
//卖家根据订单状态获取订单
app.get("/orders/getOrdersByState", (req, res) => {
    const { orderState, sellerId } = req.query;
    try {
        let sql = `select o.*,addr.name as addressName,addr.phone,addr.address,g.content,u.headImg as sellerImg,u.userName AS sellerName from orders o JOIN user u on o.buyerId=u.id JOIN goods g ON g.id=o.goodsId JOIN useraddress addr on o.addressId=addr.id where o.sellerId=? and o.orderState=?`;
        db.conn.query(sql, [sellerId, orderState], (err, result) => {
            if (err) {
                console.log(err);
                return res.json({
                    state: false,
                    message: "获取失败",
                });
            }
            return res.json({
                state: true,
                message: "获取成功",
                data: result,
            });
        });
    } catch (err) {
        console.log(err);
        return res.json({
            state: false,
            message: "获取失败",
        });
    }
});
// 卖家修改订单状态（发货，收货）
app.post("/orders/updateOrderState", (req, res) => {
    const { orderId, orderState } = req.body;
    try {
        let sql = `update orders set orderState=? where id=?`;
        db.conn.query(sql, [orderState, orderId], (err, result) => {
            if (err) {
                console.log(err);
                return res.json({
                    state: false,
                    message: "操作失败",
                });
            }
            return res.json({
                state: true,
                message: "操作成功",
            });
        });
    } catch (err) {
        console.log(err);
        return res.json({
            state: false,
            message: "操作失败",
        });
    }
});
// 用户获取订单详情
app.post("/order/getOrderDetail", (req, res) => {
    const { id } = req.body;
    let sql = `select * from orders where id=?`;
    db.conn.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "获取失败",
            });
        }
        return res.json({
            state: true,
            message: "获取成功",
            data: result,
        });
    });
});
// 用户删除订单
app.post("/orders/deleteOrdersById", (req, res) => {
    const { orderId } = req.body;
    let sql = `delete from orders where id=?`;
    db.conn.query(sql, [orderId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "删除失败",
            });
        }
        return res.json({
            state: true,
            message: "删除成功",
        });
    });
});
//用户给订单添加评价
app.post("/orders/addComment", (req, res) => {
    const { orderId, comment } = req.body;
    let sql = `update orders set comment=? where id=?`;
    db.conn.query(sql, [comment, orderId], (err, result) => {
        if (err) {
            console.log(err);
            return res.json({
                state: false,
                message: "添加失败",
            });
        }
        return res.json({
            state: true,
            message: "添加成功",
        });
    });
});

// 获取聊天记录
app.get("/mine/getMessages", (req, res) => {
    const { sender_id, receiver_id } = req.query;
    const sql = `
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
  `;
    db.conn.query(
        sql,
        [sender_id, receiver_id, receiver_id, sender_id],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.json({
                    state: false,
                    message: "获取失败",
                });
            }
            return res.json({
                state: true,
                message: "获取成功",
                data: results,
            });
        }
    );
});

// 发送消息
app.post("/mine/sendMessages", (req, res) => {
    const { sender_id, receiver_id, message, created_at, goodsId } = req.body;
    console.log(created_at);

    const sql =
        "INSERT INTO messages (sender_id, receiver_id, message,created_at,goodsId) VALUES (?,?,?,?,?)";
    db.conn.query(
        sql,
        [sender_id, receiver_id, message, created_at, goodsId],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.json({
                    state: false,
                    message: "发送失败",
                });
            }
            return res.json({
                state: true,
                message: "发送成功",
                data: result,
            });
        }
    );
});
// 用户获取关于自己是接受人的信息
app.get("/mine/getMessagesByReceiverId", (req, res) => {
    const { receiver_id } = req.query;
    console.log(receiver_id);

    //     const sql = `SELECT m.*,us.headImg AS senderImg,us.userName as senderName FROM messages m
    //  JOIN
    //     user us ON m.sender_id = us.id
    // WHERE m.sender_id = ?
    //          OR m.receiver_id = ?
    // ORDER BY
    //     m.created_at ASC;`;
    let sql1 = `SELECT 
              u.id AS chatUserId,
              u.userName,
              u.headImg,
              m.message AS last_message,
              sub.last_message_time,
              m.goodsId
          FROM (
              SELECT 
                  CASE 
                      WHEN sender_id = ? THEN receiver_id 
                      ELSE sender_id 
                  END AS chatUserId,
                  MAX(created_at) AS last_message_time
              FROM messages
              WHERE sender_id = ? OR receiver_id = ?
              GROUP BY chatUserId
          ) AS sub
          JOIN user u ON u.id = sub.chatUserId
          JOIN messages m ON m.created_at = sub.last_message_time
          ORDER BY sub.last_message_time DESC;`;
    db.conn.query(
        sql1,
        [receiver_id, receiver_id, receiver_id],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.json({
                    state: false,
                    message: "获取失败",
                });
            } else {
                console.log(results);

                return res.json({
                    state: true,
                    message: "获取成功",
                    data: results,
                });
            }
        }
    );
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
}, 60 * 30 * 1000); // 每半小时清理一次
// 启动服务
console.log(
    `Start static file server at ::${LOCAL_BIND_PORT}, Press ^ + C to exit`
);
// 设置端口并启动服务器
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
    console.log(`websoketServer is running on port ${PORT}`);
});
app.listen(LOCAL_BIND_PORT);
