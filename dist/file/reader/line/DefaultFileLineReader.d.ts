import type { FileLineReader } from './FileLineReader';
export declare type Data = string;
/**
 * Default implementation of IFileLineReader
 *
 * Read a file one line at a time via a read stream which creates an AsyncGenerator.
 * The generator yields one line at a time as a string.
 */
export declare function defaultFileLineReader(): FileLineReader<string>;
