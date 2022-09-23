import path from 'path';

import { fsDataAccessor } from '../../src/accessor/appendable/FsDataAccessor';
import type { DataAccessor } from '../../src/accessor/DataAccessor';
import { csvFileReader } from '../../src/file/reader/CsvFileReader';
import { csvObjectFileReader } from '../../src/file/reader/CsvObjectFileReader';
import { defaultFileReader } from '../../src/file/reader/DefaultFileReader';
import { jsonFileReader } from '../../src/file/reader/JsonFileReader';
import { csvFileLineReader } from '../../src/file/reader/line/CsvFileLineReader';
import { csvObjectFileLineReader } from '../../src/file/reader/line/CsvObjectFileLineReader';
import { defaultFileLineReader } from '../../src/file/reader/line/DefaultFileLineReader';
import { readFileLine } from '../../src/file/reader/line/FileLineReader';
import { ndJsonFileLineReader } from '../../src/file/reader/line/NdJsonFileLineReader';
import { ndJsonFileReader } from '../../src/file/reader/NdJsonFileReader';
import { csvFileWriter } from '../../src/file/writer/appendable/CsvFileWriter';
import { defaultFileWriter } from '../../src/file/writer/appendable/DefaultFileWriter';
import { ndJsonFileWriter } from '../../src/file/writer/appendable/NdJsonFileWriter';
import { jsonFileWriter } from '../../src/file/writer/JsonFileWriter';
import * as P from '../../src/prelude';
import type { Err, Ref } from '../../src/types';
import {
  TEST_CSV_AS,
  TEST_CSV_OS,
  TEST_CSV_S,
  TEST_JSON_O,
  TEST_JSON_S,
  TEST_NDJSON_OS,
  TEST_NDJSON_S,
} from '../fixtures/data';

const PATH_BASE = path.join(__dirname, '../fixtures/files');

