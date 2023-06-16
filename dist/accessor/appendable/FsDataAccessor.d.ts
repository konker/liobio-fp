/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import _fs from 'fs';
import _path from 'path';
import _readline from 'readline';
import type { Readable, Writable } from 'stream';
import * as P from '../../prelude';
import type { DirectoryPath, Err, FileName, Path } from '../../types';
import { FileType } from '../../types';
import type { AppendableDataAccessor } from './AppendableDataAccessor';
declare type Model = {
    readonly fs: typeof _fs;
    readonly path: typeof _path;
    readonly readline: typeof _readline;
};
export declare function listFiles(dirPath: string): P.ReaderTaskEither<Model, Err, Array<Path>>;
export declare function getFileType(filePath: string): P.ReaderTaskEither<Model, Err, FileType>;
export declare function exists(fileOrDirPath: string): P.ReaderTaskEither<Model, Err, boolean>;
export declare function deleteFile(filePath: string): P.ReaderTaskEither<Model, Err, void>;
export declare function createDirectory(dirPath: string): P.ReaderTaskEither<Model, Err, void>;
export declare function removeDirectory(dirPath: string): P.ReaderTaskEither<Model, Err, void>;
export declare function getFileReadStream(filePath: string): P.ReaderTaskEither<Model, Err, Readable>;
export declare function getFileLineReadStream(filePath: string): P.ReaderTaskEither<Model, Err, _readline.Interface>;
export declare function getFileWriteStream(filePath: string): P.ReaderTaskEither<Model, Err, Writable>;
export declare function getFileAppendWriteStream(filePath: string): P.ReaderTaskEither<Model, Err, Writable>;
export declare function dirName(filePath: string): P.ReaderTaskEither<Model, Err, DirectoryPath>;
export declare function fileName(filePath: string): P.ReaderTaskEither<Model, Err, P.Option<FileName>>;
export declare function joinPath(...parts: Array<string>): P.ReaderEither<Model, Err, Path>;
export declare function relative(from: string, to: string): P.Reader<Model, Path>;
export declare function extname(filePath: string): P.Reader<Model, string>;
export declare function fsDataAccessor(): P.Task<AppendableDataAccessor>;
export {};
