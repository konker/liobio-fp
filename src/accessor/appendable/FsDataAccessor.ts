import _fs from 'fs';
import _path from 'path';
import _readline from 'readline';
import { FileType } from '../DataAccessor';
import { Readable, Writable } from 'stream';
import * as P from '../../prelude';
import { AppendableDataAccessor } from './AppendableDataAccessor';

type Model = {
  readonly fs: typeof _fs;
  readonly path: typeof _path;
  readonly readline: typeof _readline;
};

function listFiles(dirPath: string): P.ReaderTaskEither<Model, string, Array<string>> {
  return ({ fs, path }) =>
    P.TaskEither_.tryCatch(async () => {
      const files = await fs.promises.readdir(dirPath);
      return files.map((file: string) => path.join(dirPath, file));
    }, String);
}

function getFileType(filePath: string): P.ReaderTask<Model, FileType> {
  return ({ fs }) =>
    async () => {
      const stat = await fs.promises.lstat(filePath);
      if (stat.isFile()) return FileType.File;
      if (stat.isDirectory()) return FileType.Directory;
      return FileType.Other;
    };
}

function exists(fileOrDirPath: string): P.ReaderTaskEither<Model, string, boolean> {
  return ({ fs }) =>
    P.TaskEither_.tryCatch(async () => fs.existsSync(fileOrDirPath), String);
}

function readFile(filePath: string): P.ReaderTaskEither<Model, string, Buffer> {
  return ({ fs }) => P.TaskEither_.tryCatch(async () => fs.promises.readFile(filePath), String);
}

function writeFile(filePath: string, data: Buffer | string): P.ReaderTaskEither<Model, string, void> {
  return ({ fs }) => P.TaskEither_.tryCatch(async () => fs.promises.writeFile(filePath, data), String);
}

function deleteFile(filePath: string): P.ReaderTaskEither<Model, string, void> {
  return ({ fs }) => P.TaskEither_.tryCatch(async () => fs.promises.unlink(filePath), String);
}

function createDirectory(dirPath: string): P.ReaderTaskEither<Model, string, void> {
  return ({ fs }) =>
    P.TaskEither_.tryCatch(async () => {
      if (!fs.existsSync(dirPath)) {
        await fs.promises.mkdir(dirPath, { recursive: true });
      }
    }, String);
}

function removeDirectory(dirPath: string): P.ReaderTaskEither<Model, string, void> {
  return ({ fs }) =>
    P.TaskEither_.tryCatch(async () => {
      if (fs.existsSync(dirPath)) {
        await fs.promises.rmdir(dirPath, { recursive: true });
      }
    }, String);
}

function getFileReadStream(filePath: string): P.ReaderTaskEither<Model, string, Readable> {
  return ({ fs }) => P.TaskEither_.tryCatch(async () => fs.createReadStream(filePath), String);
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
          String,
        ),
      ),
    );
}

function getFileWriteStream(filePath: string): P.ReaderTaskEither<Model, string, Writable> {
  return ({ fs }) =>
    P.TaskEither_.tryCatch(async () => fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf-8' }), String);
}

function getFileAppendWriteStream(filePath: string): P.ReaderTaskEither<Model, string, Writable> {
  return ({ fs }) =>
    P.TaskEither_.tryCatch(async () => fs.createWriteStream(filePath, { flags: 'a', encoding: 'utf-8' }), String);
}

function dirName(filePath: string): P.ReaderTask<Model, string> {
  return (model) =>
    P.pipe(
      getFileType(filePath)(model), //[FIXME:fp naive]
      P.Task_.map((fileType) => (fileType === FileType.Directory ? filePath : model.path.dirname(filePath))),
    );
}

function fileName(filePath: string): P.ReaderTask<Model, P.Option<string>> {
  // return (model) =>
  //   P.pipe(
  //     getFileType(filePath)(model), //[FIXME:fp naive]
  //     P.Task_.map((fileType) =>
  //       P.pipe(
  //         { fileType, filePath },
  //         P.Option_.fromPredicate((file) => file.fileType === FileType.Directory),
  //         (x) => x,
  //         P.Option_.map((file) => model.path.basename(file.filePath)),
  //           (x) => x,
  //       ),
  //     ),
  //   );

  return (model) => P.pipe(
    getFileType(filePath)(model), //[FIXME:fp naive]
    P.Task_.map((fileType) =>
      fileType === FileType.Directory ? P.Option_.none : P.Option_.some(model.path.basename(filePath)),
    ),
  );
}

function joinPath(...parts: Array<string>): P.Reader<Model, string> {
  return ({ path }) => path.join(...parts);
}

function relative(from: string, to: string): P.Reader<Model, string> {
  return ({ path }) => path.relative(from, to);
}

function extname(filePath: string): P.Reader<Model, string> {
  return ({ path }) => path.extname(filePath);
}

export function fsDataAccessor(): P.Task<AppendableDataAccessor> {
  return async () => {
    const model: Model = { fs: _fs, path: _path, readline: _readline };

    return {
      ID: 'FsDataAccessor',
      PATH_SEP: _path.sep,

      listFiles: (...args) => listFiles(...args)(model),
      getFileType: (...args) => getFileType(...args)(model),
      exists: (...args) => exists(...args)(model),
      readFile: (...args) => readFile(...args)(model),
      writeFile: (...args) => writeFile(...args)(model),
      deleteFile: (...args) => deleteFile(...args)(model),
      createDirectory: (...args) => createDirectory(...args)(model),
      removeDirectory: (...args) => removeDirectory(...args)(model),
      getFileReadStream: (...args) => getFileReadStream(...args)(model),
      getFileLineReadStream: (...args) => getFileLineReadStream(...args)(model),
      getFileWriteStream: (...args) => getFileWriteStream(...args)(model),
      getFileAppendWriteStream: (...args) => getFileAppendWriteStream(...args)(model),
      dirName: (...args) => dirName(...args)(model),
      fileName: (...args) => fileName(...args)(model),
      joinPath: (...args) => joinPath(...args)(model),
      relative: (...args) => relative(...args)(model),
      extname: (...args) => extname(...args)(model),
    };
  };
}
