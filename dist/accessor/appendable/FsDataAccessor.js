"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsDataAccessor = exports.extname = exports.relative = exports.joinPath = exports.fileName = exports.dirName = exports.getFileAppendWriteStream = exports.getFileWriteStream = exports.getFileLineReadStream = exports.getFileReadStream = exports.removeDirectory = exports.createDirectory = exports.deleteFile = exports.exists = exports.getFileType = exports.listFiles = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var readline_1 = __importDefault(require("readline"));
var P = __importStar(require("../../prelude"));
var types_1 = require("../../types");
function listFiles(dirPath) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            var files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, model.fs.promises.readdir(dirPath)];
                    case 1:
                        files = _a.sent();
                        return [2 /*return*/, files.map(function (file) { return model.path.join(dirPath, file); })];
                }
            });
        }); }, types_1.toErr);
    };
}
exports.listFiles = listFiles;
function getFileType(filePath) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            var stat;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, model.fs.promises.lstat(filePath)];
                    case 1:
                        stat = _a.sent();
                        if (stat.isFile())
                            return [2 /*return*/, types_1.FileType.File];
                        if (stat.isDirectory())
                            return [2 /*return*/, types_1.FileType.Directory];
                        return [2 /*return*/, types_1.FileType.Other];
                }
            });
        }); }, types_1.toErr);
    };
}
exports.getFileType = getFileType;
function exists(fileOrDirPath) {
    var _this = this;
    return function (model) { return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, model.fs.existsSync(fileOrDirPath)];
    }); }); }, types_1.toErr); };
}
exports.exists = exists;
function deleteFile(filePath) {
    var _this = this;
    return function (model) { return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, model.fs.promises.unlink(filePath)];
    }); }); }, types_1.toErr); };
}
exports.deleteFile = deleteFile;
function createDirectory(dirPath) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!model.fs.existsSync(dirPath)) return [3 /*break*/, 2];
                        return [4 /*yield*/, model.fs.promises.mkdir(dirPath, { recursive: true })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); }, types_1.toErr);
    };
}
exports.createDirectory = createDirectory;
function removeDirectory(dirPath) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!model.fs.existsSync(dirPath)) return [3 /*break*/, 2];
                        return [4 /*yield*/, model.fs.promises.rmdir(dirPath, { recursive: true })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); }, types_1.toErr);
    };
}
exports.removeDirectory = removeDirectory;
function getFileReadStream(filePath) {
    var _this = this;
    return function (model) { return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, model.fs.createReadStream(filePath)];
    }); }); }, types_1.toErr); };
}
exports.getFileReadStream = getFileReadStream;
// [FIXME:fp _readline?]
function getFileLineReadStream(filePath) {
    var _this = this;
    return function (model) {
        return P.pipe(model, getFileReadStream(filePath), P.TaskEither_.chain(function (readStream) {
            return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, model.readline.createInterface({
                            input: readStream,
                            historySize: 0,
                            terminal: false,
                            crlfDelay: Infinity,
                            escapeCodeTimeout: 10000,
                        })];
                });
            }); }, types_1.toErr);
        }));
    };
}
exports.getFileLineReadStream = getFileLineReadStream;
function getFileWriteStream(filePath) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, model.fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf-8' })];
        }); }); }, types_1.toErr);
    };
}
exports.getFileWriteStream = getFileWriteStream;
function getFileAppendWriteStream(filePath) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, model.fs.createWriteStream(filePath, { flags: 'a', encoding: 'utf-8' })];
        }); }); }, types_1.toErr);
    };
}
exports.getFileAppendWriteStream = getFileAppendWriteStream;
function dirName(filePath) {
    return function (model) {
        return P.pipe(model, getFileType(filePath), P.TaskEither_.map(function (_) { return model.path.dirname(filePath); }));
    };
}
exports.dirName = dirName;
function fileName(filePath) {
    return function (model) {
        return P.pipe(model, getFileType(filePath), P.TaskEither_.map(function (fileType) {
            return P.pipe(fileType, P.Option_.fromPredicate(types_1.fileTypeIsFile), P.Option_.map(function (_) { return model.path.basename(filePath); }));
        }));
    };
}
exports.fileName = fileName;
function joinPath() {
    var parts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parts[_i] = arguments[_i];
    }
    return function (model) {
        var _a;
        return P.Either_.of((_a = model.path).join.apply(_a, __spreadArray([], __read(parts), false)));
    };
}
exports.joinPath = joinPath;
function relative(from, to) {
    return function (model) { return model.path.relative(from, to); };
}
exports.relative = relative;
function extname(filePath) {
    return function (model) { return model.path.extname(filePath); };
}
exports.extname = extname;
function fsDataAccessor() {
    var _this = this;
    return function () { return __awaiter(_this, void 0, void 0, function () {
        var model;
        return __generator(this, function (_a) {
            model = { fs: fs_1.default, path: path_1.default, readline: readline_1.default };
            return [2 /*return*/, {
                    ID: 'FsDataAccessor',
                    PATH_SEP: path_1.default.sep,
                    // Eliminate the Readers by using the created model
                    listFiles: P.flow(listFiles, function (r) { return r(model); }),
                    getFileType: P.flow(getFileType, function (r) { return r(model); }),
                    exists: P.flow(exists, function (r) { return r(model); }),
                    deleteFile: P.flow(deleteFile, function (r) { return r(model); }),
                    createDirectory: P.flow(createDirectory, function (r) { return r(model); }),
                    removeDirectory: P.flow(removeDirectory, function (r) { return r(model); }),
                    getFileReadStream: P.flow(getFileReadStream, function (r) { return r(model); }),
                    getFileLineReadStream: P.flow(getFileLineReadStream, function (r) { return r(model); }),
                    getFileWriteStream: P.flow(getFileWriteStream, function (r) { return r(model); }),
                    getFileAppendWriteStream: P.flow(getFileAppendWriteStream, function (r) { return r(model); }),
                    dirName: P.flow(dirName, function (r) { return r(model); }),
                    fileName: P.flow(fileName, function (r) { return r(model); }),
                    joinPath: P.flow(joinPath, function (r) { return r(model); }),
                    relative: P.flow(relative, function (r) { return r(model); }),
                    extname: P.flow(extname, function (r) { return r(model); }),
                }];
        });
    }); };
}
exports.fsDataAccessor = fsDataAccessor;
