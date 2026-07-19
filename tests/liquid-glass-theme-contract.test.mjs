import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

test("light and dark themes expose the Liquid Glass material tokens", () => {
  for (const token of [
    "--content-surface",
    "--glass-clear",
    "--glass-regular",
    "--glass-border",
    "--glass-shadow",
    "--radius-glass",
  ]) {
    assert.match(css, new RegExp(`${token}:`), `${token} missing`);
  }
  assert.match(css, /:root\[data-theme="dark"\][\s\S]*--glass-clear:/, "dark glass token missing");
});

test("glass applies only to control-layer components", () => {
  assert.match(css, /\.topbar,[\s\S]*\.home-actions,[\s\S]*\.modebar,[\s\S]*\.theme-menu,[\s\S]*\.modal/);
  assert.doesNotMatch(css, /\.stats\s*>\s*div,[\s\S]{0,120}backdrop-filter/);
  assert.doesNotMatch(css, /\.board-panel,[\s\S]{0,120}backdrop-filter/);
});

test("glass has browser and accessibility fallbacks", () => {
  assert.match(css, /@supports\s+\(\(-webkit-backdrop-filter:\s*blur\(1px\)\)\s+or\s+\(backdrop-filter:\s*blur\(1px\)\)\)/);
  assert.match(css, /@media\s+\(prefers-reduced-transparency:\s*reduce\)/);
  assert.match(css, /@media\s+\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /@media\s+\(forced-colors:\s*active\)/);
});
