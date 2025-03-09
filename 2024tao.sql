/*
 Navicat Premium Data Transfer

 Source Server         : MySql-xmapp-password=null
 Source Server Type    : MySQL
 Source Server Version : 100315
 Source Host           : localhost:3306
 Source Schema         : 2024tao

 Target Server Type    : MySQL
 Target Server Version : 100315
 File Encoding         : 65001

 Date: 09/03/2025 10:16:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for goods
-- ----------------------------
DROP TABLE IF EXISTS `goods`;
CREATE TABLE `goods`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `created` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `updated` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `userId` int NULL DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `tag` int NULL DEFAULT NULL,
  `surfacePicture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `pictureUrl` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
  `videoUrl` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `price` double(11, 2) NULL DEFAULT NULL,
  `pageView` int UNSIGNED NULL DEFAULT 0,
  `orderState` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '上架',
  `isDelete` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `userId`(`userId` ASC) USING BTREE,
  INDEX `tag`(`tag` ASC) USING BTREE,
  INDEX `orderState`(`orderState` ASC) USING BTREE,
  CONSTRAINT `goods_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `goods_ibfk_2` FOREIGN KEY (`tag`) REFERENCES `goodscategory` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of goods
-- ----------------------------
INSERT INTO `goods` VALUES (1, '2024-11-10T12:19:49.000+00:00', '2024-11-10T12:19:49.000+00:00', 1, 'Phone11紫色+微瑕 ', '和对象吵架的时候挡了一刀，目测应该还能竖着挡一刀。上边6.3，下边4.7，单出的话上边贵点，因为带前后主摄，搭配超广角镜头，记录你的美', 2, 'http://localhost:3000/goodsPic/rian.png', '[\"http://localhost:3000/goodsPic/rian.png\", \"http://localhost:3000/goodsPic/river.png\"]', NULL, 99.00, 11, '上架', 0);
INSERT INTO `goods` VALUES (2, '2024-11-10T12:19:49.000+00:00', '10T12:19:49.000+00:00', 1, '内心反复', '我们的故事要完结了', 6, 'http://localhost:3000/goodsPic/brage.png', '[\"http://localhost:3000/goodsPic/brage.png\", \"http://localhost:3000/goodsPic/river.png\"]', NULL, 11.99, 112, '上架', 0);
INSERT INTO `goods` VALUES (6, '2025-02-21T08:23:56.838+00:00', '2025-02-25T12:51:11.537+00:00', 2, '小灰', '一条小黑买米i还得发hi哦', 6, 'http://localhost:3000/goodsPic/1740487835738.jpg', '[\"http://localhost:3000/goodsPic/1740487752619.png\",\"http://localhost:3000/goodsPic/1740487863789.jpg\"]', '', 22.00, 0, '已售出', 1);
INSERT INTO `goods` VALUES (8, '2025-02-21T14:40:52.835+00:00', '2025-02-26T02:20:05.620+00:00', 2, '震惊的灰', '回回回回回回会回鹘', 2, 'http://localhost:3000/goodsPic/1740148833068.jpg', '[\"\"]', 'http://localhost:3000/goodsPic/1740536400612.mp4', 112.00, 0, '已售出', 1);
INSERT INTO `goods` VALUES (9, '2025-02-21T14:53:56.135+00:00', NULL, 11, 'Vue生命周期', '全新不刀的vue生命周期图标', 1, 'http://localhost:3000//goodsPic/1740149590701.png', '[\"http://localhost:3000/goodsPic/1740149595818.gif\"]', NULL, 199.00, 0, '已售出', 1);
INSERT INTO `goods` VALUES (10, '2025-02-21T14:57:15.701+00:00', NULL, 11, '简历制作', '今天只卖这个价12123123123', 1, 'http://localhost:3000//goodsPic/1740149807515.jpg', '[\"http://localhost:3000/goodsPic/1740149813879.png\"]', NULL, 12.00, 0, '上架', 0);
INSERT INTO `goods` VALUES (11, '2025-02-21T14:59:15.614+00:00', NULL, 2, '代码魔兽', '小黑猫家写代码', 3, 'http://localhost:3000//goodsPic/1740149902841.png', '[\"http://localhost:3000/goodsPic/1740149905854.png\",\"http://localhost:3000/goodsPic/1740149931556.png\"]', NULL, 2229.00, 0, '已售出', 1);
INSERT INTO `goods` VALUES (12, '2025-02-21T15:00:26.927+00:00', NULL, 2, '的说法是', '第三方', 1, 'http://localhost:3000//goodsPic/1740150018734.png', '[\"http://localhost:3000/goodsPic/1740150021399.png\"]', NULL, 33.00, 0, '已售出', 1);
INSERT INTO `goods` VALUES (14, '2025-02-27T09:06:03.785+00:00', NULL, 11, '美丽烟花', '11烟花', 6, 'http://localhost:3000/goodsPic/1740647146571.png', NULL, 'http://localhost:3000/goodsPic/1740647148970.mp4', 231.00, 0, '上架', 0);

-- ----------------------------
-- Table structure for goodscategory
-- ----------------------------
DROP TABLE IF EXISTS `goodscategory`;
CREATE TABLE `goodscategory`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of goodscategory
-- ----------------------------
INSERT INTO `goodscategory` VALUES (1, '书籍');
INSERT INTO `goodscategory` VALUES (2, '数码');
INSERT INTO `goodscategory` VALUES (3, '家居');
INSERT INTO `goodscategory` VALUES (4, '穿搭');
INSERT INTO `goodscategory` VALUES (5, '游戏');
INSERT INTO `goodscategory` VALUES (6, '其他');

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
  `goodsId` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sender_id`(`sender_id` ASC) USING BTREE,
  INDEX `receiver_id`(`receiver_id` ASC) USING BTREE,
  INDEX `messages_ibfk_3`(`goodsId` ASC) USING BTREE,
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`goodsId`) REFERENCES `goods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT = 74 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of messages
-- ----------------------------
INSERT INTO `messages` VALUES (1, 2, 11, '111', '2025-03-04 16:29:48', 14);
INSERT INTO `messages` VALUES (2, 11, 2, '11', '2025-03-04 16:30:04', 14);
INSERT INTO `messages` VALUES (3, 11, 2, '不买来的u发挥', '2025-03-04 16:30:02', 14);
INSERT INTO `messages` VALUES (4, 11, 1, '你好', '2025-03-04 16:30:45', 1);
INSERT INTO `messages` VALUES (5, 11, 2, '也就是那样', '2025-03-04 16:29:55', 14);
INSERT INTO `messages` VALUES (6, 2, 11, '111sadfdf', '2025-03-04 16:29:40', 14);
INSERT INTO `messages` VALUES (7, 11, 1, '向阳而生 - 华晨宇 词：吕易秋 曲：华晨宇 生予绚烂 生予希望 生予一切无常 相信羁绊 相信微光 相信一切如常 白昼会变长照亮心脏 让万物生长如是我们向阳 沉醉过泥土的芬芳啊 用最柔嫩青苔换取一抹阳光 然后自然老去吧 别再依依惜别了 可我仍爱着那道晚霞 我看过他青涩的藤啊 匆匆长在人海被风吹着流浪 更多阴晴不定的 还是阳光灿烂呢 只是他总是笑而不答 就让温暖驱散迷雾 给尘世一场风暴 看远方万众期冀跃起地 那一颗太阳 Ohh 多闪耀 我看到久违的晴朗啊 又在黎明醒来万亿爱中生长 长出轻盈的云朵 长出柔美的山色 长出世界本来的喧哗 寻一颗未萌的渺小啊 随着青翠未来升入辽阔云霄 那些黑暗笼罩的终将向阳而生呢 也许生命早给我解答 就让温暖将我救赎 给心灵一场风暴 当我们拼尽全力 追逐过那一颗太阳 Ohh 终闪耀', '2025-03-04 16:57:15', 1);
INSERT INTO `messages` VALUES (8, 11, 1, '2', '2025-03-04 16:58:48', 1);
INSERT INTO `messages` VALUES (9, 11, 1, '111', '2025-03-04 16:58:49', 1);
INSERT INTO `messages` VALUES (10, 11, 1, '2', '2025-03-04 17:01:04', 1);
INSERT INTO `messages` VALUES (11, 11, 1, '我的武器', '2025-03-04 17:05:09', 1);
INSERT INTO `messages` VALUES (15, 2, 11, '2', '2025-03-04 17:13:29', 14);
INSERT INTO `messages` VALUES (16, 2, 11, '11', '2025-03-04 17:14:11', 14);
INSERT INTO `messages` VALUES (17, 2, 11, '// 获取格式化后的时间戳     getFormattedTimestamp() {         const date = new Date();          // 获取年、月、日、时、分、秒         const year = date.getUTCFullYear();         const month = String(date.getUTCMonth() + 1).padStart(2, \"0\"); // 月份从0开始，所以要加1         const day = String(date.getUTCDate()).padStart(2, \"0\");         const hours = String(date.getUTCHours()).padStart(2, \"0\");         const minutes = String(date.getUTCMinutes()).padStart(2, \"0\");         const seconds = String(date.getUTCSeconds()).padStart(2, \"0\");          // 获取毫秒         const milliseconds = String(date.getUTCMilliseconds()).padStart(3, \"0\");          // 组合成ISO 8601格式         const formattedTimestamp = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;          return formattedTimestamp;     },', '2025-03-04 17:14:20', 14);
INSERT INTO `messages` VALUES (18, 2, 11, '万维网', '2025-03-04 17:14:30', 14);
INSERT INTO `messages` VALUES (19, 2, 11, '请求', '2025-03-04 17:15:19', 14);
INSERT INTO `messages` VALUES (20, 2, 11, '111', '2025-03-04 17:21:05', 14);
INSERT INTO `messages` VALUES (21, 2, 11, '12', '2025-03-07 10:53:22', 14);
INSERT INTO `messages` VALUES (22, 2, 11, '1', '2025-03-07 10:54:08', 14);
INSERT INTO `messages` VALUES (23, 2, 11, '和法国i素和部分', '2025-03-07 10:54:36', 14);
INSERT INTO `messages` VALUES (24, 2, 11, '烦恼凤凰男', '2025-03-07 10:54:38', 14);
INSERT INTO `messages` VALUES (25, 2, 11, '发放', '2025-03-07 10:54:41', 14);
INSERT INTO `messages` VALUES (26, 2, 11, '1212', '2025-03-07 10:58:14', 14);
INSERT INTO `messages` VALUES (27, 11, 2, '之恶hi', '2025-03-07 11:58:24', 14);
INSERT INTO `messages` VALUES (28, 2, 11, '不买', '2025-03-07 11:58:51', 14);
INSERT INTO `messages` VALUES (29, 11, 2, '苟富贵', '2025-03-07 12:07:53', 14);
INSERT INTO `messages` VALUES (30, 11, 2, '大师傅大师傅', '2025-03-07 12:29:50', 14);
INSERT INTO `messages` VALUES (31, 11, 2, '法大水法和大赛复活赛', '2025-03-07 12:31:57', 14);
INSERT INTO `messages` VALUES (32, 11, 2, '反对法', '2025-03-07 12:33:44', 14);
INSERT INTO `messages` VALUES (33, 11, 2, '五千万', '2025-03-07 12:35:15', 14);
INSERT INTO `messages` VALUES (34, 11, 2, '大苏打', '2025-03-07 12:59:36', 14);
INSERT INTO `messages` VALUES (35, 11, 2, '读书的时候', '2025-03-07 13:04:27', 14);
INSERT INTO `messages` VALUES (36, 11, 2, '大撒大撒', '2025-03-07 13:05:22', 14);
INSERT INTO `messages` VALUES (37, 2, 11, '反对反对', '2025-03-07 13:05:52', 14);
INSERT INTO `messages` VALUES (38, 2, 11, '打发打发', '2025-03-07 13:06:03', 14);
INSERT INTO `messages` VALUES (39, 11, 2, '大飒飒', '2025-03-07 13:18:38', 14);
INSERT INTO `messages` VALUES (40, 11, 2, '121', '2025-03-07 13:18:45', 14);
INSERT INTO `messages` VALUES (41, 11, 2, '递归的', '2025-03-07 13:22:23', 14);
INSERT INTO `messages` VALUES (42, 11, 2, '房贷首付', '2025-03-07 13:24:19', 14);
INSERT INTO `messages` VALUES (43, 11, 2, '反对法', '2025-03-07 13:24:43', 14);
INSERT INTO `messages` VALUES (44, 11, 2, '顶顶顶', '2025-03-07 13:51:55', 14);
INSERT INTO `messages` VALUES (45, 11, 2, '巍峨', '2025-03-07 13:53:44', 14);
INSERT INTO `messages` VALUES (46, 11, 2, '122', '2025-03-07 13:58:12', 14);
INSERT INTO `messages` VALUES (47, 11, 2, '大撒大撒', '2025-03-07 13:58:34', 14);
INSERT INTO `messages` VALUES (48, 11, 2, '121', '2025-03-07 14:01:49', 14);
INSERT INTO `messages` VALUES (49, 11, 2, '反对反对', '2025-03-07 14:02:05', 14);
INSERT INTO `messages` VALUES (50, 11, 2, '对方的', '2025-03-07 14:02:32', 14);
INSERT INTO `messages` VALUES (51, 11, 2, '111', '2025-03-07 14:41:18', 14);
INSERT INTO `messages` VALUES (52, 11, 2, '得瑟得瑟等', '2025-03-07 14:41:38', 14);
INSERT INTO `messages` VALUES (53, 11, 2, '反对反对风', '2025-03-07 14:41:56', 14);
INSERT INTO `messages` VALUES (54, 11, 2, '顶顶顶', '2025-03-07 14:42:03', 14);
INSERT INTO `messages` VALUES (55, 11, 2, '222', '2025-03-07 15:10:19', 14);
INSERT INTO `messages` VALUES (56, 11, 2, '111', '2025-03-07 15:10:32', 14);
INSERT INTO `messages` VALUES (57, 11, 2, '11111', '2025-03-07 15:10:43', 14);
INSERT INTO `messages` VALUES (58, 11, 2, '士大夫但是', '2025-03-07 15:11:19', 14);
INSERT INTO `messages` VALUES (59, 11, 2, '2222呃呃', '2025-03-07 15:11:29', 14);
INSERT INTO `messages` VALUES (60, 11, 2, '啊实打实', '2025-03-07 15:11:34', 14);
INSERT INTO `messages` VALUES (61, 11, 2, '的非法手段', '2025-03-07 15:13:28', 14);
INSERT INTO `messages` VALUES (62, 11, 2, '范德萨发', '2025-03-07 15:13:36', 14);
INSERT INTO `messages` VALUES (63, 11, 2, '范德萨发', '2025-03-07 15:13:41', 14);
INSERT INTO `messages` VALUES (64, 11, 2, '反对法反对', '2025-03-07 15:13:44', 14);
INSERT INTO `messages` VALUES (65, 11, 2, '111111', '2025-03-07 15:33:50', 14);
INSERT INTO `messages` VALUES (66, 11, 2, '111', '2025-03-07 15:36:17', 14);
INSERT INTO `messages` VALUES (67, 11, 2, '2222', '2025-03-07 15:37:44', 14);
INSERT INTO `messages` VALUES (68, 11, 2, '2222', '2025-03-07 15:37:53', 14);
INSERT INTO `messages` VALUES (69, 11, 2, 'SDD', '2025-03-07 15:38:04', 14);
INSERT INTO `messages` VALUES (70, 11, 2, '热热热', '2025-03-07 15:42:46', 14);
INSERT INTO `messages` VALUES (71, 11, 2, '让他人', '2025-03-07 15:43:12', 14);
INSERT INTO `messages` VALUES (72, 2, 11, '而热热', '2025-03-07 15:43:51', 14);
INSERT INTO `messages` VALUES (73, 2, 11, '苟富贵高', '2025-03-07 15:43:56', 14);

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderNum` char(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `surfacePicture` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `price` double NULL DEFAULT NULL,
  `createTime` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `payTime` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `sellerId` int NULL DEFAULT NULL,
  `buyerId` int NULL DEFAULT NULL,
  `addressId` int NULL DEFAULT NULL,
  `goodsId` int NULL DEFAULT NULL,
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `orderState` int NULL DEFAULT 1,
  `comment` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sellerId`(`sellerId` ASC) USING BTREE,
  INDEX `buyerId`(`buyerId` ASC) USING BTREE,
  INDEX `addressId`(`addressId` ASC) USING BTREE,
  INDEX `goodsId`(`goodsId` ASC) USING BTREE,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`sellerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`buyerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`addressId`) REFERENCES `useraddress` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`goodsId`) REFERENCES `goods` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (1, 'ORD17406325', 'http://localhost:3000//goodsPic/1740149590701.png', 'Vue生命周期', 199, '2025-02-27T05:02:44.669+00:00', '2025-02-27T05:02:48.651+00:00', 11, 2, 1, 9, '', 1, NULL);
INSERT INTO `orders` VALUES (3, 'ORD1740653208257921', 'http://localhost:3000//goodsPic/1740149902841.png', '代码魔兽', 2229, '2025-02-27T10:46:48.258+00:00', '2025-02-27T10:47:03.553+00:00', 2, 2, 1, 11, '', 2, NULL);
INSERT INTO `orders` VALUES (4, 'ORD1740653600279514', 'http://localhost:3000/goodsPic/1740148833068.jpg', '震惊的灰', 112, '2025-02-27T10:53:20.279+00:00', '2025-02-27T10:53:24.435+00:00', 2, 2, 1, 8, '', 3, '12323');
INSERT INTO `orders` VALUES (5, 'ORD1740653827497175', 'http://localhost:3000//goodsPic/1740150018734.png', '的说法是', 33, '2025-02-27T10:57:07.497+00:00', '2025-02-27T10:57:11.720+00:00', 2, 2, 1, 12, '', 1, NULL);

-- ----------------------------
-- Table structure for shopcar
-- ----------------------------
DROP TABLE IF EXISTS `shopcar`;
CREATE TABLE `shopcar`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `price` double(11, 2) NULL DEFAULT NULL,
  `goodsSurface` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `buyerId` int NULL DEFAULT NULL,
  `sellerId` int NULL DEFAULT NULL,
  `sellerName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `sellerImg` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `goodsId` int NULL DEFAULT NULL,
  `content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `userId`(`sellerId` ASC) USING BTREE,
  INDEX `buyerId`(`buyerId` ASC) USING BTREE,
  INDEX `goodsId`(`goodsId` ASC) USING BTREE,
  CONSTRAINT `shopcar_ibfk_1` FOREIGN KEY (`sellerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `shopcar_ibfk_2` FOREIGN KEY (`buyerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `shopcar_ibfk_3` FOREIGN KEY (`goodsId`) REFERENCES `goods` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shopcar
-- ----------------------------
INSERT INTO `shopcar` VALUES (3, '简历制作', 12.00, 'http://localhost:3000//goodsPic/1740149807515.jpg', 2, 11, 'nginx', 'http://localhost:3000/userHeadPhotos/defaultUser.png', 10, '今天只卖这个价');
INSERT INTO `shopcar` VALUES (7, '内心反复', 11.99, 'http://localhost:3000/goodsPic/brage.png', 2, 1, 'admin', 'http://localhost:3000/userHeadPhotos/1739880989898.png', 2, '我们的故事要完结了');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `accountId` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `userName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `sex` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `age` int NULL DEFAULT NULL,
  `headImg` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `introduction` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `resident` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `userType` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique`(`userName` ASC, `accountId` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, '00000001', 'admin', '1234', '1', 22, 'http://localhost:3000/userHeadPhotos/1739880989898.png', '这是没有描述的描述', '江苏省偷乐星球', 'admin');
INSERT INTO `user` VALUES (2, '00000002', 'ningcc', '1234', '0', 24, 'http://localhost:3000/userHeadPhotos/1740731324509.png', '哈哈哈，还没有想好', '偷乐星球222', 'user');
INSERT INTO `user` VALUES (11, '00000003', 'nginx', '1111', '1', NULL, 'http://localhost:3000/userHeadPhotos/1741075746481.png', NULL, NULL, 'user');
INSERT INTO `user` VALUES (12, '00000004', 'ning', '1234', '0', NULL, 'http://localhost:3000/userHeadPhotos/defaultUser.png', NULL, NULL, 'user');

-- ----------------------------
-- Table structure for useraddress
-- ----------------------------
DROP TABLE IF EXISTS `useraddress`;
CREATE TABLE `useraddress`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `userId` int NULL DEFAULT NULL,
  `isDefault` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `userId`(`userId` ASC) USING BTREE,
  CONSTRAINT `useraddress_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of useraddress
-- ----------------------------
INSERT INTO `useraddress` VALUES (1, 'suNing', '1234123456', '江苏省常州市武进区鸣新中路', 2, 1);
INSERT INTO `useraddress` VALUES (4, 'wqqw1', '222222221', '梅兰东路8号1', 2, 0);

-- ----------------------------
-- Triggers structure for table user
-- ----------------------------
DROP TRIGGER IF EXISTS `before_insert_user`;
delimiter ;;
CREATE TRIGGER `before_insert_user` BEFORE INSERT ON `user` FOR EACH ROW BEGIN
    DECLARE last_account CHAR(8);
    DECLARE new_account CHAR(8);

    -- 获取当前最大的账号
    SELECT MAX(accountId) INTO last_account FROM user;

    -- 如果表中没有数据，则从 '00000001' 开始
    IF last_account IS NULL THEN
        SET new_account = '00000001';
    ELSE
        -- 将账号转换为整数并加1，然后再转换回字符串
        SET new_account = LPAD(CAST(CAST(last_account AS UNSIGNED) + 1 AS CHAR), 8, '0');
    END IF;

    -- 设置新记录的账号
    SET NEW.accountId = new_account;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
