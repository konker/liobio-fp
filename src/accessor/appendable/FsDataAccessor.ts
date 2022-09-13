import _fs from 'fs';
import _path from 'path';
import _readline from 'readline';
import type { Readable, Writable } from 'stream';

import * as P from '../../prelude';
import type { DirectoryPath, FileName, Path } from '../DataAccessor';
import { FileType, fileTypeIsFile } from '../DataAccessor';
import type { AppendableDataAccessor } from './AppendableDataAccessor';

type Model = {
  readonly fs: typeof _fs;
  readonly path: typeof _path;
  readonly readline: typeof _readline;
};

function listFiles(dirPath: string): P.ReaderTaskEither<Model, string, Array<Path>> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const files = await model.fs.promises.readdir(dirPath);
      return files.map((file) => model.path.join(dirPath, file) as Path);
    }, String);
}

function getFileType(filePath: string): P.ReaderTaskEither<Model, string, FileType> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const stat = await model.fs.promises.lstat(filePath);
      if (stat.isFile()) return FileType.File;
      if (stat.isDirectory()) return FileType.Directory;
      return FileType.Other;
    }, String);
}

function exists(fileOrDirPath: string): P.ReaderTaskEither<Model, string, boolean> {
  return (model) => P.TaskEither_.tryCatch(async () => model.fs.existsSync(fileOrDirPath), String);
}

function readFile(filePath: string): P.ReaderTaskEither<Model, string, Buffer> {
  return (model) => P.TaskEither_.tryCatch(async () => model.fs.promises.readFile(filePath), String);
}

function writeFile(filePath: string, data: Buffer | string): P.ReaderTaskEither<Model, string, void> {
  return (model) => P.TaskEither_.tryCatch(async () => model.fs.promises.writeFile(filePath, data), String);
}

function deleteFile(filePath: string): P.ReaderTaskEither<Model, string, void> {
  return (model) => P.TaskEither_.tryCatch(async () => model.fs.promises.unlink(filePath), String);
}

function createDirectory(dirPath: string): P.ReaderTaskEither<Model, string, void> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      if (!model.fs.existsSync(dirPath)) {
        await model.fs.promises.mkdir(dirPath, { recursive: true });
      }
    }, String);
}

function removeDirectory(dirPath: string): P.ReaderTaskEither<Model, string, void> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      if (model.fs.existsSync(dirPath)) {
        await model.fs.promises.rmdir(dirPath, { recursive: true });
      }
    }, String);
}

function getFileReadStream(filePath: string): P.ReaderTaskEither<Model, string, Readable> {
  return (model) => P.TaskEither_.tryCatch(async () => model.fs.createReadStream(filePath), String);
}

//[FIXME:fp _readline?]
function getFileLineReadStream(filePath: string): P.ReaderTaskEither<Model, string, _readline.Interface> {
  return (model) =>
    P.pipe(
      getFileReadStream(filePath)(model), //[FIXME:fp naive?]
      P.TaskEither_.chain((readStream) =>
        P.TaskEither_.tryCatch(
          async () =>
            model.readline.createInterface({
              input: readStream,
              historySize: 0,
              terminal: false,
              crlfDelay: Infinity,
              escapeCodeTimeout: 10000,
            }),
          String
        )
      )
    );
}

function getFileWriteStream(filePath: string): P.ReaderTaskEither<Model, string, Writable> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => model.fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf-8' }), String);
}

function getFileAppendWriteStream(filePath: string): P.ReaderTaskEither<Model, string, Writable> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => model.fs.createWriteStream(filePath, { flags: 'a', encoding: 'utf-8' }), String);
}

function dirName(filePath: string): P.ReaderTaskEither<Model, string, DirectoryPath> {
  return (model) =>
    P.pipe(
      model,
      getFileType(filePath),
      P.TaskEither_.map((_) => model.path.dirname(filePath) as DirectoryPath)
    );
}

function fileName(filePath: string): P.ReaderTaskEither<Model, string, P.Option<FileName>> {
  return (model) =>
    P.pipe(
      model,
      getFileType(filePath),
      P.TaskEither_.map((fileType) =>
        P.pipe(
          fileType,
          P.Option_.fromPredicate(fileTypeIsFile),
          P.Option_.map((_) => model.path.basename(filePath) as FileName)
        )
      )
    );
}

function joinPath(...parts: Array<string>): P.ReaderEither<Model, string, Path> {
  return (model) => P.Either_.of(model.path.join(...parts) as Path);
}

function relative(from: string, to: string): P.Reader<Model, Path> {
  return (model) => model.path.relative(from, to) as Path;
}

function extname(filePath: string): P.Reader<Model, string> {
  return (model) => model.path.extname(filePath);
}

export function fsDataAccessor(): P.Task<AppendableDataAccessor> {
  return async () => {
    const model: Model = { fs: _fs, path: _path, readline: _readline };

    return {
      ID: 'FsDataAccessor',
      PATH_SEP: _path.sep,

      // Eliminate the Readers by using the created model
      listFiles: P.flow(listFiles, (r) => r(model)),
      getFileType: P.flow(getFileType, (r) => r(model)),
      exists: P.flow(exists, (r) => r(model)),
      readFile: P.flow(readFile, (r) => r(model)),
      writeFile: P.flow(writeFile, (r) => r(model)),
      deleteFile: P.flow(deleteFile, (r) => r(model)),
      createDirectory: P.flow(createDirectory, (r) => r(model)),
      removeDirectory: P.flow(removeDirectory, (r) => r(model)),
      getFileReadStream: P.flow(getFileReadStream, (r) => r(model)),
      getFileLineReadStream: P.flow(getFileLineReadStream, (r) => r(model)),
      getFileWriteStream: P.flow(getFileWriteStream, (r) => r(model)),
      getFileAppendWriteStream: P.flow(getFileAppendWriteStream, (r) => r(model)),
      dirName: P.flow(dirName, (r) => r(model)),
      fileName: P.flow(fileName, (r) => r(model)),
      joinPath: P.flow(joinPath, (r) => r(model)),
      relative: P.flow(relative, (r) => r(model)),
      extname: P.flow(extname, (r) => r(model)),
    };
  };
}
