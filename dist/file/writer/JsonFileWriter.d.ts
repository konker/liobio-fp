import type { JsonData } from '../../types';
import type { FileWriter } from './FileWriter';
export declare type Data = JsonData;
/**
 * JSON file implementation of FileWriter
 */
export declare function jsonFileWriter(): FileWriter<Data>;
