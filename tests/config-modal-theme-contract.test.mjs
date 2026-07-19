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
