"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseDependentWritableStream = void 0;
var stream_1 = require("stream");
/**
 * A Writable stream which can have an external promise injected into it.
 * The purpose of this is so that the stream can be kept alive until the promise resolves.
 */
var PromiseDependentWritableStream = /** @class */ (function (_super) {
    __extends(PromiseDependentWritableStream, _super);
    function PromiseDependentWritableStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PromiseDependentWritableStream;
}(stream_1.PassThrough));
exports.PromiseDependentWritableStream = PromiseDependentWritableStream;
