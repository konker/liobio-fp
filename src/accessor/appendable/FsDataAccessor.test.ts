import fs from 'fs';
import readline from 'readline';
import { fromEither, fromOption, fromTask, fromTaskEither } from 'ruins-ts';
import { PassThrough, Readable, Writable } from 'stream';

import type { DirectoryPath } from '../../types';
import { FileType } from '../../types';
import type { AppendableDataAccessor } from './AppendableDataAccessor';
import { fsDataAccessor } from './FsDataAccessor';
import SpyInstance = jest.SpyInstance;

describe('FsDataAccessor', () => {
  let dataAccessor: AppendableDataAccessor;

  beforeAll(async () => {
    dataAccessor = await fromTask(fsDataAccessor());
  });

  describe('ID', () => {
    it('should work as expected', () => {
      expect(dataAccessor.ID).toBe('FsDataAccessor');
    });
  });

  describe('listFiles', () => {
    let stub1: SpyInstance;
    beforeEach(() => {
      stub1 = jest.spyOn(fs.promises, 'readdir').mockReturnValue(['test-file.txt'] as any);
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const files = await fromTaskEither(dataAccessor.listFiles('./foo/bar'));
      expect(stub1).toHaveBeenCalledTimes(1);
      expect(files[0]).toBe('foo/bar/test-file.txt');
    });

    it('should function correctly', async () => {
      const files = await fromTaskEither(dataAccessor.listFiles('foo/bar'));
      expect(stub1).toHaveBeenCalledTimes(1);
      expect(files[0]).toBe('foo/bar/test-file.txt');
    });

    it('should function correctly', async () => {
      const files = await fromTaskEither(dataAccessor.listFiles('/foo/bar'));
      expect(stub1).toHaveBeenCalledTimes(1);
      expect(files[0]).toBe('/foo/bar/test-file.txt');
    });
  });

  describe('getFileType', () => {
    let stub1: SpyInstance;
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      stub1 = jest.spyOn(fs.promises, 'lstat').mockReturnValue({ isFile: () => true, isDirectory: () => false } as any);
      const data = await fromTaskEither(dataAccessor.getFileType('./foo/bar.txt'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(data).toBe(FileType.File);
    });

    it('should function correctly', async () => {
      stub1 = jest.spyOn(fs.promises, 'lstat').mockReturnValue({ isFile: () => false, isDirectory: () => true } as any);
      const data = await fromTaskEither(dataAccessor.getFileType('./foo'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(data).toBe(FileType.Directory);
    });

    it('should function correctly', async () => {
      stub1 = jest
        .spyOn(fs.promises, 'lstat')
        .mockReturnValue({ isFile: () => false, isDirectory: () => false } as any);
      const data = await fromTaskEither(dataAccessor.getFileType('.'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(data).toBe(FileType.Other);
    });
  });

  describe('exists', () => {
    let stub1: SpyInstance;
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      stub1 = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const data = await fromTaskEither(dataAccessor.exists('./foo/bar.txt'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(data).toBe(true);
    });

    it('should function correctly', async () => {
      stub1 = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      const data = await fromTaskEither(dataAccessor.exists('./foo/bar.txt'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(data).toBe(false);
    });
  });

  describe('readFile', () => {
    let stub1: SpyInstance;
    beforeEach(() => {
      stub1 = jest.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from('some test text'));
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const data = await fromTaskEither(dataAccessor.readFile('/foo/bar.txt'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.txt');
      expect(data.toString()).toBe('some test text');
    });
  });

  describe('writeFile', () => {
    let stub1: SpyInstance;
    beforeEach(() => {
      stub1 = jest.spyOn(fs.promises, 'writeFile').mockResolvedValue();
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      await fromTaskEither(dataAccessor.writeFile('/foo/bar.txt', 'some test text'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.txt');
      expect(stub1.mock.calls[0][1]).toBe('some test text');
    });
  });

  describe('deleteFile', () => {
    let stub1: SpyInstance;
    beforeEach(() => {
      stub1 = jest.spyOn(fs.promises, 'unlink').mockResolvedValue();
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      await fromTaskEither(dataAccessor.deleteFile('/foo/bar.txt'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.txt');
    });
  });

  describe('getFileReadStream', () => {
    let stub1: SpyInstance;
    beforeEach(() => {
      stub1 = jest.spyOn(fs, 'createReadStream').mockReturnValue(new Readable() as any);
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const data = await fromTaskEither(dataAccessor.getFileReadStream('/foo/bar.txt'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.txt');
      expect(data).toBeInstanceOf(Readable);
    });
  });

  describe('getFileLineReadStream', () => {
    let stub1: SpyInstance;
    beforeEach(() => {
      stub1 = jest.spyOn(fs, 'createReadStream').mockReturnValue(new PassThrough() as any);
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const data = await fromTaskEither(dataAccessor.getFileLineReadStream('/foo/bar.txt'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.txt');
      expect(data).toBeInstanceOf(readline.Interface);
    });
  });

  describe('getFileWriteStream', () => {
    let stub1: SpyInstance;
    beforeEach(() => {
      stub1 = jest.spyOn(fs, 'createWriteStream').mockReturnValue(new PassThrough() as any);
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const data = await fromTaskEither(dataAccessor.getFileWriteStream('/foo/bar.txt'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.txt');
      expect(stub1.mock.calls[0][1]).toStrictEqual({ flags: 'w' });
      expect(data).toBeInstanceOf(Writable);
    });
  });

  describe('getFileAppendWriteStream', () => {
    let stub1: SpyInstance;
    beforeEach(() => {
      stub1 = jest.spyOn(fs, 'createWriteStream').mockReturnValue(new PassThrough() as any);
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const data = await fromTaskEither(dataAccessor.getFileAppendWriteStream('/foo/bar.txt'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.txt');
      expect(stub1.mock.calls[0][1]).toStrictEqual({ flags: 'a' });
      expect(data).toBeInstanceOf(Writable);
    });
  });

  describe('createDirectory', () => {
    let stub1: SpyInstance;
    let stub2: SpyInstance;
    beforeEach(() => {
      stub2 = jest.spyOn(fs.promises, 'mkdir').mockResolvedValue('ok');
    });
    afterEach(() => {
      stub1.mockClear();
      stub2.mockClear();
    });

    it('should function correctly, directory does not exist', async () => {
      stub1 = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      await fromTaskEither(dataAccessor.createDirectory('/foo/baz' as DirectoryPath));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub2).toHaveBeenCalledTimes(1);
      expect(stub2.mock.calls[0][0]).toBe('/foo/baz');
    });

    it('should function correctly, directory exists', async () => {
      stub1 = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      await fromTaskEither(dataAccessor.createDirectory('/foo/baz' as DirectoryPath));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub2).toHaveBeenCalledTimes(0);
    });
  });

  describe('removeDirectory', () => {
    let stub1: SpyInstance;
    let stub2: SpyInstance;
    beforeEach(() => {
      stub2 = jest.spyOn(fs.promises, 'rm').mockResolvedValue();
    });
    afterEach(() => {
      stub1.mockClear();
      stub2.mockClear();
    });

    it('should function correctly, directory does not exist', async () => {
      stub1 = jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      await fromTaskEither(dataAccessor.removeDirectory('/foo/baz' as DirectoryPath));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub2).toHaveBeenCalledTimes(0);
    });

    it('should function correctly, directory exists', async () => {
      stub1 = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      await fromTaskEither(dataAccessor.removeDirectory('/foo/baz' as DirectoryPath));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub2).toHaveBeenCalledTimes(1);
      expect(stub2.mock.calls[0][0]).toBe('/foo/baz');
    });
  });

  describe('dirName', () => {
    let stub1: SpyInstance;
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      stub1 = jest
        .spyOn(fs.promises, 'lstat')
        .mockResolvedValue({ isFile: () => true, isDirectory: () => false } as any);
      expect(await fromTaskEither(dataAccessor.dirName('foo/bar/baz.json'))).toBe('foo/bar');
    });

    it('should function correctly', async () => {
      stub1 = jest
        .spyOn(fs.promises, 'lstat')
        .mockResolvedValue({ isFile: () => false, isDirectory: () => true } as any);
      expect(await fromTaskEither(dataAccessor.dirName('foo/bar'))).toBe('foo');
    });
  });

  describe('fileName', () => {
    let stub1: SpyInstance;
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      stub1 = jest
        .spyOn(fs.promises, 'lstat')
        .mockResolvedValue({ isFile: () => true, isDirectory: () => false } as any);
      expect(fromOption(await fromTaskEither(dataAccessor.fileName('foo/bar/baz.json')))).toBe('baz.json');
    });

    it('should function correctly', async () => {
      stub1 = jest
        .spyOn(fs.promises, 'lstat')
        .mockResolvedValue({ isFile: () => false, isDirectory: () => true } as any);
      expect(fromOption(await fromTaskEither(dataAccessor.fileName('foo/bar')))).toBe(null);
    });
  });

  describe('joinPath', () => {
    it('should function correctly', async () => {
      expect(fromEither(dataAccessor.joinPath('foo', 'bar', 'baz.json'))).toBe('foo/bar/baz.json');
      expect(fromEither(dataAccessor.joinPath('foo/bar', 'baz.json'))).toBe('foo/bar/baz.json');
      expect(fromEither(dataAccessor.joinPath('/foo', 'baz.json'))).toBe('/foo/baz.json');
      expect(fromEither(dataAccessor.joinPath('/', 'baz.json'))).toBe('/baz.json');
    });
  });

  describe('relative', () => {
    it('should function correctly', async () => {
      expect(dataAccessor.relative('/foo/bar/', '/foo/bar/baz/qux.json')).toBe('baz/qux.json');
    });
  });

  describe('extname', () => {
    it('should function correctly', async () => {
      expect(dataAccessor.extname('/foo/bar/baz/qux.json')).toBe('.json');
    });
  });
});
