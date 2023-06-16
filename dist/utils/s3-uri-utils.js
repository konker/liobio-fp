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
exports.createHttpsUrl = exports.isS3File = exports.isS3Url = exports.parseS3Url = exports.createS3Url = exports.trimSlash = exports.s3UrlDataIsFile = exports.s3UrlDataIsDirectory = exports.S3_PROTOCOL = void 0;
var client_s3_1 = require("@aws-sdk/client-s3");
var s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
var path_1 = __importDefault(require("path"));
var url_1 = require("url");
var P = __importStar(require("../prelude"));
var types_1 = require("../types");
exports.S3_PROTOCOL = 's3:';
var FILE_EXT_RE = /\.[^.]+$/;
var SLASH = '';
function s3UrlDataIsDirectory(parsed) {
    return parsed.Type === types_1.FileType.Directory;
}
exports.s3UrlDataIsDirectory = s3UrlDataIsDirectory;
function s3UrlDataIsFile(parsed) {
    return parsed.Type === types_1.FileType.File;
}
exports.s3UrlDataIsFile = s3UrlDataIsFile;
/**
 * Trim a trailing slash, if present
 *
 * @param s
 */
function trimSlash(s) {
    return s.endsWith(path_1.default.posix.sep) ? s.slice(0, -1) : s;
}
exports.trimSlash = trimSlash;
/**
 * Create an S3 URL from the given parts
 *
 * @param bucket
 * @param [dirPath]
 * @param [part]
 */
function createS3Url(bucket, dirPath, part) {
    return "".concat(exports.S3_PROTOCOL, "//").concat(path_1.default.posix.join(bucket, dirPath || '/', part || ''));
}
exports.createS3Url = createS3Url;
/**
 * Parse an S3 URL into its constituent parts
 *
 * @param {S3Url} s3url
 */
function parseS3Url(s3url) {
    return P.Either_.tryCatch(function () {
        var parsed = { protocol: '', host: '', pathname: '' };
        try {
            var u = new url_1.URL(s3url);
            parsed.protocol = u.protocol;
            parsed.host = u.host;
            parsed.pathname = u.pathname;
        }
        catch (ex) {
            throw new TypeError("[s3-uri-utils] Could not parse: ".concat(s3url));
        }
        if (parsed.protocol !== exports.S3_PROTOCOL) {
            throw new TypeError("[s3-uri-utils] Incorrect protocol, expected ".concat(exports.S3_PROTOCOL, ": ").concat(s3url));
        }
        if (!parsed.host) {
            throw new TypeError("[s3-uri-utils] Could not determine bucket name: ".concat(s3url));
        }
        if (parsed.host !== parsed.host.toLowerCase()) {
            throw new TypeError("[s3-uri-utils] S3 URLs must have a lower case bucket component (note that S3 itself is case sensitive): ".concat(s3url));
        }
        parsed.pathname = parsed.pathname || '/';
        if (parsed.pathname.endsWith(path_1.default.posix.sep)) {
            parsed.pathname = parsed.pathname.slice(0, -1);
        }
        if (parsed.pathname.startsWith(path_1.default.posix.sep)) {
            parsed.pathname = parsed.pathname.slice(1);
        }
        var parts = parsed.pathname.split(path_1.default.posix.sep);
        var lastPart = parts.pop() || '';
        var fileComponent = isS3File(lastPart) ? lastPart : undefined;
        if (!fileComponent) {
            parts.push(lastPart);
        }
        if (parts.length > 0 && parts[0] !== SLASH)
            parts.push(SLASH);
        var pathComponent = parts.join(path_1.default.posix.sep);
        var fullPathComponent = fileComponent ? path_1.default.posix.join(pathComponent, fileComponent) : pathComponent;
        return {
            Bucket: parsed.host,
            Path: pathComponent,
            File: fileComponent,
            Type: fileComponent ? types_1.FileType.File : types_1.FileType.Directory,
            FullPath: fullPathComponent,
        };
    }, types_1.toErr);
}
exports.parseS3Url = parseS3Url;
/**
 * Test to detect if the given path is a valid S3 URL
 *
 * @param s3url
 */
function isS3Url(s3url) {
    var parsed;
    try {
        parsed = new url_1.URL(s3url);
    }
    catch (ex) {
        return false;
    }
    if (parsed.protocol !== exports.S3_PROTOCOL) {
        return false;
    }
    if (!parsed.host) {
        return false;
    }
    if (parsed.host !== parsed.host.toLowerCase()) {
        return false;
    }
    return true;
}
exports.isS3Url = isS3Url;
/**
 * Test a string to detect if it is a file path
 *
 * @param part
 */
function isS3File(part) {
    return part.match(FILE_EXT_RE) !== null;
}
exports.isS3File = isS3File;
/**
 * Get a temporary signed access URL for the given S3 resource
 *
 * @param {S3Client} s3Client
 * @param {S3IoUrl} s3url
 */
function createHttpsUrl(s3Client, s3url) {
    var _this = this;
    return P.pipe(parseS3Url(s3url), P.TaskEither_.fromEither, P.TaskEither_.chain(function (parts) {
        return P.TaskEither_.tryCatch(function () { return __awaiter(_this, void 0, void 0, function () {
            var cmd;
            return __generator(this, function (_a) {
                cmd = new client_s3_1.GetObjectCommand({ Bucket: parts.Bucket, Key: parts.FullPath });
                return [2 /*return*/, (0, s3_request_presigner_1.getSignedUrl)(s3Client, cmd)];
            });
        }); }, types_1.toErr);
    }));
}
exports.createHttpsUrl = createHttpsUrl;
