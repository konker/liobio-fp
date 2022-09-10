import { close, write } from '../FileWriter';
import type { AppendableFileWriter } from './AppendableFileWriter';
import { openForAppend } from './AppendableFileWriter';

export type Data = string | Buffer;

/**
 * Default implementation of FileWriter for string | Buffer
 */
export function defaultAppendableFileWriter(): AppendableFileWriter<Data> {
  return {
    openForAppend,
    write,
    close,
  };
}
