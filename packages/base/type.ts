/**
 * List of type classes to build types out of.
 */
import { Serializer } from "./serializer";

export enum CompareResult {
  SmallerThan = -1,
  Equal = 0,
  GreaterThan = 1,
}

export type Covariant<X, T> = X extends T ? X : never;

/**
 * A type category. This represents the general way to decode, encode and validate whether
 * a value can be encoded/decoded using this class.
 */
export abstract class Type<T = any> {
  /**
   * The name of the type. This can be used to compare types together.
   */
  abstract readonly name: string;

  /**
   * A priority for the type. This can be used when two types are compatible with each
   * others, but one should take precedence on the other.
   */
  abstract readonly priority: number;

  /**
   * Whether a value is an element of this type.
   * @param x The value.
   */
  abstract elementOf<X>(x: X): boolean;

  /**
   * Whether a value is covariant to this type. This is used during encoding to match values.
   * @param x
   */
  covariant<X>(x: Covariant<X, T>): boolean {
    return this.elementOf(x);
  }

  /**
   * Compare two values of this type.
   */
  abstract compare<X extends T, Y extends T>(x: X, y: Y): CompareResult;
  abstract serialize<S extends Serializer, V extends T>(s: S, v: V): void;
}

export class Number extends Type<number> {
  name = 'number';
  priority = -Infinity;

  elementOf(x: any) {
    return typeof x == 'number';
  }

  compare<X extends number, Y extends number>(x: X, y: Y): CompareResult {
    return x - y;
  }

  serialize<S extends Serializer, V extends number>(s: S, v: V): void {
    s.serialize_number(v);
  }
}

export class String extends Type<string> {
  name = 'string';
  priority = -Infinity;

  elementOf<X>(x: X): boolean {
    return typeof x == 'string';
  }

  compare<X extends string, Y extends string>(x: X, y: Y): CompareResult {
    return x.localeCompare(y);
  }

  serialize<S extends Serializer, V extends string>(s: S, v: V): void {
    s.serialize_string(v);
  }
}

export class TypedArray<T> extends Type<T[]> {
  name = 'array';
  priority = -Infinity;

  constructor(protected _type: Type<T>) {
    super();
  }

  elementOf<X>(x: X): boolean {
    return Array.isArray(x) && x.every(x => this._type.elementOf(x));
  }

  covariant<X>(x: Covariant<X, T[]>): boolean {
    return Array.isArray(x) && x.every(x => this._type.elementOf(x));
  }

  compare<X extends T[], Y extends T[]>(x: X, y: Y): CompareResult {
    for (let i = 0; i < x.length ; i++) {
      if (i >= y.length) {
        return CompareResult.GreaterThan;
      }

      const maybe = this._type.compare(x[i], y[i]);
      if (maybe != CompareResult.Equal) {
        return maybe;
      }
    }

    return x.length < y.length ? CompareResult.SmallerThan : CompareResult.Equal;
  }

  serialize<S extends Serializer, V extends T[]>(s: S, v: V): void {
    const seq = s.serialize_sequence();
    for (const i of v) {
      this._type.serialize(seq.item(), i);
    }
    seq.end();
  }
}

export class Tuple<T extends Array<any>> extends Type<T> {
  name = 'tuple';
  priority = -Infinity;

  constructor(protected _types: Type[]) {
    super();
  }

  elementOf<X>(x: X): boolean {
    return Array.isArray(x) && x.length == this._types.length
      && x.every((xp, i) => this._types[i].elementOf(xp));
  }

  covariant<X>(x: Covariant<X, T>): boolean {
    return Array.isArray(x) && x.length >= this._types.length
        && this._types.every((t, i) => t.covariant(x[i]));
  }

  compare<X extends T[], Y extends T[]>(x: X, y: Y): CompareResult {
    for (let i = 0; i < this._types.length ; i++) {
      const maybe = this._types[i].compare(x[i], y[i]);
      if (maybe != CompareResult.Equal) {
        return maybe;
      }
    }

    return (x.length < y.length)
         ? CompareResult.SmallerThan
         : (x.length > y.length)
           ? CompareResult.GreaterThan
           : CompareResult.Equal;
  }

  serialize<S extends Serializer, V extends T[]>(s: S, v: V): void {
    const seq = s.serialize_sequence();
    for (let i = 0; i < this._types.length ; i++) {
      this._types[i].serialize(seq.item(), v[i]);
    }
    seq.end();
  }
}
