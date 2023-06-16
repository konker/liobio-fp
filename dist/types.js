"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toErr = exports.fileTypeIsOther = exports.fileTypeIsFile = exports.fileTypeIsDirectory = exports.FileType = void 0;
var error_1 = require("./utils/error");
var FileType;
(function (FileType) {
    FileType["Directory"] = "Directory";
    FileType["File"] = "File";
    FileType["Other"] = "Other";
})(FileType = exports.FileType || (exports.FileType = {}));
function fileTypeIsDirectory(fileType) {
    return fileType === FileType.Directory;
}
exports.fileTypeIsDirectory = fileTypeIsDirectory;
function fileTypeIsFile(fileType) {
    return fileType === FileType.File;
}
exports.fileTypeIsFile = fileTypeIsFile;
function fileTypeIsOther(fileType) {
    return fileType === FileType.Other;
}
exports.fileTypeIsOther = fileTypeIsOther;
exports.toErr = error_1.toLibError;
