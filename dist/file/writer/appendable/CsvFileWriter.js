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
exports.csvFileWriter = void 0;
var sync_1 = __importDefault(require("csv-stringify/lib/sync"));
var P = __importStar(require("../../../prelude"));
var FileWriter_1 = require("../FileWriter");
var AppendableFileWriter_1 = require("./AppendableFileWriter");
/**
 * Write the given data to the file
 *
 * Data is serialized as CSV based on the assumption that
 * the data param represents one record in the target CSV file
 */
function _write(fp, data) {
    return function (_a) {
        var csvOptions = _a.csvOptions;
        return (0, FileWriter_1.write)(fp, (0, sync_1.default)([data], csvOptions));
    };
}
function csvFileWriter(csvOptions) {
    var model = {
        csvOptions: csvOptions,
    };
    return {
        open: FileWriter_1.open,
        openForAppend: AppendableFileWriter_1.openForAppend,
        write: P.flow(_write, function (r) { return r(model); }),
        close: FileWriter_1.close,
    };
}
exports.csvFileWriter = csvFileWriter;
