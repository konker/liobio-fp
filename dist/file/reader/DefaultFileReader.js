"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFileReader = void 0;
function read(dataAccessor, filePath) {
    return dataAccessor.readFile(filePath);
}
/**
 * Default implementation of FileReader
 *
 * Reads the entire contents of a file into a Buffer.
 */
function defaultFileReader() {
    return {
        read: read,
    };
}
exports.defaultFileReader = defaultFileReader;
