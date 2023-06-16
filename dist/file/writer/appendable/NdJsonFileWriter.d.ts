import type { JsonData } from '../../../types';
import type { AppendableFileWriter } from './AppendableFileWriter';
export declare type Data = JsonData;
export declare function ndJsonFileWriter(): AppendableFileWriter<Data>;
