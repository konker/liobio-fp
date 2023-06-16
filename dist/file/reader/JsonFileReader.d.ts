import type { JsonData } from '../../types';
import type { FileReader } from './FileReader';
export declare type Data = JsonData;
/**
 * JSON file implementation of IFileReader
 *
 * Reads in an entire JSON file and returns an array or object depending on the content of the JSON file
 */
export declare function jsonFileReader(): FileReader<Data>;
