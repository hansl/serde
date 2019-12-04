import { JavascriptArray, JavascriptRecord, JavascriptType } from "./json";
import { Buffer } from './buffer';

/**
 * A Map serializer, which takes an unknown number of key-value pairs and serialize them.
 */

export abstract class SerializeMap<EncoderT extends Encoder<any>, Key = string> {
  abstract keyvalue(key: Key): Serializer<EncoderT>;
  end() {}
}

/**
 * A Sequence serializer, which takes an unknown number of items ans serialize them.
 */
export abstract class SerializeSequence<Encoder> {
  abstract item(): Serializer;
  end() {}
}

export interface Encoder<T> {
  readonly name: string;
  readonly priority: number;

  match(value: any): value is T;
  encode(value: T, serializer: Serializer<this>): Buffer;
}

export abstract class Serializer<EncoderT extends Encoder<any> = Encoder<any>> {
  protected _encoders: EncoderT[] = [];

  protected _validateEncoder(_encoder: EncoderT): boolean {
    return true;
  }

  addEncoder(encoder: EncoderT) {
    if (!this._validateEncoder(encoder)) {
      throw new Error("Encoder not supported by this serializer.");
    }
    let priority = encoder.priority;
    for (let i = 0, len = this._encoders.length; i < len; i++) {
      if (this._encoders[i].priority > priority) {
        this._encoders.splice(i, 0, encoder);
        return;
      }
    }

    this._encoders.push(encoder);
  }

  removeEncoder(encoder: EncoderT) {
    const i = this._encoders.indexOf(encoder);
    if (i >= 0) {
      this._encoders.splice(i, 1);
    }
  }

  clearEncoders() {
    this._encoders = [];
  }

  serialize(value: any): Buffer {
    for (const encoder of this._encoders) {
      if (encoder.match(value)) {
        // They're already sorted.
        return encoder.encode(value);
      }
    }

    throw new Error("No encoder found for value: " + JSON.stringify(value));
  }
}


export abstract class JavascriptSerializer extends Serializer {
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
