import type * as t from 'io-ts';
import type * as P from './prelude';
import type { LibError } from './utils/error';
import { toLibError } from './utils/error';
export declare type JsonData = P.Json;
export declare type CsvData = Array<unknown>;
export declare type CsvObjectData = Record<string, unknown>;
export declare enum FileType {
    Directory = "Directory",
    File = "File",
    Other = "Other"
}
export declare function fileTypeIsDirectory(fileType: FileType): fileType is FileType.Directory;
export declare function fileTypeIsFile(fileType: FileType): fileType is FileType.File;
export declare function fileTypeIsOther(fileType: FileType): fileType is FileType.Other;
export declare type DirectoryPath = t.Branded<string, {
    readonly DirectoryPath: unique symbol;
}>;
export declare type FileName = t.Branded<string, {
    readonly FileName: unique symbol;
}>;
export declare type IoUrl = t.Branded<string, {
    readonly URL: unique symbol;
}>;
export declare type Path = DirectoryPath | FileName;
export declare type Ref = Path | IoUrl;
export declare type Err = LibError;
export declare const toErr: typeof toLibError;
