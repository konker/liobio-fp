"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLibError = void 0;
function toLibError(x) {
    return {
        message: typeof x === 'object' && x && 'message' in x ? x.message : String(x),
        cause: x,
    };
}
exports.toLibError = toLibError;
