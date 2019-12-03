import {
  Buffer, CallbackSerializer,
  JavascriptArray,
  JavascriptRecord,
  JavascriptType,
  SerializeMap,
  Serializer,
  SerializeSequence,
  WriteBuffer
} from "@serde/base";
import * as value from "./value";

class CborSerializeMap extends SerializeMap {
  protected _values = new Map<string, Buffer>();

  constructor(protected _serializer: CborSerializer) { super(); }

  keyvalue(key: string): Serializer {
    return new CallbackSerializer(new CborSerializer(), (bytes: Buffer) => {
      this._values.set(key, bytes);
    });
  }

  end() {
    this._serializer._write(value.map(this._values));
  }
}

class CborSerializeSequence extends SerializeSequence {
  protected _items: Buffer[] = [];

  constructor(protected _serializer: CborSerializer) { super(); }

  item(): Serializer {
    return new CallbackSerializer(new CborSerializer(), bytes => this._items.push(bytes));
  }
  end() {
    this._serializer._write(value.array(this._items));
  }
}


export class CborSerializer extends Serializer {
  protected _buffer = new WriteBuffer(0);
  protected _done = false;

  /** @internal */
  _write(buffer: Buffer) {
    this._buffer.write(buffer);
  }

  done(): Buffer {
    this._done = true;
    return this._buffer;
  }

  serialize_value(v: JavascriptType): this {
    switch (typeof v) {
      case "undefined":
        return this.serialize_undefined();
      case "boolean":
        return this.serialize_boolean(v);
      case "string":
        return this.serialize_string(v);
      case "number":
        return this.serialize_number(v);

      case "object":
        if (v === null) {
          return this.serialize_null();
        } else if (Array.isArray(v)) {
          return this.serialize_array(v);
        } else {
          return this.serialize_record(v);
        }

      default:
        throw new Error("Unsupported type: " + typeof v);
    }
  }

  serialize_boolean(b: boolean): this {
    if (!this._done) {
      this._buffer.write(value.bool(b));
    }
    return this;
  }
  serialize_number(n: number): this {
    if (!this._done) {
      this._buffer.write(value.number(n));
    }
    return this;
  }
  serialize_string(s: string): this {
    if (!this._done) {
      this._buffer.write(value.string(s));
    }
    return this;
  }
  serialize_undefined(): this {
    if (!this._done) {
      this._buffer.write(value.undefined_());
    }
    return this;
  }
  serialize_null(): this {
    if (!this._done) {
      this._buffer.write(value.null_());
    }
    return this;
  }
  serialize_record(o: JavascriptRecord): this {
    if (!this._done) {
      const entries = Object.entries(o).map(([key, value]) => {
        return [key, new CborSerializer().serialize_value(value).done()] as [string, Buffer];
      });
      this._buffer.write(value.map(new Map(entries)));
    }
    return this;
  }
  serialize_array(a: JavascriptArray): this {
    if (!this._done) {
      this._buffer.write(value.array(a.map((item: JavascriptType) => {
        return new CborSerializer().serialize_value(item).done();
      })));
    }
    return this;
  }

  serialize_map(): SerializeMap {
    return new CborSerializeMap(this);
  }
  serialize_sequence(): SerializeSequence {
    return new CborSerializeSequence(this);
  }
}
