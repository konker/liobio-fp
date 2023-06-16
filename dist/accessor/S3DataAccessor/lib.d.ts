/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { ListObjectsV2CommandOutput, S3Client } from '@aws-sdk/client-s3';
import readline from 'readline';
import { Readable } from 'stream';
import * as P from '../../prelude';
import { PromiseDependentWritableStream } from '../../stream/PromiseDependentWritableStream';
import type { Err } from '../../types';
import type { S3UrlData, S3UrlDataDirectory, S3UrlDataFile } from '../../utils/s3-uri-utils';
export declare type Model = {
    s3: S3Client;
};
export declare function s3ListObjects(parsed: S3UrlDataDirectory): P.ReaderTaskEither<Model, Err, ListObjectsV2CommandOutput>;
export declare function s3HeadObject(parsed: S3UrlData): P.ReaderTaskEither<Model, unknown, boolean>;
export declare function s3GetObject(parsed: S3UrlDataFile): P.ReaderTaskEither<Model, Err, Buffer>;
export declare function s3GetObjectReadStream(parsed: S3UrlDataFile): P.ReaderTaskEither<Model, Err, Readable>;
export declare function s3GetObjectWriteStream(parsed: S3UrlDataFile): P.ReaderTaskEither<Model, Err, PromiseDependentWritableStream>;
export declare function s3PutObject(parsed: S3UrlData, data?: Buffer | string): P.ReaderTaskEither<Model, Err, void>;
export declare function s3DeleteObject(parsed: S3UrlData): P.ReaderTaskEither<Model, Err, void>;
export declare function readlineInterfaceFromReadStream(readStream: Readable): P.TaskEither<Err, readline.Interface>;
