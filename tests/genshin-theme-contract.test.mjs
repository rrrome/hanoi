import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../genshin-theme.css", import.meta.url), "utf8");

test("Genshin preserves its assets, typography, gold accent, and hover fix", () => {
  assert.match(css, /url\("genshin_theme\/homepage\.webp"\)/);
  assert.match(css, /--border:\s*#c8ae78/i);
  assert.match(css, /:root\[data-theme="genshin"\]\s+body\s*\{[\s\S]*HYWenHei-65W/);
  assert.match(css, /button:not\(\.peg-choice\):hover/);
  assert.doesNotMatch(css, /\.peg-choice:hover/);
  assert.doesNotMatch(css, /#0a84ff/i);
});

test("Genshin styles the new homepage structure and portrait launcher", () => {
  assert.match(css, /:root\[data-theme="genshin"\]\s+\.home-intro/);
  assert.match(css, /:root\[data-theme="genshin"\]\s+\.home-headline/);
  assert.match(css, /@media\s+\(orientation:\s*portrait\)\s+and\s+\(max-width:\s*600px\)[\s\S]*:root\[data-theme="genshin"\]\s+\.home-actions/);
});

test("Genshin stylesheet braces are balanced", () => {
  let balance = 0;
  for (const char of css.replace(/\/\*[\s\S]*?\*\//g, "")) {
    if (char === "{") balance += 1;
    if (char === "}") balance -= 1;
    assert.ok(balance >= 0, "closing brace appears before a matching opening brace");
  }
  assert.equal(balance, 0, "stylesheet has unmatched braces");
});
