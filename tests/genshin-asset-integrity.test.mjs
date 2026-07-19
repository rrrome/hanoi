import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const assetDirectory = new URL("../genshin_theme/", import.meta.url);
const expectedAssets = new Map([
  ["background.webp", "9197e92ae7a0fa759a1ac615d4754d089fbc2ed4392ff10bb0a42a2823bee562"],
  ["column_alpha.webp", "78ab41bb0d502990a1312b1df250ac01d01606f6277df5709daf7bad814134dc"],
  ["column_highlight.webp", "3d2abd87671fa483c69ac4d489fa1cdf7d9f73226b8e139f52f926d84b1ae98a"],
  ["gear.webp", "0ab3bb5c13398994ea19f45b40e30b177a6bee807cadb8f36a27cb9c1be205f9"],
  ["homepage.webp", "c6021b095154892a5d27965f4e23ec17ec9c22c1e72e3a8b6ff8d8b9e88f3d4d"],
]);

test("Genshin asset directory keeps the approved files and bytes", async () => {
  const files = (await readdir(assetDirectory)).sort();
  assert.deepEqual(files, [...expectedAssets.keys()]);

  for (const [name, expectedHash] of expectedAssets) {
    const bytes = await readFile(new URL(name, assetDirectory));
    const hash = createHash("sha256").update(bytes).digest("hex");
    assert.equal(hash, expectedHash, `${name} changed`);
  }
});
