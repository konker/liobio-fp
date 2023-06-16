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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvFileReader = exports.__read = void 0;
var csv_parse_1 = __importDefault(require("csv-parse"));
var P = __importStar(require("../../prelude"));
var types_1 = require("../../types");
function __read(dataAccessor, filePath) {
    return function (_a) {
        var csvOptions = _a.csvOptions;
        return P.pipe(dataAccessor.getFileReadStream(filePath), P.TaskEither_.chain(function (readable) {
            return P.TaskEither_.tryCatch(function () {
                return new Promise(function (resolve, reject) {
                    readable.pipe((0, csv_parse_1.default)(csvOptions, function (err, csvData) {
                        if (err)
                            reject(err);
                        resolve(csvData);
                    }));
                });
            }, types_1.toErr);
        }));
    };
}
exports.__read = __read;
function _read(dataAccessor, filePath) {
    return __read(dataAccessor, filePath);
}
/**
 * CSV file implementation of IFileReader
 *
 * Reads in an entire CSV file via a read stream,
 * and returns an array of records, each record being an array of strings
 */
function csvFileReader(csvOptions) {
    var model = {
        csvOptions: csvOptions,
    };
    return {
        read: P.flow(_read, function (r) { return r(model); }),
    };
}
exports.csvFileReader = csvFileReader;
