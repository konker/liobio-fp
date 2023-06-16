"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFileWriter = void 0;
var FileWriter_1 = require("../FileWriter");
var AppendableFileWriter_1 = require("./AppendableFileWriter");
/**
 * Default implementation of FileWriter for string | Buffer
 */
function defaultFileWriter() {
    return {
        open: FileWriter_1.open,
        openForAppend: AppendableFileWriter_1.openForAppend,
        write: FileWriter_1.write,
        close: FileWriter_1.close,
    };
}
exports.defaultFileWriter = defaultFileWriter;
