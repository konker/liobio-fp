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
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvObjectFileReader = void 0;
var P = __importStar(require("../../prelude"));
var CsvFileReader_1 = require("./CsvFileReader");
function _read(dataAccessor, filePath) {
    return (0, CsvFileReader_1.__read)(dataAccessor, filePath);
}
/**
 * CSV-object file reader implementation of IFileReader
 *
 * Reads in an entire CSV file via a read stream,
 * and returns an array of records, each record being an object keyed by the column names.
 * This assumes that the first record holds the column names.
 */
function csvObjectFileReader(csvOptions) {
    var model = {
        csvOptions: Object.assign({}, csvOptions, { columns: true }),
    };
    return {
        read: P.flow(_read, function (r) { return r(model); }),
    };
}
exports.csvObjectFileReader = csvObjectFileReader;
