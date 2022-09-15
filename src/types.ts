import type * as t from 'io-ts';

import * as P from './prelude';

export type JsonData = Record<string, unknown> | Array<unknown>;
export type CsvData = Array<unknown>;
export type CsvObjectData = Record<string, unknown>;

export enum FileType {
  Directory = 'Directory',
  File = 'File',
  Other = 'Other',
}

export function fileTypeIsDirectory(fileType: FileType): fileType is FileType.Directory {
  return fileType === FileType.Directory;
}

export function fileTypeIsFile(fileType: FileType): fileType is FileType.File {
  return fileType === FileType.File;
}

export function fileTypeIsOther(fileType: FileType): fileType is FileType.Other {
  return fileType === FileType.Other;
}

export type DirectoryPath = t.Branded<string, { readonly DirectoryPath: unique symbol }>;
export type FileName = t.Branded<string, { readonly FileName: unique symbol }>;
export type IoUrl = t.Branded<string, { readonly URL: unique symbol }>;
export type Path = DirectoryPath | FileName;
export type Ref = Path | IoUrl;

export type Err = Error;
export const toErr = P.Either_.toError;
