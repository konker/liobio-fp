import type { JsonData } from '../../types';
import type { FileReader } from './FileReader';
export declare type Data = Array<JsonData>;
/**
 * NDJSON file implementation of IFileReader
 *
 * Read an entire NDJSON file and return an array of objects corresponding to the data on each line
 * See: http://ndjson.org/
 */
export declare function ndJsonFileReader(): FileReader<Data>;
