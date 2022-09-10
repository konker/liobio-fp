import sinon from 'sinon';
import { Writable } from 'stream';

import { PromiseDependentWritableStream } from './PromiseDependentWritableStream';

describe('PromiseDependentWritableStream', () => {
  const sandbox = sinon.createSandbox();
  let promiseDependentWritableStream: PromiseDependentWritableStream;

  beforeEach(() => {
    promiseDependentWritableStream = new PromiseDependentWritableStream();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should be a Writable stream', () => {
    expect(promiseDependentWritableStream).toBeInstanceOf(Writable);
  });

  it('should store the promise', () => {
    const p = Promise.resolve('test');
    promiseDependentWritableStream.promise = p;
    expect(promiseDependentWritableStream.promise).toBe(p);
  });
});
