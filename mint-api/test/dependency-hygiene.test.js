import test from "node:test";
import assert from "node:assert/strict";
import packageJson from "../package.json" with { type: "json" };

test("mint api keeps unused candy machine code out of the default runtime", () => {
  assert.ok(
    !Object.prototype.hasOwnProperty.call(
      packageJson.dependencies,
      "@metaplex-foundation/mpl-candy-machine",
    ),
  );
});

test("mint api stays on the patched express major", () => {
  assert.match(packageJson.dependencies.express, /^\^5\./);
});
