/**
 * A range of memory.
 */
export class Buffer extends ArrayBuffer {}

export enum CompareResult {
  Smaller = -1,
  Equal = 0,
  Greater = 1,
}

export type Covariant<X, T> = X extends T ? X : never;
export type Contravariant<X, T> = T extends X ? X : never;

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
   * Whether a value is covariant to this type. E.g. Natural numbers are covariant to Integers.
   * This is used
   * @param x
   */
  covariant<X>(x: Covariant<X, T>): boolean {
    return this.elementOf(x);
  }
  contravariant<X>(x: Contravariant<X, T>): boolean {
    return this.elementOf(x);
  }

  abstract compare<X extends T, Y extends T>(x: X, y: Y): CompareResult;

  abstract serialize<S extends Serializer, V extends T>(s: S, v: V): void;
}

export class Number extends Type<number> {
  name = 'number';
  priority = -Infinity;

  elementOf(x: any) {
    return typeof x == 'number';
  }
}

export class String extends Type<string> {
  name = 'string';
  priority = -Infinity;

  elementOf<X>(x: X): boolean {
    return typeof x == 'string';
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

  covariant<X>(x: X extends T[] ? X : never): boolean {
    return Array.isArray(x) && x.every(x => this._type.elementOf(x));
  }
}

export class 

export abstract class Serializer {
  abstract serialize(x: any): void;
}

export abstract class
