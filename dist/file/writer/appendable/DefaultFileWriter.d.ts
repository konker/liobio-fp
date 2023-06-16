/// <reference types="node" />
import type { AppendableFileWriter } from './AppendableFileWriter';
export declare type Data = string | Buffer;
/**
 * Default implementation of FileWriter for string | Buffer
 */
export declare function defaultFileWriter(): AppendableFileWriter<Data>;
