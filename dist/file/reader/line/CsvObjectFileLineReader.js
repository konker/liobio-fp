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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvObjectFileLineReader = void 0;
var sync_1 = __importDefault(require("csv-parse/lib/sync"));
var lodash_zipobject_1 = __importDefault(require("lodash.zipobject"));
var P = __importStar(require("../../../prelude"));
var error_1 = require("../../../utils/error");
var FileLineReader_1 = require("./FileLineReader");
/**
 * Open the given CSV file for reading
 *
 * The async generator can be used to consume the file content, line by line.
 * Each line is returned as an object keyed by the columns names.
 * This assumes that the first line holds the column names.
 *
 * @param dataAccessor
 * @param filePath - The full path of the file to read
 */
function _open(dataAccessor, filePath) {
    return function (_a) {
        var csvOptions = _a.csvOptions;
        return P.pipe(dataAccessor.getFileLineReadStream(filePath), P.TaskEither_.map(function (fp) { return ({
            fp: fp,
            gen: (function () {
                return __asyncGenerator(this, arguments, function () {
                    var headers, first, _loop_1, fp_1, fp_1_1, e_1_1;
                    var e_1, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                first = true;
                                _b.label = 1;
                            case 1:
                                _b.trys.push([1, 7, 8, 13]);
                                _loop_1 = function () {
                                    var line, definedHeaders_1;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0:
                                                line = fp_1_1.value;
                                                if (!first) return [3 /*break*/, 1];
                                                headers = P.Either_.tryCatch(function () { return (0, sync_1.default)(line, csvOptions).pop(); }, error_1.toLibError);
                                                first = false;
                                                return [3 /*break*/, 4];
                                            case 1:
                                                if (!headers) return [3 /*break*/, 4];
                                                definedHeaders_1 = headers;
                                                return [4 /*yield*/, __await(P.pipe(P.Either_.Do, P.Either_.bind('headerRecord', function () { return definedHeaders_1; }), P.Either_.bind('record', function () {
                                                        return P.Either_.tryCatch(function () { return (0, sync_1.default)(line, csvOptions).pop(); }, error_1.toLibError);
                                                    }), P.Either_.map(function (_a) {
                                                        var headerRecord = _a.headerRecord, record = _a.record;
                                                        return (0, lodash_zipobject_1.default)(headerRecord, record);
                                                    })))];
                                            case 2: return [4 /*yield*/, _c.sent()];
                                            case 3:
                                                _c.sent();
                                                _c.label = 4;
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                };
                                fp_1 = __asyncValues(fp);
                                _b.label = 2;
                            case 2: return [4 /*yield*/, __await(fp_1.next())];
                            case 3:
                                if (!(fp_1_1 = _b.sent(), !fp_1_1.done)) return [3 /*break*/, 6];
                                return [5 /*yield**/, _loop_1()];
                            case 4:
                                _b.sent();
                                _b.label = 5;
                            case 5: return [3 /*break*/, 2];
                            case 6: return [3 /*break*/, 13];
                            case 7:
                                e_1_1 = _b.sent();
                                e_1 = { error: e_1_1 };
                                return [3 /*break*/, 13];
                            case 8:
                                _b.trys.push([8, , 11, 12]);
                                if (!(fp_1_1 && !fp_1_1.done && (_a = fp_1.return))) return [3 /*break*/, 10];
                                return [4 /*yield*/, __await(_a.call(fp_1))];
                            case 9:
                                _b.sent();
                                _b.label = 10;
                            case 10: return [3 /*break*/, 12];
                            case 11:
                                if (e_1) throw e_1.error;
                                return [7 /*endfinally*/];
                            case 12: return [7 /*endfinally*/];
                            case 13: return [2 /*return*/];
                        }
                    });
                });
            })(),
        }); }));
    };
}
/**
 * CSV-object file implementation of IFileLineReader
 *
 * Read a CSV file one line at a time via a read stream which creates an AsyncGenerator.
 * The generator yields one line at a time as an object keyed by the column names; the column names are taken from the first line.
 */
function csvObjectFileLineReader(csvOptions) {
    var model = {
        csvOptions: csvOptions,
    };
    return {
        open: P.flow(_open, function (r) { return r(model); }),
        close: FileLineReader_1.close,
    };
}
exports.csvObjectFileLineReader = csvObjectFileLineReader;
