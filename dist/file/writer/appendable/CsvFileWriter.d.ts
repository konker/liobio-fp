import type csvStringify from 'csv-stringify';
import type { CsvData } from '../../../types';
import type { AppendableFileWriter } from './AppendableFileWriter';
export declare type Data = CsvData;
export declare function csvFileWriter(csvOptions: csvStringify.Options): AppendableFileWriter<Data>;
