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
exports.Random_ = exports.Console_ = exports.Json_ = exports.Foldable_ = exports.Apply_ = exports.Eq_ = exports.Ord_ = exports.Refinement_ = exports.Monoid_ = exports.Magma_ = exports.ReaderTaskEither_ = exports.ReaderTask_ = exports.ReaderEither_ = exports.Reader_ = exports.TaskThese_ = exports.TaskEither_ = exports.TaskOption_ = exports.Task_ = exports.IOEither_ = exports.IO_ = exports.both = exports.These_ = exports.right = exports.left = exports.Either_ = exports.some = exports.none = exports.Option_ = exports.Identity_ = exports.NonEmptyArray_ = exports.struct_ = exports.Record_ = exports.Tuple_ = exports.Set_ = exports.Array_ = exports.number_ = exports.boolean_ = exports.Predicate_ = exports.function_ = exports.void_ = exports.string_ = exports.absurd = exports.identity = exports.flow = exports.pipe = void 0;
var function_1 = require("fp-ts/lib/function");
Object.defineProperty(exports, "pipe", { enumerable: true, get: function () { return function_1.pipe; } });
Object.defineProperty(exports, "flow", { enumerable: true, get: function () { return function_1.flow; } });
Object.defineProperty(exports, "identity", { enumerable: true, get: function () { return function_1.identity; } });
Object.defineProperty(exports, "absurd", { enumerable: true, get: function () { return function_1.absurd; } });
exports.string_ = __importStar(require("fp-ts/lib/string"));
exports.void_ = __importStar(require("fp-ts/void"));
exports.function_ = __importStar(require("fp-ts/lib/function"));
exports.Predicate_ = __importStar(require("fp-ts/lib/Predicate"));
exports.boolean_ = __importStar(require("fp-ts/lib/boolean"));
exports.number_ = __importStar(require("fp-ts/lib/number"));
exports.Array_ = __importStar(require("fp-ts/lib/Array"));
exports.Set_ = __importStar(require("fp-ts/lib/Set"));
exports.Tuple_ = __importStar(require("fp-ts/lib/Tuple"));
exports.Record_ = __importStar(require("fp-ts/lib/Record"));
exports.struct_ = __importStar(require("fp-ts/lib/struct"));
exports.NonEmptyArray_ = __importStar(require("fp-ts/lib/NonEmptyArray"));
exports.Identity_ = __importStar(require("fp-ts/lib/Identity"));
exports.Option_ = __importStar(require("fp-ts/lib/Option"));
var Option_1 = require("fp-ts/lib/Option");
Object.defineProperty(exports, "none", { enumerable: true, get: function () { return Option_1.none; } });
var Option_2 = require("fp-ts/lib/Option");
Object.defineProperty(exports, "some", { enumerable: true, get: function () { return Option_2.some; } });
exports.Either_ = __importStar(require("fp-ts/lib/Either"));
var Either_1 = require("fp-ts/lib/Either");
Object.defineProperty(exports, "left", { enumerable: true, get: function () { return Either_1.left; } });
var Either_2 = require("fp-ts/lib/Either");
Object.defineProperty(exports, "right", { enumerable: true, get: function () { return Either_2.right; } });
exports.These_ = __importStar(require("fp-ts/lib/These"));
var These_1 = require("fp-ts/lib/These");
Object.defineProperty(exports, "both", { enumerable: true, get: function () { return These_1.both; } });
exports.IO_ = __importStar(require("fp-ts/lib/IO"));
exports.IOEither_ = __importStar(require("fp-ts/lib/IOEither"));
exports.Task_ = __importStar(require("fp-ts/lib/Task"));
exports.TaskOption_ = __importStar(require("fp-ts/lib/TaskOption"));
exports.TaskEither_ = __importStar(require("fp-ts/lib/TaskEither"));
exports.TaskThese_ = __importStar(require("fp-ts/lib/TaskThese"));
exports.Reader_ = __importStar(require("fp-ts/lib/Reader"));
exports.ReaderEither_ = __importStar(require("fp-ts/lib/ReaderEither"));
exports.ReaderTask_ = __importStar(require("fp-ts/lib/ReaderTask"));
exports.ReaderTaskEither_ = __importStar(require("fp-ts/lib/ReaderTaskEither"));
exports.Magma_ = __importStar(require("fp-ts/lib/Magma"));
exports.Monoid_ = __importStar(require("fp-ts/lib/Monoid"));
exports.Refinement_ = __importStar(require("fp-ts/lib/Refinement"));
exports.Ord_ = __importStar(require("fp-ts/lib/Ord"));
exports.Eq_ = __importStar(require("fp-ts/lib/Eq"));
exports.Apply_ = __importStar(require("fp-ts/lib/Apply"));
exports.Foldable_ = __importStar(require("fp-ts/lib/Foldable"));
exports.Json_ = __importStar(require("fp-ts/lib/Json"));
exports.Console_ = __importStar(require("fp-ts/lib/Console"));
exports.Random_ = __importStar(require("fp-ts/lib/Random"));
