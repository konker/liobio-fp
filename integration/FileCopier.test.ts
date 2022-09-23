import path from 'path';

import * as FsDataAccessor from '../src/accessor/appendable/FsDataAccessor';
import type { DataAccessor } from '../src/accessor/DataAccessor';
import * as S3DataAccessor from '../src/accessor/S3DataAccessor';
import { fileCopier } from '../src/file/FileCopier';
import * as P from '../src/prelude';
import type { Err, Ref } from '../src/types';
import { AWS_REGION, TEST_S3_BUCKET } from './fixtures/data';

const S3_PATH_BASE = `s3://${TEST_S3_BUCKET}/`;
const FS_PATH_BASE = path.join(__dirname, './fixtures/files');
const DATA_SIZE = 17;

describe('FileCopier', () => {
  let s3DataAccessor: DataAccessor;
  let fsDataAccessor: DataAccessor;
  let s3FileFrom: P.Either<Err, Ref>;
  let s3FileTo: P.Either<Err, Ref>;
  let s3Dir: P.Either<Err, Ref>;
  let fsFileFrom: P.Either<Err, Ref>;
  let fsFileTo: P.Either<Err, Ref>;
  let fsDir: P.Either<Err, Ref>;

  beforeAll(async () => {
    process.env.AWS_REGION = AWS_REGION;

    s3DataAccessor = await S3DataAccessor.s3DataAccessor()();
    s3FileFrom = s3DataAccessor.joinPath(S3_PATH_BASE, 'sub1', 'sub1sub1', 'f111.txt');
    s3FileTo = s3DataAccessor.joinPath(S3_PATH_BASE, 'sub1', 'sub1sub1', 'f111-copy.txt');
    s3Dir = s3DataAccessor.joinPath(S3_PATH_BASE, 'sub1', 'sub1sub1');

    fsDataAccessor = await FsDataAccessor.fsDataAccessor()();
    fsFileFrom = fsDataAccessor.joinPath(FS_PATH_BASE, 'sub1', 'sub1sub1', 'f111.txt');
    fsFileTo = fsDataAccessor.joinPath(FS_PATH_BASE, 'sub1', 'sub1sub1', 'f111-copy.txt');
    fsDir = fsDataAccessor.joinPath(FS_PATH_BASE, 'sub1', 'sub1sub1');
  });
  afterAll(async () => {
    // Delete
    await P.pipe(s3FileTo, P.Task_.of, P.TaskEither_.chain(s3DataAccessor.deleteFile))();
    await P.pipe(fsFileTo, P.Task_.of, P.TaskEither_.chain(fsDataAccessor.deleteFile))();
  });

  it('should function correctly FS -> FS', async () => {
    // Copy
    const result1 = await P.pipe(
      P.TaskEither_.Do,
      P.TaskEither_.bind('fromFile', () => P.pipe(fsFileFrom, P.Task_.of)),
      P.TaskEither_.bind('toFile', () => P.pipe(fsFileTo, P.Task_.of)),
      P.TaskEither_.chain(({ fromFile, toFile }) => fileCopier(fsDataAccessor, fromFile, fsDataAccessor, toFile))
    )();
    expect(result1).toEqual(P.Either_.right(DATA_SIZE));

    // List files
    const result2 = await P.pipe(
      fsDir,
      P.Task_.of,
      P.TaskEither_.chain(fsDataAccessor.listFiles),
      P.TaskEither_.map(P.Array_.map((f) => fsDataAccessor.relative(__dirname, f)))
    )();
    expect(result2).toEqual(
      P.Either_.right(['fixtures/files/sub1/sub1sub1/f111-copy.txt', 'fixtures/files/sub1/sub1sub1/f111.txt'])
    );
  });

  it('should function correctly FS -> S3', async () => {
    // Copy
    const result1 = await P.pipe(
      P.TaskEither_.Do,
      P.TaskEither_.bind('fromFile', () => P.pipe(fsFileFrom, P.Task_.of)),
      P.TaskEither_.bind('toFile', () => P.pipe(s3FileTo, P.Task_.of)),
      P.TaskEither_.chain(({ fromFile, toFile }) => fileCopier(fsDataAccessor, fromFile, s3DataAccessor, toFile))
    )();
    expect(result1).toEqual(P.Either_.right(DATA_SIZE));

    // List files
    const result2 = await P.pipe(s3Dir, P.Task_.of, P.TaskEither_.chain(s3DataAccessor.listFiles))();
    expect(result2).toEqual(
      P.Either_.right([
        's3://mws-test-bucket/sub1/sub1sub1/f111-copy.txt',
        's3://mws-test-bucket/sub1/sub1sub1/f111.txt',
      ])
    );
  });

  it('should function correctly S3 -> FS', async () => {
    // Copy
    const result1 = await P.pipe(
      P.TaskEither_.Do,
      P.TaskEither_.bind('fromFile', () => P.pipe(s3FileFrom, P.Task_.of)),
      P.TaskEither_.bind('toFile', () => P.pipe(fsFileTo, P.Task_.of)),
      P.TaskEither_.chain(({ fromFile, toFile }) => fileCopier(s3DataAccessor, fromFile, fsDataAccessor, toFile))
    )();
    expect(result1).toEqual(P.Either_.right(DATA_SIZE));

    // List files
    const result2 = await P.pipe(
      fsDir,
      P.Task_.of,
      P.TaskEither_.chain(fsDataAccessor.listFiles),
      P.TaskEither_.map(P.Array_.map((f) => fsDataAccessor.relative(__dirname, f)))
    )();
    expect(result2).toEqual(
      P.Either_.right(['fixtures/files/sub1/sub1sub1/f111-copy.txt', 'fixtures/files/sub1/sub1sub1/f111.txt'])
    );
  });

  it('should function correctly S3 -> S3', async () => {
    // Copy
    const result1 = await P.pipe(
      P.TaskEither_.Do,
      P.TaskEither_.bind('fromFile', () => P.pipe(s3FileFrom, P.Task_.of)),
      P.TaskEither_.bind('toFile', () => P.pipe(s3FileTo, P.Task_.of)),
      P.TaskEither_.chain(({ fromFile, toFile }) => fileCopier(s3DataAccessor, fromFile, s3DataAccessor, toFile))
    )();
    expect(result1).toEqual(P.Either_.right(DATA_SIZE));

    // List files
    const result2 = await P.pipe(s3Dir, P.Task_.of, P.TaskEither_.chain(s3DataAccessor.listFiles))();
    expect(result2).toEqual(
      P.Either_.right([
        's3://mws-test-bucket/sub1/sub1sub1/f111-copy.txt',
        's3://mws-test-bucket/sub1/sub1sub1/f111.txt',
      ])
    );
  });
});
