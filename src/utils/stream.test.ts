import { PassThrough, Readable } from 'stream';
import PromiseDependentWritableStream from '../stream/PromiseDependentWritableStream';
import * as streamUtils from './stream';

describe('stream utils', () => {
  describe('waitForStreamPipe', () => {
    it('should resolve as expected', async () => {
      const readStream = Readable.from('konker');
      const writeStream = new PassThrough();

      const data = await streamUtils.waitForStreamPipe(readStream, writeStream);
      expect(data).toBe(6);
    });

    it('should reject as expected', async () => {
      const readStream = Readable.from('konker');
      const writeStream = new PassThrough();
      writeStream.on('data', () => {
        writeStream.emit('error', new Error('Boom!'));
      });

      await expect(streamUtils.waitForStreamPipe(readStream, writeStream)).rejects.toThrowError('Boom!');
    });
  });

  describe('waitForPromiseDependentStreamPipe', () => {
    it('should resolve as expected', async () => {
      const readStream = Readable.from('konker');
      const writeStream = new PromiseDependentWritableStream();
      writeStream.promise = new Promise((resolve) => {
        writeStream.on('finish', resolve);
      });

      const data = await streamUtils.waitForPromiseDependentStreamPipe(readStream, writeStream);
      expect(data).toBe(6);
    });

    it('should reject as expected', async () => {
      const readStream = Readable.from('konker');
      const writeStream = new PromiseDependentWritableStream();
      writeStream.promise = new Promise((_, reject) => {
        writeStream.on('finish', () => reject(new Error('Access Denied')));
      });

      await expect(streamUtils.waitForPromiseDependentStreamPipe(readStream, writeStream)).rejects.toThrowError();
    });

    it('should reject if promise is missing', async () => {
      const readStream = Readable.from('konker');
      const writeStream = new PromiseDependentWritableStream();

      await expect(streamUtils.waitForPromiseDependentStreamPipe(readStream, writeStream)).rejects.toThrowError(
        'waitForPromiseDependentStreamPipe called without a stream promise',
      );
    });
  });
});
