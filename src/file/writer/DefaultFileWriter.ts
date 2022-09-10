import type { FileWriter } from './FileWriter';
import { close, open, write } from './FileWriter';

export type Data = string | Buffer;

/**
 * Default implementation of FileWriter for string | Buffer
 */
export function defaultFileWriter(): FileWriter<Data> {
  return {
    open,
    write,
    close,
  };
}
