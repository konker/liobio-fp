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
exports.s3DataAccessor = void 0;
var S3 = __importStar(require("@aws-sdk/client-s3"));
var path_1 = __importDefault(require("path"));
var P = __importStar(require("../../prelude"));
var types_1 = require("../../types");
var s3Utils = __importStar(require("../../utils/s3-uri-utils"));
var s3_uri_utils_1 = require("../../utils/s3-uri-utils");
var lib_1 = require("./lib");
function listFiles(s3url) {
    var _this = this;
    function _processListing(parsed, list, key) {
        if (!list)
            return [];
        return (list
            // Drop any bad keys
            .filter(function (item) { return item[key]; })
            .map(
        // Extract the last part of the path relative to the prefix
        function (item) { return relative(parsed.Path, item[key]).split(path_1.default.posix.sep).shift(); })
            .filter(function (item) { return item !== ''; })
            .map(
        // Convert each item to full S3 url
        function (item) { return s3Utils.createS3Url(parsed.Bucket, parsed.Path, item); }));
    }
    return function (model) {
        return P.pipe(s3Utils.parseS3Url(s3url), P.Either_.chain(P.Either_.fromPredicate(s3_uri_utils_1.s3UrlDataIsDirectory, function () {
            return (0, types_1.toErr)('[S3DataAccessor] Cannot list files with a non-directory url');
        })), P.Task_.of, P.TaskEither_.chain(function (parsed) {
            return P.pipe(model, (0, lib_1.s3ListObjects)(parsed), P.TaskEither_.chain(function (allFiles) {
                return P.pipe(P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (allFiles.IsTruncated) {
                            throw new Error("[S3DataAccessor] Error: listing is truncated: ".concat(s3url));
                        }
                        return [2 /*return*/, _processListing(parsed, allFiles.CommonPrefixes, 'Prefix').concat(_processListing(parsed, allFiles.Contents, 'Key'))];
                    });
                }); }, types_1.toErr));
            }));
        }));
    };
}
function getFileType(s3url) {
    return P.pipe(s3Utils.parseS3Url(s3url), P.Either_.map(function (parsed) { return parsed.Type; }), P.Task_.of);
}
function exists(s3url) {
    return P.pipe(s3Utils.parseS3Url(s3url), P.ReaderTask_.of, P.ReaderTaskEither_.chain(lib_1.s3HeadObject), P.ReaderTaskEither_.orElse(function (ex) {
        var _a;
        return ((_a = ex['$metadata']) === null || _a === void 0 ? void 0 : _a.httpStatusCode) === 404
            ? P.ReaderTaskEither_.right(false)
            : P.ReaderTaskEither_.left((0, types_1.toErr)(ex));
    }));
}
function deleteFile(s3url) {
    return P.pipe(s3Utils.parseS3Url(s3url), P.Either_.chain(P.Either_.fromPredicate(s3_uri_utils_1.s3UrlDataIsFile, function () {
        return (0, types_1.toErr)('[S3DataAccessor] Cannot delete a file with a directory url');
    })), P.ReaderTask_.of, P.ReaderTaskEither_.chain(lib_1.s3DeleteObject));
}
function createDirectory(s3url) {
    return P.pipe(s3Utils.parseS3Url(s3url), P.Either_.chain(P.Either_.fromPredicate(s3_uri_utils_1.s3UrlDataIsDirectory, function () {
        return (0, types_1.toErr)('[S3DataAccessor] Cannot create a directory with a non-directory url');
    })), P.ReaderTask_.of, P.ReaderTaskEither_.chain(lib_1.s3PutObject));
}
function removeDirectory(s3url) {
    function _purgeItem(s3ItemUrl) {
        return P.pipe(getFileType(s3ItemUrl), P.Reader_.of, P.ReaderTaskEither_.chain(function (fileType) {
            return fileType === types_1.FileType.Directory ? removeDirectory(s3ItemUrl) : deleteFile(s3ItemUrl);
        }));
    }
    return P.pipe(
    // Remove contents of the directory
    listFiles(s3url), P.ReaderTaskEither_.chain(function (dirContent) {
        return P.pipe(dirContent, P.Array_.map(_purgeItem), P.Array_.sequence(P.ReaderTaskEither_.ApplicativePar), P.ReaderTaskEither_.map(P.Monoid_.concatAll(P.void_.Monoid)));
    }), 
    // Remove the directory itself.
    // No need to check if is a Directory url, as listFiles will have already failed
    P.ReaderTaskEither_.chain(function (_void) {
        return P.pipe(s3Utils.parseS3Url(s3url), P.ReaderTask_.of, P.ReaderTaskEither_.chain(lib_1.s3DeleteObject));
    }));
}
function getFileReadStream(s3url) {
    return P.pipe(s3Utils.parseS3Url(s3url), P.Either_.chain(P.Either_.fromPredicate(s3_uri_utils_1.s3UrlDataIsFile, function () { return (0, types_1.toErr)('[S3DataAccessor] Cannot read a file with a non-file url'); })), P.ReaderTask_.of, P.ReaderTaskEither_.chain(lib_1.s3GetObjectReadStream));
}
function getFileLineReadStream(s3url) {
    return P.pipe(getFileReadStream(s3url), P.Reader_.map(P.TaskEither_.chain(function (x) {
        return (0, lib_1.readlineInterfaceFromReadStream)(x);
    })));
}
function getFileWriteStream(s3url) {
    return P.pipe(s3Utils.parseS3Url(s3url), P.Either_.chain(P.Either_.fromPredicate(s3_uri_utils_1.s3UrlDataIsFile, function () {
        return (0, types_1.toErr)('[S3DataAccessor] Cannot write to a file with a non-file url');
    })), P.ReaderTask_.of, P.ReaderTaskEither_.chain(lib_1.s3GetObjectWriteStream));
}
function dirName(filePath) {
    return P.pipe(s3Utils.parseS3Url(filePath), P.Either_.map(function (parsed) { return (0, s3_uri_utils_1.createS3Url)(parsed.Bucket, parsed.Path); }), P.Task_.of);
}
function fileName(filePath) {
    return P.pipe(s3Utils.parseS3Url(filePath), P.Either_.map(function (parsed) { return P.pipe(parsed.File, P.Option_.fromNullable); }), P.Task_.of);
}
function joinPath() {
    var _a;
    var parts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parts[_i] = arguments[_i];
    }
    if (!parts[0])
        return P.Either_.right('');
    return parts[0].startsWith(s3Utils.S3_PROTOCOL)
        ? P.pipe(s3Utils.parseS3Url(parts[0]), P.Either_.map(function (parsed) {
            var _a;
            return s3Utils.createS3Url(parsed.Bucket, (_a = path_1.default.posix).join.apply(_a, __spreadArray([parsed.FullPath], __read(parts.slice(1)), false)));
        }))
        : P.Either_.of((_a = path_1.default.posix).join.apply(_a, __spreadArray([], __read(parts), false)));
}
function relative(from, to) {
    return path_1.default.posix.relative(from, to);
}
function extname(filePath) {
    return path_1.default.posix.extname(filePath);
}
function s3DataAccessor() {
    var _this = this;
    return function () { return __awaiter(_this, void 0, void 0, function () {
        var model;
        return __generator(this, function (_a) {
            model = {
                s3: new S3.S3Client(Object.assign({}, process.env.AWS_REGION ? { region: process.env.AWS_REGION } : {})),
            };
            return [2 /*return*/, {
                    PATH_SEP: path_1.default.posix.sep,
                    ID: 'S3DataAccessor',
                    // Eliminate the Readers by using the created model
                    listFiles: P.flow(listFiles, function (r) { return r(model); }),
                    getFileType: getFileType,
                    exists: P.flow(exists, function (r) { return r(model); }),
                    deleteFile: P.flow(deleteFile, function (r) { return r(model); }),
                    createDirectory: P.flow(createDirectory, function (r) { return r(model); }),
                    removeDirectory: P.flow(removeDirectory, function (r) { return r(model); }),
                    getFileReadStream: P.flow(getFileReadStream, function (r) { return r(model); }),
                    getFileLineReadStream: P.flow(getFileLineReadStream, function (r) { return r(model); }),
                    getFileWriteStream: P.flow(getFileWriteStream, function (r) { return r(model); }),
                    dirName: dirName,
                    fileName: fileName,
                    joinPath: joinPath,
                    relative: relative,
                    extname: extname,
                }];
        });
    }); };
}
exports.s3DataAccessor = s3DataAccessor;
