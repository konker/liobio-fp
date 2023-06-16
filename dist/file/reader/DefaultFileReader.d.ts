/// <reference types="node" />
import type { FileReader } from './FileReader';
export declare type Data = Buffer;
/**
 * Default implementation of FileReader
 *
 * Reads the entire contents of a file into a Buffer.
 */
export declare function defaultFileReader(): FileReader<Data>;
