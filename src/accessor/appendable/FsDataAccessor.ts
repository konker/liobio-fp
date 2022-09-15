import _fs from 'fs';
import _path from 'path';
import _readline from 'readline';
import type { Readable, Writable } from 'stream';

import * as P from '../../prelude';
import type { DirectoryPath, Err, FileName, Path } from '../../types';
import { FileType, fileTypeIsFile, toErr } from '../../types';
import type { AppendableDataAccessor } from './AppendableDataAccessor';

type Model = {
  readonly fs: typeof _fs;
  readonly path: typeof _path;
  readonly readline: typeof _readline;
};

function listFiles(dirPath: string): P.ReaderTaskEither<Model, Err, Array<Path>> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const files = await model.fs.promises.readdir(dirPath);
      return files.map((file) => model.path.join(dirPath, file) as Path);
    }, toErr);
}

function getFileType(filePath: string): P.ReaderTaskEither<Model, Err, FileType> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const stat = await model.fs.promises.lstat(filePath);
      if (stat.isFile()) return FileType.File;
      if (stat.isDirectory()) return FileType.Directory;
      return FileType.Other;
    }, toErr);
}

function exists(fileOrDirPath: string): P.ReaderTaskEither<Model, Err, boolean> {
  return (model) => P.TaskEither_.tryCatch(async () => model.fs.existsSync(fileOrDirPath), toErr);
}

function readFile(filePath: string): P.ReaderTaskEither<Model, Err, Buffer> {
  return (model) => P.TaskEither_.tryCatch(async () => model.fs.promises.readFile(filePath), toErr);
}

function writeFile(filePath: string, data: Buffer | string): P.ReaderTaskEither<Model, Err, void> {
  return (model) => P.TaskEither_.tryCatch(async () => model.fs.promises.writeFile(filePath, data), toErr);
}

function deleteFile(filePath: string): P.ReaderTaskEither<Model, Err, void> {
  return (model) => P.TaskEither_.tryCatch(async () => model.fs.promises.unlink(filePath), toErr);
}

function createDirectory(dirPath: string): P.ReaderTaskEither<Model, Err, void> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      if (!model.fs.existsSync(dirPath)) {
        await model.fs.promises.mkdir(dirPath, { recursive: true });
      }
    }, toErr);
}

function removeDirectory(dirPath: string): P.ReaderTaskEither<Model, Err, void> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      if (model.fs.existsSync(dirPath)) {
        await model.fs.promises.rmdir(dirPath, { recursive: true });
      }
    }, toErr);
}

function getFileReadStream(filePath: string): P.ReaderTaskEither<Model, Err, Readable> {
  return (model) => P.TaskEither_.tryCatch(async () => model.fs.createReadStream(filePath), toErr);
}

//[FIXME:fp _readline?]
function getFileLineReadStream(filePath: string): P.ReaderTaskEither<Model, Err, _readline.Interface> {
  return (model) =>
    P.pipe(
      model,
      getFileReadStream(filePath),
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
          toErr
        )
      )
    );
}

function getFileWriteStream(filePath: string): P.ReaderTaskEither<Model, Err, Writable> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => model.fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf-8' }), toErr);
}

function getFileAppendWriteStream(filePath: string): P.ReaderTaskEither<Model, Err, Writable> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => model.fs.createWriteStream(filePath, { flags: 'a', encoding: 'utf-8' }), toErr);
}

function dirName(filePath: string): P.ReaderTaskEither<Model, Err, DirectoryPath> {
  return (model) =>
    P.pipe(
      model,
      getFileType(filePath),
      P.TaskEither_.map((_) => model.path.dirname(filePath) as DirectoryPath)
    );
}

function fileName(filePath: string): P.ReaderTaskEither<Model, Err, P.Option<FileName>> {
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

function joinPath(...parts: Array<string>): P.ReaderEither<Model, Err, Path> {
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
