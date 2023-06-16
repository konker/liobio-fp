import type { S3Client } from '@aws-sdk/client-s3';
import * as P from '../prelude';
import type { DirectoryPath, Err, FileName, IoUrl } from '../types';
import { FileType } from '../types';
export declare type S3IoUrl<S extends string = string> = IoUrl & `s3://${S}`;
export declare const S3_PROTOCOL = "s3:";
export declare type S3UrlData = {
    Bucket: string;
    Path: DirectoryPath;
    File?: FileName | undefined;
    Type: FileType;
    FullPath: string;
};
export declare type S3UrlDataDirectory = S3UrlData & {
    Type: FileType.Directory;
};
export declare type S3UrlDataFile = S3UrlData & {
    Type: FileType.File;
};
export declare function s3UrlDataIsDirectory(parsed: S3UrlData): parsed is S3UrlDataDirectory;
export declare function s3UrlDataIsFile(parsed: S3UrlData): parsed is S3UrlDataFile;
/**
 * Trim a trailing slash, if present
 *
 * @param s
 */
export declare function trimSlash(s: string): string;
/**
 * Create an S3 URL from the given parts
 *
 * @param bucket
 * @param [dirPath]
 * @param [part]
 */
export declare function createS3Url(bucket: string, dirPath?: string, part?: string): S3IoUrl;
/**
 * Parse an S3 URL into its constituent parts
 *
 * @param {S3Url} s3url
 */
export declare function parseS3Url(s3url: string): P.Either<Err, S3UrlData>;
/**
 * Test to detect if the given path is a valid S3 URL
 *
 * @param s3url
 */
export declare function isS3Url(s3url: string): boolean;
/**
 * Test a string to detect if it is a file path
 *
 * @param part
 */
export declare function isS3File(part: string): boolean;
/**
 * Get a temporary signed access URL for the given S3 resource
 *
 * @param {S3Client} s3Client
 * @param {S3IoUrl} s3url
 */
export declare function createHttpsUrl(s3Client: S3Client, s3url: S3IoUrl): P.TaskEither<Err, string>;
