import readline from 'readline';
import { Readable, Writable } from 'stream';
import * as P from '../prelude';

export enum FileType {
    Directory = 'Directory',
    File = 'File',
    Other = 'Other',
}

export type DataAccessor = {
    readonly ID: string;
    readonly PATH_SEP: string;

    /**
     * List the files and directories in the given directory path
     *
     * @param dirPath - The full path to the directory to list
     */
    listFiles: (dirPath: string) => P.TaskEither<string, Array<string>>;

    /**
     * Resolve the type of the given file or directory
     *
     * @param filePath - The full path to the file or directory
     */
    getFileType: (filePath: string) => P.Task<FileType>;

    /**
     * Check if the given file or directory path exists
     *
     * @param fileOrDirPath - The full path to the file or directory to test
     */
    exists: (fileOrDirPath: string) => P.TaskEither<string, boolean>;

    /**
     * Read the content of the given file into a Buffer
     *
     * @param filePath - The full path of the file to read
     */
    readFile: (filePath: string) => P.TaskEither<string, Buffer>;

    /**
     * Write the given data into the given file
     *
     * @param filePath - The full path of the file to write
     * @param Buffer} data - The data to write
     */
    writeFile: (filePath: string, data: string | Buffer) => P.TaskEither<string, void>;

    /**
     * Delete the given file
     *
     * @param filePath - The full path of the file to delete
     */
    deleteFile: (filePath: string) => P.TaskEither<string, void>;

    /**
     * Create the given directory
     *
     * Parent directories are created if they do not already exist
     *
     * @param dirPath - The full path of the directory to create
     */
    createDirectory: (dirPath: string) => P.TaskEither<string, void>;

    /**
     * Remove the given directory
     *
     * Any existing file and subdirectories will be automatically removed
     *
     * @param dirPath - The full path of the directory to remove
     */
    removeDirectory: (dirPath: string) => P.TaskEither<string, void>;

    /**
     * Get a read stream for the given file
     *
     * @param filePath
     */
    getFileReadStream: (filePath: string) => P.TaskEither<string, Readable>;

    /**
     * Get a stream which will read the given file line by line
     *
     * @param filePath - THe full path of the file to read
     */
    getFileLineReadStream: (filePath: string) => P.TaskEither<string, readline.Interface>;

    /**
     * Get a stream to write to the given file
     *
     * @param filePath - The full path of the file
     */
    getFileWriteStream: (filePath: string) => P.TaskEither<string, Writable>;

    /**
     * Get the parent directory path from the given file path
     *
     * @param filePath - The full path of the file
     */
    dirName: (filePath: string) => P.Task<string>;

    /**
     * Extract the file name from a file path
     *
     * @param filePath - The full path of the file
     */
    fileName: (filePath: string) => P.TaskOption<string>;

    /**
     * Join the given parts into a full path
     *
     * @param parts - The parts of the path to join
     */
    joinPath: (...parts: Array<string>) => string;

    /**
     * Get a relative path from one full path to another full path
     *
     * @param from - A full file or directory path
     * @param to - A full file or directory path
     */
    relative: (from: string, to: string) => string;

    /**
     * Extract the file name extension from the given file path
     *
     * E.g. 'foo.csv' -> '.csv'
     *
     * @param filePath - The full path of the file
     */
    extname: (filePath: string) => string;
}