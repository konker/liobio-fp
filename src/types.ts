import type * as t from 'io-ts';

import type * as P from './prelude';
import type { LibError } from './utils/error';
import { toLibError } from './utils/error';

export type JsonData = P.Json;
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

export type Err = LibError;
export const toErr = toLibError;
