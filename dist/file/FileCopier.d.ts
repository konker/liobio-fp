import type { DataAccessor } from '../accessor/DataAccessor';
import * as P from '../prelude';
import type { Err } from '../types';
/**
 * High level read stream -> write stream logic
 *
 * @param fromDataAccessor
 * @param fromFile
 * @param toDataAccessor
 * @param toFile
 */
export declare function fileCopier(fromDataAccessor: DataAccessor, fromFile: string, toDataAccessor: DataAccessor, toFile: string): P.TaskEither<Err, number>;
