import type csvParse from 'csv-parse';
import type { CsvObjectData } from '../../../types';
import type { FileLineReader } from './FileLineReader';
export declare type Data = CsvObjectData;
/**
 * CSV-object file implementation of IFileLineReader
 *
 * Read a CSV file one line at a time via a read stream which creates an AsyncGenerator.
 * The generator yields one line at a time as an object keyed by the column names; the column names are taken from the first line.
 */
export declare function csvObjectFileLineReader(csvOptions: csvParse.Options): FileLineReader<Data>;
