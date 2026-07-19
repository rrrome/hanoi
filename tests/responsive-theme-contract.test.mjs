import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

test("desktop home is a three-command island with subject-specific intro", () => {
  assert.match(css, /\.home-content\s*\{/);
  assert.match(css, /\.home-headline\s*\{/);
  assert.match(css, /\.home-actions\s*\{[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
});

test("portrait mobile stacks launchers and protects touch targets", () => {
  assert.match(css, /@media\s+\(orientation:\s*portrait\)\s+and\s+\(max-width:\s*600px\)[\s\S]*\.home-actions\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /button\s*\{[\s\S]*min-height:\s*44px/);
  assert.match(css, /padding-left:\s*max\(10px,\s*env\(safe-area-inset-left\)\)/);
  assert.match(css, /padding-right:\s*max\(10px,\s*env\(safe-area-inset-right\)\)/);
});

test("stats and board use content surfaces rather than glass", () => {
  assert.match(css, /\.stats\s*>\s*div\s*\{[\s\S]*background:\s*var\(--content-surface\)/);
  assert.match(css, /\.board-panel\s*\{[\s\S]*background:\s*var\(--content-surface\)/);
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
});
