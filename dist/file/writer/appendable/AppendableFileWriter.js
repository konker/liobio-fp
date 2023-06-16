"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openForAppend = void 0;
/**
 * Default implementation of openForAppend
 *
 * @param dataAccessor
 * @param filePath
 */
function openForAppend(dataAccessor, filePath) {
    return dataAccessor.getFileAppendWriteStream(filePath);
}
exports.openForAppend = openForAppend;
