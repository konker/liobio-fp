import type { JsonData } from '../../../types';
import type { FileLineReader } from './FileLineReader';
export declare type Data = JsonData;
/**
 * NDJSON file implementation of IFileLineReader
 *
 * Read an NDJSON file one line at a time via a read stream which creates an AsyncGenerator.
 * The generator yields one line at a time as either an object or an array, depending on the line content.
 * See: http://ndjson.org/
 */
export declare function ndJsonFileLineReader(): FileLineReader<Data>;
