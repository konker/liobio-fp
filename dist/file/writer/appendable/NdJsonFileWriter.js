"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ndJsonFileWriter = void 0;
var FileWriter_1 = require("../FileWriter");
var AppendableFileWriter_1 = require("./AppendableFileWriter");
/**
 * Write the given data to the file
 *
 * Data is serialized as JSON based on the assumption that
 * the data param represents one line in the target NDJSON file
 *
 * @param fp - The stream to write to
 * @param data - The data to write, representing one line in the target NDJSON files
 */
function _write(fp, data) {
    return (0, FileWriter_1.write)(fp, JSON.stringify(data) + '\n');
}
function ndJsonFileWriter() {
    return {
        open: FileWriter_1.open,
        openForAppend: AppendableFileWriter_1.openForAppend,
        write: _write,
        close: FileWriter_1.close,
    };
}
exports.ndJsonFileWriter = ndJsonFileWriter;
