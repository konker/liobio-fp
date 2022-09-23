import { fromTaskEither } from 'ruins-ts';
import { PassThrough, Readable } from 'stream';

import { PromiseDependentWritableStream } from '../stream/PromiseDependentWritableStream';
import * as streamUtils from './stream';

describe('stream utils', () => {
  describe('waitForStreamPipe', () => {
    it('should resolve as expected', async () => {
      const readStream = Readable.from('konker');
      const writeStream = new PassThrough();

      const data = await fromTaskEither(streamUtils.waitForStreamPipe(readStream, writeStream));
      expect(data).toBe(6);
    });

    it('should reject as expected', async () => {
      const readStream = Readable.from('konker');
      const writeStream = new PassThrough();
      writeStream.on('data', () => {
        writeStream.emit('error', new Error('Boom!'));
      });

      await expect(fromTaskEither(streamUtils.waitForStreamPipe(readStream, writeStream))).rejects.toThrowError(
        'Boom!'
      );
    });
  });

  describe('waitForPromiseDependentStreamPipe', () => {
    it('should resolve as expected', async () => {
      const readStream = Readable.from('konker');
      const writeStream = new PromiseDependentWritableStream();
      writeStream.promise = new Promise((resolve) => {
        writeStream.on('finish', resolve);
      });

      const data = await fromTaskEither(streamUtils.waitForPromiseDependentWritableStreamPipe(readStream, writeStream));
      expect(data).toBe(6);
    });

    it('should reject as expected', async () => {
      const readStream = Readable.from('konker');
      const writeStream = new PromiseDependentWritableStream();
      writeStream.promise = new Promise((_, reject) => {
        writeStream.on('finish', () => reject(new Error('Access Denied')));
      });

      await expect(
        fromTaskEither(streamUtils.waitForPromiseDependentWritableStreamPipe(readStream, writeStream))
      ).rejects.toThrowError();
    });

    it('should reject if promise is missing', async () => {
      const readStream = Readable.from('konker');
      const writeStream = new PromiseDependentWritableStream();

      await expect(
        fromTaskEither(streamUtils.waitForPromiseDependentWritableStreamPipe(readStream, writeStream))
      ).rejects.toThrowError('waitForPromiseDependentWritableStreamPipe called without a stream promise');
    });
  });
});
