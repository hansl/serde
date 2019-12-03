import { Buffer } from "@serde/base";
import { CborSerializer } from "./serializer";

function _toHex(arr: Buffer) {
  return new Uint8Array(arr).reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "");
}

test("base case works", () => {
  const serializer = new CborSerializer();

  serializer.serialize_record({});

  expect(_toHex(serializer.done())).toBe("");
});
