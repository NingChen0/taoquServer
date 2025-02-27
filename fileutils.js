const fs = require("fs");
const path = require("path");
const fileOperaton = {
    deleteImageFromFileSystem,
    moveImageToNewDirectory,
};
//删除文件
function deleteImageFromFileSystem(filePath) {
    const localFilePath = filePath;
    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath); // 删除文件
        console.log("删除文件:", filePath);
    } else {
        console.warn("文件不存在:", filePath);
    }
}
//移动图片
function moveImageToNewDirectory(oldPath, newPath) {
    const localOldPath = oldPath;
    const localNewPath = newPath;
    if (fs.existsSync(localOldPath)) {
        fs.renameSync(localOldPath, localNewPath); // 移动文件
        console.log("移动文件:", oldPath, "到", newPath);
    } else {
        console.warn("文件不存在:", oldPath);
    }
}
//将接口暴露出去
module.exports = fileOperaton;
