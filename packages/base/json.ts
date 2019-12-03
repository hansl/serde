export interface JavascriptRecord extends Record<string | number, JavascriptType> {}
export interface JavascriptArray extends Array<JavascriptType> {}

export type PrimitiveType = undefined | null | boolean | number | string;
export type JavascriptType = PrimitiveType | JavascriptRecord | JavascriptArray;
