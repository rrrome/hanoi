import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const sharedCss = await readFile(new URL("style.css", root), "utf8");
const genshinCss = await readFile(new URL("genshin-theme.css", root), "utf8");

test("configuration modal exposes four decorative corners and capsule row hooks", () => {
  const modal = html.slice(html.indexOf('id="configModal"'), html.indexOf("</form>") + 7);
  assert.match(modal, /class="modal-corners" aria-hidden="true"/);
  assert.equal((modal.match(/class="modal-corner /g) || []).length, 4);
  assert.match(modal, /class="field-control-row disk-count-row"/);
  assert.equal((modal.match(/class="field-control-row position-control-row"/g) || []).length, 2);
  assert.doesNotMatch(modal, /close|modal-close/i);
});

test("modal actions keep IDs, localized labels, decorative glyphs, and left-right order", () => {
  const actions = html.slice(html.indexOf('<div class="modal-actions">'), html.indexOf("</div>", html.indexOf('<div class="modal-actions">')) + 6);
  assert.match(
    actions,
    /id="cancelConfigButton"[\s\S]*class="action-glyph action-glyph-cancel" aria-hidden="true"[\s\S]*data-i18n="cancelButton"[\s\S]*id="submitConfigButton"[\s\S]*class="action-glyph action-glyph-start" aria-hidden="true"[\s\S]*data-i18n="startButton"/,
  );
});

test("shared themes place cancel left and start right while hiding decorative glyphs", () => {
  assert.match(sharedCss, /\.modal-actions\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(sharedCss, /#cancelConfigButton\s*\{[\s\S]*justify-self:\s*start/);
  assert.match(sharedCss, /#submitConfigButton\s*\{[\s\S]*justify-self:\s*end/);
  assert.match(sharedCss, /\.action-glyph\s*\{[\s\S]*display:\s*none/);
});

test("Genshin configuration controls use the approved capsules and reference diamond", () => {
  assert.match(genshinCss, /\.modal-frame\s*\{[\s\S]*width:\s*min\(720px,\s*100%\)/);
  assert.match(genshinCss, /\.field-control-row\s*\{[\s\S]*border-radius:\s*999px/);
  assert.match(genshinCss, /\.peg-choice\s*\{[\s\S]*border-radius:\s*999px/);
  assert.match(genshinCss, /::-webkit-slider-thumb\s*\{[\s\S]*width:\s*28px[\s\S]*transform:\s*rotate\(45deg\)/);
  assert.match(genshinCss, /::-webkit-slider-thumb\s*\{[\s\S]*border:\s*6px solid var\(--genshin-paper-highlight\)/);
  assert.match(genshinCss, /::-webkit-slider-thumb\s*\{[\s\S]*box-shadow:[\s\S]*inset 0 0 0 1\.5px/);
});

test("only the Genshin theme reveals the decorative action glyphs", () => {
  assert.match(genshinCss, /:root\[data-theme="genshin"\]\s+\.action-glyph\s*\{[\s\S]*display:\s*grid/);
  assert.match(genshinCss, /\.action-glyph-cancel\s*\{[\s\S]*color:\s*var\(--genshin-cancel\)/);
  assert.match(genshinCss, /\.action-glyph-start\s*\{[\s\S]*color:\s*var\(--genshin-start\)/);
});

test("Genshin portrait modal stacks controls but keeps actions side by side", () => {
  const portrait = genshinCss.slice(genshinCss.indexOf("@media (orientation: portrait) and (max-width: 600px)"));
  assert.match(portrait, /\.disk-count-row\s*\{[\s\S]*grid-template-areas:[\s\S]*"label value"[\s\S]*"slider slider"/);
  assert.match(portrait, /\.position-control-row\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(portrait, /\.modal-actions\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,/);
});
