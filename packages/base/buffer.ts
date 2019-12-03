/**
 * A range of memory. Allows more operations than ArrayBuffer or Node's Buffer.
 */
export class Buffer implements ArrayBuffer {
  protected _inner: ArrayBuffer;

  constructor(byteLength: number) {
    this._inner = new ArrayBuffer(byteLength);
  }

  static concat(buffer: Buffer, ...others: Buffer[]): Buffer {
    const res = new Buffer(buffer.byteLength + others.reduce((a, x) => a + x.byteLength, 0));
    const arr = new Uint8Array(res);
    arr.set(new Uint8Array(buffer), 0);
    let i = buffer.byteLength;
    for (const other of others) {
      arr.set(new Uint8Array(other), i);
      i += other.byteLength;
    }

    return res;
  }
}

/**
 * A range of memory that can be read sequentially.
 */
export class ReadBuffer extends Buffer {
  private _index = 0;

  read(n: number): Uint8Array {
    const res = new Buffer(n);
    const arr = new Uint8Array(res);
    arr.set(new Uint8Array(this).slice(this._index, this._index + n), 0);

    this._index += n;
    return arr;
  }

  pop(): number {
    return this.read(1)[0];
  }

  peek(): number | undefined {
    return new Uint8Array(this)[this._index];
  }
}

/**
 * A range of memory that can be written to.
 */
export class WriteBuffer extends Buffer {
  protected _inner: Buffer;

  constructor(byteLength: number) {
    super(0);
    this._inner = new Buffer(byteLength);
  }

  /**
   * Read-only. The length of the ArrayBuffer (in bytes).
   */
  get byteLength(): number {
    return this._inner.byteLength;
  }

  /**
   * Returns a section of an ArrayBuffer.
   */
  slice(begin: number, end?: number): ArrayBuffer {
    return this._inner.slice(begin, end);
  }

  write(bytes: Uint8Array | Buffer) {
    this._inner = Buffer.concat(this._inner, bytes);
  }

  push(n: number) {
    this.write(new Uint8Array([n]));
  }
}
