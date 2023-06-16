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
exports.fileCopier = void 0;
var P = __importStar(require("../prelude"));
var PromiseDependentWritableStream_1 = require("../stream/PromiseDependentWritableStream");
var stream_1 = require("../utils/stream");
/**
 * High level read stream -> write stream logic
 *
 * @param fromDataAccessor
 * @param fromFile
 * @param toDataAccessor
 * @param toFile
 */
function fileCopier(fromDataAccessor, fromFile, toDataAccessor, toFile) {
    return P.pipe(P.TaskEither_.Do, P.TaskEither_.bind('readStream', function () { return fromDataAccessor.getFileReadStream(fromFile); }), P.TaskEither_.bind('writeStream', function () { return toDataAccessor.getFileWriteStream(toFile); }), P.TaskEither_.chain(function (_a) {
        var readStream = _a.readStream, writeStream = _a.writeStream;
        if (writeStream instanceof PromiseDependentWritableStream_1.PromiseDependentWritableStream) {
            return (0, stream_1.waitForPromiseDependentStreamPipe)(readStream, writeStream);
        }
        return (0, stream_1.waitForStreamPipe)(readStream, writeStream);
    }));
}
exports.fileCopier = fileCopier;
