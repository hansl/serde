/**
 * A range of memory.
 */
export class Buffer extends ArrayBuffer {
  static concat(buffer: Buffer, ...others: Buffer[]): Buffer {
    return buffer.concat(...others);
  }

  concat(...others: Buffer[]): Buffer {
    const res = new Buffer(this.byteLength + others.reduce((a, x) => a + x.byteLength, 0));
    const arr = new Uint8Array(res);
    arr.set(new Uint8Array(this), 0);
    let i = this.byteLength;
    for (const other of others) {
      arr.set(new Uint8Array(other), i);
      i += other.byteLength;
    }

    return res;
  }
}

export interface JavascriptRecord extends Record<string | number, JavascriptType> {}
export interface JavascriptArray extends Array<JavascriptType> {}

export type PrimitiveType = undefined | null | boolean | number | string;
export type JavascriptType = PrimitiveType | JavascriptRecord | JavascriptArray;

export abstract class Serializer {
  // Primitive JavaScript types should be always supported.
  abstract serialize_boolean(b: boolean): Buffer;
  abstract serialize_number(n: number): Buffer;
  abstract serialize_string(s: string): Buffer;
  abstract serialize_undefined(): Buffer;
  abstract serialize_null(): Buffer;
  abstract serialize_record(o: JavascriptRecord): Buffer;
  abstract serialize_array(a: JavascriptArray): Buffer;
}
