import csvParse from 'csv-parse';
import type { DataAccessor } from '../../accessor/DataAccessor';
import * as P from '../../prelude';
import type { CsvData, Err } from '../../types';
import type { FileReader } from './FileReader';
declare type Model = {
    csvOptions: csvParse.Options;
};
export declare type Data = Array<CsvData>;
export declare function __read<T>(dataAccessor: DataAccessor, filePath: string): P.ReaderTaskEither<Model, Err, T>;
/**
 * CSV file implementation of IFileReader
 *
 * Reads in an entire CSV file via a read stream,
 * and returns an array of records, each record being an array of strings
 */
export declare function csvFileReader(csvOptions: csvParse.Options): FileReader<Data>;
export {};
