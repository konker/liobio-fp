"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonFileWriter = void 0;
var FileWriter_1 = require("./FileWriter");
/**
 * Write the given data to the file, serialized as JSON
 */
function _write(fp, data) {
    return (0, FileWriter_1.write)(fp, JSON.stringify(data));
}
/**
 * JSON file implementation of FileWriter
 */
function jsonFileWriter() {
    return {
        open: FileWriter_1.open,
        write: _write,
        close: FileWriter_1.close,
    };
}
exports.jsonFileWriter = jsonFileWriter;
