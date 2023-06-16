import type csvParse from 'csv-parse';
import type { CsvObjectData } from '../../types';
import type { FileReader } from './FileReader';
export declare type Data = Array<CsvObjectData>;
/**
 * CSV-object file reader implementation of IFileReader
 *
 * Reads in an entire CSV file via a read stream,
 * and returns an array of records, each record being an object keyed by the column names.
 * This assumes that the first record holds the column names.
 */
export declare function csvObjectFileReader(csvOptions: csvParse.Options): FileReader<Data>;
