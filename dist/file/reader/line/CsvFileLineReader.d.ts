import type csvParse from 'csv-parse';
import type { CsvData } from '../../../types';
import type { FileLineReader } from './FileLineReader';
export declare type Data = CsvData;
/**
 * CSV file implementation of IFileLineReader
 *
 * Read a CSV file one line at a time via a read stream which creates an AsyncGenerator.
 * The generator yields one line at a time as an array of strings.
 */
export declare function csvFileLineReader(csvOptions: csvParse.Options): FileLineReader<Data>;
