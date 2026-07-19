import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const css = await readFile(new URL("style.css", root), "utf8");

function extractBlock(source, marker, startAt = 0) {
  const markerIndex = source.indexOf(marker, startAt);
  assert.ok(markerIndex >= 0, `${marker} block missing`);
  const open = source.indexOf("{", markerIndex);
  assert.ok(open >= 0, `${marker} opening brace missing`);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  assert.fail(`${marker} closing brace missing`);
}

function numericZIndex(block, name) {
  const match = block.match(/z-index:\s*(\d+)/);
  assert.ok(match, `${name} z-index missing`);
  return Number(match[1]);
}

test("top actions own all controls and status remains their sibling", () => {
  const header = html.slice(html.indexOf('<header class="topbar">'), html.indexOf("</header>"));
  assert.match(
    header,
    /<div class="top-actions">[\s\S]*id="languageButton"[\s\S]*id="homeButton"[\s\S]*class="theme-picker"[\s\S]*<\/div>\s*<p id="statusText"/,
  );
});

test("modal overlay is above the topbar stacking context", () => {
  const topbarZ = numericZIndex(extractBlock(css, ".topbar {"), "topbar");
  const modalZ = numericZIndex(extractBlock(css, ".modal-backdrop {"), "modal backdrop");
  assert.ok(modalZ > topbarZ, `modal ${modalZ} must exceed topbar ${topbarZ}`);
});

test("portrait topbar uses a full-width wrapping status row", () => {
  const media = extractBlock(css, "@media (orientation: portrait) and (max-width: 600px)");
  const brand = extractBlock(media, ".brand-row {");
  const actions = extractBlock(media, ".top-actions {");
  const status = extractBlock(media, "#statusText {");
  assert.match(brand, /display:\s*grid/);
  assert.match(brand, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/);
  assert.match(brand, /grid-template-areas:\s*"title actions"\s*"status status"/);
  assert.match(actions, /grid-area:\s*actions/);
  assert.match(status, /grid-area:\s*status/);
  assert.match(status, /white-space:\s*normal/);
  assert.match(status, /overflow:\s*visible/);
  assert.match(css, /button\s*\{[\s\S]*min-height:\s*44px/);
});
