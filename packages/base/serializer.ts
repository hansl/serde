import { JavascriptArray, JavascriptRecord, JavascriptType } from "./json";
import { Buffer } from './buffer';

/**
 * A Map serializer, which takes an unknown number of key-value pairs and serialize them.
 */

export abstract class SerializeMap<Key = string> {
  abstract keyvalue(key: Key): Serializer;
  end() {}
}

/**
 * A Sequence serializer, which takes an unknown number of items ans serialize them.
 */
export abstract class SerializeSequence {
  abstract item(): Serializer;
  end() {}
}

export abstract class Serializer {
  abstract done(): Buffer;

  // Primitive JavaScript types should be always supported.
  abstract serialize_value(v: JavascriptType): this;
  abstract serialize_boolean(b: boolean): this;
  abstract serialize_number(n: number): this;
  abstract serialize_string(s: string): this;
  abstract serialize_undefined(): this;
  abstract serialize_null(): this;
  abstract serialize_record(o: JavascriptRecord): this;
  abstract serialize_array(a: JavascriptArray): this;

  abstract serialize_map(): SerializeMap;
  abstract serialize_sequence(): SerializeSequence;
}


export class CallbackSerializer<T extends Serializer> extends Serializer {
  constructor(protected _inner: T, protected _onDone: (bytes: Buffer) => void) {
    super();
  }
  get inner(): T {
    return this._inner;
  }
  done() {
    const result = this._inner.done();
    this._onDone(result);
    return result;
  }

  serialize_value(v: JavascriptType): this {
    this._inner.serialize_value(v);
    return this;
  }
  serialize_boolean(b: boolean): this {
    this._inner.serialize_boolean(b);
    return this;
  }
  serialize_number(n: number): this {
    this._inner.serialize_number(n);
    return this;
  }
  serialize_string(s: string): this {
    this._inner.serialize_string(s);
    return this;
  }
  serialize_undefined(): this {
    this._inner.serialize_undefined();
    return this;
  }
  serialize_null(): this {
    this._inner.serialize_null();
    return this;
  }
  serialize_record(o: JavascriptRecord): this {
    this._inner.serialize_record(o);
    return this;
  }
  serialize_array(a: JavascriptArray): this {
    this._inner.serialize_array(a);
    return this;
  }

  serialize_map(): SerializeMap {
    return this._inner.serialize_map();
  }
  serialize_sequence(): SerializeSequence {
    return this._inner.serialize_sequence();
  }
}