describe('FsDataAccessor', () => {
  let dataAccessor: DataAccessor;

  beforeAll(async () => {
    dataAccessor = await fsDataAccessor()();
  });

  describe('listFiles', () => {
    let testPath: P.Either<Err, Ref>;

    it('should listFiles', async () => {
      testPath = dataAccessor.joinPath(PATH_BASE, 'sub1');

      const result = await P.pipe(
        testPath,
        P.Task_.of,
        P.TaskEither_.chain(dataAccessor.listFiles),
        P.TaskEither_.map(P.Array_.map((f) => dataAccessor.relative(__dirname, f)))
      )();
      expect(result).toEqual(P.Either_.right(['../fixtures/files/sub1/f11.txt', '../fixtures/files/sub1/sub1sub1']));
    });
  });

  describe('exists', () => {
    let testPath: P.Either<Err, Ref>;

    it('should be correct for a file which exists', async () => {
      testPath = dataAccessor.joinPath(PATH_BASE, 'sub1', 'f11.txt');
      const result = await P.pipe(testPath, P.Task_.of, P.TaskEither_.chain(dataAccessor.exists))();
      expect(result).toEqual(P.Either_.right(true));
    });

    it('should be correct for a file which does not exist', async () => {
      testPath = dataAccessor.joinPath(PATH_BASE, 'sub1', 'f999999.txt');
      const result = await P.pipe(testPath, P.Task_.of, P.TaskEither_.chain(dataAccessor.exists))();
      expect(result).toEqual(P.Either_.right(false));
    });
  });

  describe('readFile', () => {
    let testPath: P.Either<Err, Ref>;

    it('should correctly read a file', async () => {
      testPath = dataAccessor.joinPath(PATH_BASE, 'f1.txt');
      const result = await P.pipe(
        testPath,
        P.Task_.of,
        P.TaskEither_.chain(dataAccessor.readFile),
        P.TaskEither_.map((x) => x.toString())
      )();
      expect(result).toEqual(P.Either_.right('This is f1.txt\n'));
    });

    it('should be correct for a file which does not exist', async () => {
      testPath = dataAccessor.joinPath(PATH_BASE, 'f999999.txt');
      const result = await P.pipe(
        testPath,
        P.Task_.of,
        P.TaskEither_.chain(dataAccessor.readFile),
        P.TaskEither_.map((x) => x.toString()),
        P.TaskEither_.mapLeft((e) => e.message)
      )();
      expect(P.Either_.isLeft(result) && result.left).toContain('ENOENT: no such file or directory');
    });
  });

  describe('writeFile - readFile - deleteFile', () => {
    const TEST_S = 'This is f100.txt\n';
    let testPath: P.Either<Err, Ref>;

    it('should function correctly', async () => {
      testPath = dataAccessor.joinPath(PATH_BASE, 'f100.txt');

      // Write
      const result1 = await P.pipe(
        testPath,
        P.Task_.of,
        P.TaskEither_.chain((path) => dataAccessor.writeFile(path, TEST_S))
      )();
      expect(P.Either_.isRight(result1)).toBe(true);

      // Read
      const result2 = await P.pipe(
        dataAccessor.joinPath(PATH_BASE, 'f100.txt'),
        P.Task_.of,
        P.TaskEither_.chain(dataAccessor.readFile),
        P.TaskEither_.map((x) => x.toString())
      )();
      expect(result2).toEqual(P.Either_.right(TEST_S));

      // Delete
      const result3 = await P.pipe(testPath, P.Task_.of, P.TaskEither_.chain(dataAccessor.deleteFile))();
      expect(P.Either_.isRight(result3)).toBe(true);

      // Read is not found
      const result4 = await P.pipe(
        dataAccessor.joinPath(PATH_BASE, 'f100.txt'),
        P.Task_.of,
        P.TaskEither_.chain(dataAccessor.readFile),
        P.TaskEither_.map((x) => x.toString()),
        P.TaskEither_.mapLeft((e) => e.message)
      )();
      expect(P.Either_.isLeft(result4) && result4.left).toContain('ENOENT: no such file or directory');
    });
  });

  describe('createDirectory - writeFile - listFiles - removeDirectory', () => {
    const TEST_S = 'This is f100100.txt\n';

    it('should function correctly', async () => {
      // Create directory
      const result1 = await P.pipe(
        dataAccessor.joinPath(PATH_BASE, 'sub100'),
        P.Task_.of,
        P.TaskEither_.chain(dataAccessor.createDirectory)
      )();
      expect(P.Either_.isRight(result1)).toBe(true);

      // Write
      const result2 = await P.pipe(
        dataAccessor.joinPath(PATH_BASE, 'sub100', 'f100100.txt'),
        P.Task_.of,
        P.TaskEither_.chain((path) => dataAccessor.writeFile(path, TEST_S))
      )();
      expect(P.Either_.isRight(result2)).toBe(true);

      // List files
      const result3 = await P.pipe(
        dataAccessor.joinPath(PATH_BASE),
        P.Task_.of,
        P.TaskEither_.chain(dataAccessor.listFiles),
        P.TaskEither_.map(P.Array_.map((f) => dataAccessor.relative(__dirname, f))),
        P.TaskEither_.map((files) => {
          return files.includes('../fixtures/files/sub100' as Ref);
        })
      )();
      expect(result3).toEqual(P.Either_.right(true));

      // Remove directory
      const result4 = await P.pipe(
        dataAccessor.joinPath(PATH_BASE, 'sub100'),
        P.Task_.of,
        P.TaskEither_.chain(dataAccessor.removeDirectory)
      )();
      expect(P.Either_.isRight(result4)).toBe(true);

      // List files is not found
      const result5 = await P.pipe(
        dataAccessor.joinPath(PATH_BASE),
        P.Task_.of,
        P.TaskEither_.chain(dataAccessor.listFiles),
        P.TaskEither_.map(P.Array_.map((f) => dataAccessor.relative(__dirname, f))),
        P.TaskEither_.map((files) => {
          return files.includes('../fixtures/files/sub100' as Ref);
        })
      )();
      expect(result5).toEqual(P.Either_.right(false));

      // Read is not found
      const result6 = await P.pipe(
        dataAccessor.joinPath(PATH_BASE, 'sub100', 'f100.txt'),
        P.Task_.of,
        P.TaskEither_.chain(dataAccessor.readFile),
        P.TaskEither_.map((x) => x.toString()),
        P.TaskEither_.mapLeft((e) => e.message)
      )();
      expect(P.Either_.isLeft(result6) && result6.left).toContain('ENOENT: no such file or directory');
    });
  });

  describe('file readers', () => {
    describe('DefaultFileReader', () => {
      it('should function correctly', async () => {
        const fileReader = defaultFileReader();
        const result1 = await P.pipe(
          dataAccessor.joinPath(PATH_BASE, 'sub1', 'sub1sub1', 'f111.txt'),
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileReader.read(dataAccessor, filePath)),
          P.TaskEither_.map((x) => x.toString())
        )();
        expect(result1).toEqual(P.Either_.right('This is f111.txt\n'));
      });
    });

    describe('CsvFileReader', () => {
      it('should function correctly', async () => {
        const fileReader = csvFileReader({ delimiter: ',' });
        const result1 = await P.pipe(
          dataAccessor.joinPath(PATH_BASE, 'sub2', 'f22.csv'),
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileReader.read(dataAccessor, filePath))
        )();
        expect(result1).toEqual(P.Either_.right(TEST_CSV_AS));
      });
    });

    describe('CsvObjectFileReader', () => {
      it('should function correctly', async () => {
        const fileReader = csvObjectFileReader({ delimiter: ',' });
        const result1 = await P.pipe(
          dataAccessor.joinPath(PATH_BASE, 'sub2', 'f22.csv'),
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileReader.read(dataAccessor, filePath))
        )();
        expect(result1).toEqual(P.Either_.right(TEST_CSV_OS));
      });
    });

    describe('JsonFileReader', () => {
      it('should function correctly', async () => {
        const fileReader = jsonFileReader();
        const result1 = await P.pipe(
          dataAccessor.joinPath(PATH_BASE, 'sub2', 'f23.json'),
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileReader.read(dataAccessor, filePath))
        )();
        expect(result1).toEqual(P.Either_.right(TEST_JSON_O));
      });
    });

    describe('NdJsonFileReader', () => {
      it('should function correctly', async () => {
        const fileReader = ndJsonFileReader();
        const result1 = await P.pipe(
          dataAccessor.joinPath(PATH_BASE, 'sub2', 'f24.ndjson'),
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileReader.read(dataAccessor, filePath))
        )();
        expect(result1).toEqual(P.Either_.right(TEST_NDJSON_OS));
      });
    });
  });

  describe('file line readers', () => {
    describe('DefaultFileLineReader', () => {
      it('should function correctly', async () => {
        const fileReader = defaultFileLineReader();
        const result1 = await P.pipe(
          dataAccessor.joinPath(PATH_BASE, 'sub1', 'sub1sub1', 'f111.txt'),
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileReader.open(dataAccessor, filePath)),
          P.TaskEither_.chain((handle) =>
            P.pipe(
              readFileLine(handle),
              P.TaskEither_.chainFirst(() => P.pipe(fileReader.close(handle), P.TaskEither_.fromTask))
            )
          )
        )();
        expect(result1).toEqual(P.Either_.right('This is f111.txt'));
      });
    });

    describe('CsvFileLineReader', () => {
      it('should function correctly', async () => {
        const fileReader = csvFileLineReader({ delimiter: ',' });
        const result1 = await P.pipe(
          dataAccessor.joinPath(PATH_BASE, 'sub2', 'f22.csv'),
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileReader.open(dataAccessor, filePath)),
          P.TaskEither_.chain((handle) =>
            P.pipe(
              readFileLine(handle),
              P.TaskEither_.chainFirst(() => P.pipe(fileReader.close(handle), P.TaskEither_.fromTask))
            )
          )
        )();
        expect(result1).toEqual(P.Either_.right(TEST_CSV_AS[0]));
      });
    });

    describe('CsvObjectFileLineReader', () => {
      it('should function correctly', async () => {
        const fileReader = csvObjectFileLineReader({ delimiter: ',' });
        const result1 = await P.pipe(
          dataAccessor.joinPath(PATH_BASE, 'sub2', 'f22.csv'),
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileReader.open(dataAccessor, filePath)),
          P.TaskEither_.chain((handle) =>
            P.pipe(
              readFileLine(handle),
              () => readFileLine(handle),
              P.TaskEither_.chainFirst(() => P.pipe(fileReader.close(handle), P.TaskEither_.fromTask))
            )
          )
        )();
        expect(result1).toEqual(P.Either_.right(TEST_CSV_OS[0]));
      });
    });

    describe('NdJsonFileLineReader', () => {
      it('should function correctly', async () => {
        const fileReader = ndJsonFileLineReader();
        const result1 = await P.pipe(
          dataAccessor.joinPath(PATH_BASE, 'sub2', 'f24.ndjson'),
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileReader.open(dataAccessor, filePath)),
          P.TaskEither_.chain((handle) =>
            P.pipe(
              readFileLine(handle),
              P.TaskEither_.chainFirst(() => P.pipe(fileReader.close(handle), P.TaskEither_.fromTask))
            )
          )
        )();
        expect(result1).toEqual(P.Either_.right(TEST_NDJSON_OS[0]));
      });
    });
  });

  describe('file writers', () => {
    describe('DefaultFileWriter', () => {
      let testPath: P.Either<Err, Ref>;
      beforeAll(() => {
        testPath = dataAccessor.joinPath(PATH_BASE, 'sub2', 'f210.txt');
      });
      afterAll(async () => {
        // Delete
        await P.pipe(testPath, P.Task_.of, P.TaskEither_.chain(dataAccessor.deleteFile))();
      });

      it('should function correctly', async () => {
        const TEST_S = 'test_data_1\n';
        const fileWriter = defaultFileWriter();

        // Write
        const result1 = await P.pipe(
          testPath,
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileWriter.open(dataAccessor, filePath)),
          P.TaskEither_.chain((fp) =>
            P.pipe(
              fileWriter.write(fp, TEST_S),
              P.TaskEither_.chain(() => P.pipe(fileWriter.close(fp), P.TaskEither_.fromTask))
            )
          )
        )();
        expect(P.Either_.isRight(result1)).toBe(true);

        // Read
        const result2 = await P.pipe(
          testPath,
          P.Task_.of,
          P.TaskEither_.chain(dataAccessor.readFile),
          P.TaskEither_.map((x) => x.toString())
        )();
        expect(result2).toEqual(P.Either_.right(TEST_S));
      });
    });

    describe('CsvFileWriter', () => {
      let testPath: P.Either<Err, Ref>;
      beforeAll(() => {
        testPath = dataAccessor.joinPath(PATH_BASE, 'sub2', 'f220.csv');
      });
      afterAll(async () => {
        // Delete
        await P.pipe(testPath, P.Task_.of, P.TaskEither_.chain(dataAccessor.deleteFile))();
      });

      it('should function correctly', async () => {
        const fileWriter = csvFileWriter({ delimiter: ',', quoted: true });

        // Write
        const result1 = await P.pipe(
          testPath,
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileWriter.open(dataAccessor, filePath)),
          P.TaskEither_.chain((fp) =>
            P.pipe(
              TEST_CSV_AS,
              P.Array_.map((i) => fileWriter.write(fp, i)),
              P.Array_.sequence(P.TaskEither_.ApplicativeSeq),
              P.TaskEither_.map(P.Monoid_.concatAll(P.void_.Monoid)),
              P.TaskEither_.chain(() => P.pipe(fileWriter.close(fp), P.TaskEither_.fromTask))
            )
          )
        )();
        expect(P.Either_.isRight(result1)).toBe(true);

        // Read
        const result2 = await P.pipe(
          testPath,
          P.Task_.of,
          P.TaskEither_.chain(dataAccessor.readFile),
          P.TaskEither_.map((x) => x.toString())
        )();
        expect(result2).toEqual(P.Either_.right(TEST_CSV_S));
      });
    });

    describe('JsonFileWriter', () => {
      let testPath: P.Either<Err, Ref>;
      beforeAll(() => {
        testPath = dataAccessor.joinPath(PATH_BASE, 'sub2', 'f230.json');
      });
      afterAll(async () => {
        // Delete
        await P.pipe(testPath, P.Task_.of, P.TaskEither_.chain(dataAccessor.deleteFile))();
      });

      it('should function correctly', async () => {
        const fileWriter = jsonFileWriter();

        // Write
        const result1 = await P.pipe(
          testPath,
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileWriter.open(dataAccessor, filePath)),
          P.TaskEither_.chain((fp) =>
            P.pipe(
              fileWriter.write(fp, TEST_JSON_O),
              P.TaskEither_.chain(() => P.pipe(fileWriter.close(fp), P.TaskEither_.fromTask))
            )
          )
        )();
        expect(P.Either_.isRight(result1)).toBe(true);

        // Read
        const result2 = await P.pipe(
          testPath,
          P.Task_.of,
          P.TaskEither_.chain(dataAccessor.readFile),
          P.TaskEither_.map((x) => x.toString())
        )();
        expect(result2).toEqual(P.Either_.right(TEST_JSON_S));
      });
    });

    describe('NdJsonFileWriter', () => {
      let testPath: P.Either<Err, Ref>;
      beforeAll(() => {
        testPath = dataAccessor.joinPath(PATH_BASE, 'sub2', 'f240.ndjson');
      });
      afterAll(async () => {
        // Delete
        await P.pipe(testPath, P.Task_.of, P.TaskEither_.chain(dataAccessor.deleteFile))();
      });

      it('should function correctly', async () => {
        const fileWriter = ndJsonFileWriter();

        // Write
        const result1 = await P.pipe(
          testPath,
          P.Task_.of,
          P.TaskEither_.chain((filePath) => fileWriter.open(dataAccessor, filePath)),
          P.TaskEither_.chain((fp) =>
            P.pipe(
              TEST_NDJSON_OS,
              P.Array_.map((i) => fileWriter.write(fp, i)),
              P.Array_.sequence(P.TaskEither_.ApplicativeSeq),
              P.TaskEither_.map(P.Monoid_.concatAll(P.void_.Monoid)),
              P.TaskEither_.chain(() => P.pipe(fileWriter.close(fp), P.TaskEither_.fromTask))
            )
          )
        )();
        expect(P.Either_.isRight(result1)).toBe(true);

        // Read
        const result2 = await P.pipe(
          testPath,
          P.Task_.of,
          P.TaskEither_.chain(dataAccessor.readFile),
          P.TaskEither_.map((x) => x.toString())
        )();
        expect(result2).toEqual(P.Either_.right(TEST_NDJSON_S));
      });
    });
  });
});
