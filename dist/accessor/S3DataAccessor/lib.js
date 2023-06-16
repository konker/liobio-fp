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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readlineInterfaceFromReadStream = exports.s3DeleteObject = exports.s3PutObject = exports.s3GetObjectWriteStream = exports.s3GetObjectReadStream = exports.s3GetObject = exports.s3HeadObject = exports.s3ListObjects = void 0;
var client_s3_1 = require("@aws-sdk/client-s3");
var lib_storage_1 = require("@aws-sdk/lib-storage");
var buffer_1 = require("buffer");
var readline_1 = __importDefault(require("readline"));
var stream_1 = require("stream");
var web_1 = require("stream/web");
var P = __importStar(require("../../prelude"));
var PromiseDependentWritableStream_1 = require("../../stream/PromiseDependentWritableStream");
var types_1 = require("../../types");
var stream_2 = require("../../utils/stream");
function s3ListObjects(parsed) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            var cmd;
            return __generator(this, function (_a) {
                cmd = new client_s3_1.ListObjectsV2Command({
                    Bucket: parsed.Bucket,
                    Delimiter: '/',
                    Prefix: parsed.Path,
                });
                return [2 /*return*/, model.s3.send(cmd)];
            });
        }); }, types_1.toErr);
    };
}
exports.s3ListObjects = s3ListObjects;
function s3HeadObject(parsed) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            var cmd;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = new client_s3_1.HeadObjectCommand({
                            Bucket: parsed.Bucket,
                            Key: parsed.FullPath,
                        });
                        return [4 /*yield*/, model.s3.send(cmd)];
                    case 1:
                        _a.sent();
                        // If no exception has been thrown, the object exists
                        return [2 /*return*/, true];
                }
            });
        }); }, P.identity);
    };
}
exports.s3HeadObject = s3HeadObject;
function s3GetObject(parsed) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            var cmd, s3File;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = new client_s3_1.GetObjectCommand({
                            Bucket: parsed.Bucket,
                            Key: parsed.FullPath,
                        });
                        return [4 /*yield*/, model.s3.send(cmd)];
                    case 1:
                        s3File = _a.sent();
                        if (!s3File.Body)
                            return [2 /*return*/, Buffer.from([])];
                        if (s3File.Body instanceof stream_1.Readable) {
                            return [2 /*return*/, (0, stream_2.readStreamToBuffer)(s3File.Body)];
                        }
                        if (s3File.Body instanceof web_1.ReadableStream) {
                            // return readStreamToBuffer(s3File.Body);
                            throw new Error('S3 object Body is a ReadableStream');
                        }
                        if (s3File.Body instanceof buffer_1.Blob) {
                            // return s3File.Body.arrayBuffer().then(Buffer.from);
                            throw new Error('S3 object Body is a Blob');
                        }
                        throw new Error('Unknown S3 object Body type');
                }
            });
        }); }, types_1.toErr);
    };
}
exports.s3GetObject = s3GetObject;
function s3GetObjectReadStream(parsed) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            var cmd, s3File;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = new client_s3_1.GetObjectCommand({
                            Bucket: parsed.Bucket,
                            Key: parsed.FullPath,
                        });
                        return [4 /*yield*/, model.s3.send(cmd)];
                    case 1:
                        s3File = _a.sent();
                        if (s3File.Body instanceof stream_1.Readable) {
                            return [2 /*return*/, s3File.Body];
                        }
                        if (s3File.Body instanceof web_1.ReadableStream) {
                            // return s3File.Body.getReader();
                            throw new TypeError('s3GetObjectReadStream: Body is a ReadableStream');
                        }
                        if (s3File.Body instanceof buffer_1.Blob) {
                            // return new Readable().wrap(s3File.Body.stream as any as ReadableStream);
                            throw new TypeError('s3GetObjectReadStream: Body is a Blob');
                        }
                        throw new TypeError('s3GetObjectReadStream: Body is not a Readable');
                }
            });
        }); }, types_1.toErr);
    };
}
exports.s3GetObjectReadStream = s3GetObjectReadStream;
function s3GetObjectWriteStream(parsed) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            var promiseDependentWritableStream, upload;
            return __generator(this, function (_a) {
                promiseDependentWritableStream = new PromiseDependentWritableStream_1.PromiseDependentWritableStream();
                upload = new lib_storage_1.Upload({
                    client: model.s3,
                    leavePartsOnError: false,
                    params: {
                        Bucket: parsed.Bucket,
                        Key: parsed.FullPath,
                        Body: promiseDependentWritableStream,
                    },
                });
                promiseDependentWritableStream.promise = upload.done();
                return [2 /*return*/, promiseDependentWritableStream];
            });
        }); }, types_1.toErr);
    };
}
exports.s3GetObjectWriteStream = s3GetObjectWriteStream;
function s3PutObject(parsed, data) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            var input, cmd;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        input = Object.assign({
                            Bucket: parsed.Bucket,
                            Key: parsed.FullPath,
                        }, data ? { Data: data, ContentLength: data.length } : {});
                        cmd = new client_s3_1.PutObjectCommand(input);
                        return [4 /*yield*/, model.s3.send(cmd)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, types_1.toErr);
    };
}
exports.s3PutObject = s3PutObject;
function s3DeleteObject(parsed) {
    var _this = this;
    return function (model) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            var cmd;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = new client_s3_1.DeleteObjectCommand({
                            Bucket: parsed.Bucket,
                            Key: parsed.FullPath,
                        });
                        return [4 /*yield*/, model.s3.send(cmd)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, types_1.toErr);
    };
}
exports.s3DeleteObject = s3DeleteObject;
function readlineInterfaceFromReadStream(readStream) {
    var _this = this;
    return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, readline_1.default.createInterface({
                    input: readStream,
                    historySize: 0,
                    terminal: false,
                    crlfDelay: Infinity,
                    escapeCodeTimeout: 10000,
                })];
        });
    }); }, types_1.toErr);
}
exports.readlineInterfaceFromReadStream = readlineInterfaceFromReadStream;
