import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { atRuleBody, declarationValue, ruleBody } from "./helpers/css-blocks.mjs";

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
  assert.equal(declarationValue(ruleBody(sharedCss, ".modal-actions"), "grid-template-columns"), "repeat(2, minmax(0, 1fr))");
  assert.equal(declarationValue(ruleBody(sharedCss, "#cancelConfigButton"), "justify-self"), "start");
  assert.equal(declarationValue(ruleBody(sharedCss, "#submitConfigButton"), "justify-self"), "end");
  assert.equal(declarationValue(ruleBody(sharedCss, ".action-glyph"), "display"), "none");
});

test("Genshin configuration controls use the approved capsules and reference diamond", () => {
  const thumb = ruleBody(genshinCss, ':root[data-theme="genshin"] .field input[type="range"]::-webkit-slider-thumb');
  assert.equal(declarationValue(ruleBody(genshinCss, ':root[data-theme="genshin"] .modal-frame'), "width"), "min(720px, 100%)");
  assert.equal(declarationValue(ruleBody(genshinCss, ':root[data-theme="genshin"] .field-control-row'), "border-radius"), "999px");
  assert.equal(declarationValue(ruleBody(genshinCss, ':root[data-theme="genshin"] .peg-choice'), "border-radius"), "999px");
  assert.equal(declarationValue(thumb, "width"), "28px");
  assert.equal(declarationValue(thumb, "transform"), "rotate(45deg)");
  assert.equal(declarationValue(thumb, "border"), "6px solid var(--genshin-paper-highlight)");
  assert.match(declarationValue(thumb, "box-shadow"), /inset 0 0 0 1\.5px/);
});

test("only the Genshin theme reveals the decorative action glyphs", () => {
  assert.equal(declarationValue(ruleBody(genshinCss, ':root[data-theme="genshin"] .action-glyph'), "display"), "grid");
  assert.equal(declarationValue(ruleBody(genshinCss, ':root[data-theme="genshin"] .action-glyph-cancel'), "color"), "var(--genshin-cancel)");
  assert.equal(declarationValue(ruleBody(genshinCss, ':root[data-theme="genshin"] .action-glyph-start'), "color"), "var(--genshin-start)");
});

test("Genshin portrait modal compacts controls while preserving touch targets", () => {
  const portrait = atRuleBody(genshinCss, "@media (orientation: portrait) and (max-width: 600px)");
  const diskCountRow = ruleBody(portrait, ':root[data-theme="genshin"] .disk-count-row');
  assert.equal(declarationValue(ruleBody(portrait, ':root[data-theme="genshin"] body .modal'), "padding"), "18px 13px 14px");
  assert.equal(declarationValue(ruleBody(portrait, ':root[data-theme="genshin"] #configHint'), "max-width"), "none");
  assert.equal(declarationValue(ruleBody(portrait, ':root[data-theme="genshin"] .field'), "margin-top"), "8px");
  assert.equal(declarationValue(diskCountRow, "grid-template-areas"), '"label value" "slider slider"');
  assert.equal(declarationValue(diskCountRow, "border-radius"), "clamp(18px, calc(17.5vw - 38px), 46px)");
  assert.equal(declarationValue(diskCountRow, "transition"), "border-radius 120ms ease-out");
  assert.equal(
    declarationValue(ruleBody(portrait, ':root[data-theme="genshin"] .position-control-row'), "grid-template-columns"),
    "minmax(86px, 0.75fr) minmax(144px, 1.25fr)",
  );
  assert.equal(declarationValue(ruleBody(portrait, ':root[data-theme="genshin"] .form-error:empty'), "min-height"), "0");
  assert.ok(Number.parseFloat(declarationValue(ruleBody(portrait, ':root[data-theme="genshin"] .peg-choice'), "min-height")) >= 44);
  assert.equal(declarationValue(ruleBody(portrait, ':root[data-theme="genshin"] .modal-actions'), "grid-template-columns"), "repeat(2, minmax(0, 1fr))");
  assert.ok(Number.parseFloat(declarationValue(ruleBody(portrait, ':root[data-theme="genshin"] .modal-actions button'), "min-height")) >= 44);
});

test("Genshin action labels stay geometrically centered clear of compact glyphs", () => {
  const label = ruleBody(genshinCss, ':root[data-theme="genshin"] .action-label');
  assert.equal(declarationValue(label, "position"), "absolute");
  assert.equal(declarationValue(label, "top"), "50%");
  assert.equal(declarationValue(label, "left"), "50%");
  assert.equal(declarationValue(label, "transform"), "translate(-50%, -50%)");

  const narrow = atRuleBody(genshinCss, "@media (max-width: 360px)");
  assert.equal(declarationValue(ruleBody(narrow, ':root[data-theme="genshin"] .modal-actions button'), "font-size"), "12px");
  assert.equal(
    declarationValue(ruleBody(narrow, ':root[data-theme="genshin"] .position-control-row'), "grid-template-columns"),
    "minmax(78px, 0.7fr) minmax(0, 1.3fr)",
  );
  assert.equal(declarationValue(ruleBody(narrow, ':root[data-theme="genshin"] .peg-button-group'), "gap"), "4px");
  const glyph = ruleBody(narrow, ':root[data-theme="genshin"] .action-glyph');
  assert.equal(declarationValue(glyph, "width"), "24px");
  assert.equal(declarationValue(glyph, "height"), "24px");
});

test("Genshin compact landscape preserves three usable peg choices at 568px and 667px", () => {
  const compactPrelude = "@media (orientation: landscape) and (max-width: 1024px) and (max-height: 600px) and (any-pointer: coarse)";
  const sharedCompact = atRuleBody(sharedCss, compactPrelude);
  const genshinCompact = atRuleBody(genshinCss, compactPrelude);
  const positionRow = ruleBody(genshinCompact, ':root[data-theme="genshin"] .modal .position-control-row');
  const pegGroup = ruleBody(genshinCompact, ':root[data-theme="genshin"] .modal .peg-button-group');
  const pegChoice = ruleBody(genshinCompact, ':root[data-theme="genshin"] .modal .peg-choice');

  assert.equal(declarationValue(positionRow, "grid-template-columns"), "minmax(72px, 0.8fr) minmax(108px, 1.2fr)");
  assert.equal(declarationValue(positionRow, "gap"), "6px");
  assert.equal(declarationValue(pegGroup, "grid-template-columns"), "repeat(3, minmax(0, 1fr))");
  assert.equal(declarationValue(pegGroup, "gap"), "4px");
  assert.equal(declarationValue(pegChoice, "min-width"), "0");
  assert.equal(declarationValue(pegChoice, "white-space"), "nowrap");

  const modal = ruleBody(sharedCompact, ".modal", /grid-template-columns:/);
  const field = ruleBody(sharedCompact, ".field", /padding:/);
  const modalBorder = ruleBody(genshinCss, ':root[data-theme="genshin"] .modal');
  const rowBorder = ruleBody(genshinCss, ':root[data-theme="genshin"] .field-control-row');
  const positionPadding = declarationValue(positionRow, "padding").match(/^(?:\d+px|0)\s+(\d+)px$/);
  assert.ok(positionPadding, "compact position padding must use vertical/horizontal pixel values");
  const modalPadding = declarationValue(modal, "padding").match(/^\d+px\s+(\d+)px$/);
  const fieldPadding = declarationValue(field, "padding").match(/^\d+px\s+(\d+)px$/);
  const modalBorderWidth = Number.parseFloat(declarationValue(modalBorder, "border"));
  const rowBorderWidth = Number.parseFloat(declarationValue(rowBorder, "border"));
  assert.ok(modalPadding && fieldPadding, "compact modal and field padding must use two pixel values");

  const backdropInlinePadding = 8;
  const modalInlinePadding = Number(modalPadding[1]);
  const fieldInlinePadding = Number(fieldPadding[1]);
  const positionInlinePadding = Number(positionPadding[1]);
  assert.equal(declarationValue(modal, "grid-template-columns"), "repeat(2, minmax(0, 1fr))");
  for (const viewportWidth of [568, 667]) {
    const modalWidth = viewportWidth - 2 * backdropInlinePadding;
    const modalContentWidth = modalWidth - 2 * modalBorderWidth - 2 * modalInlinePadding;
    const fieldWidth = (modalContentWidth - 12) / 2 - 2 * fieldInlinePadding;
    const rowContentWidth = fieldWidth - 2 * rowBorderWidth - 2 * positionInlinePadding - 6;
    const pegGroupWidth = rowContentWidth * (1.2 / 2);
    const pegWidth = (pegGroupWidth - 8) / 3;
    assert.ok(pegWidth >= 40, `${viewportWidth}px landscape leaves only ${pegWidth.toFixed(1)}px per peg`);
  }
});

test("Genshin compact landscape keeps peg choices at the approved 44px touch height", () => {
  const compact = atRuleBody(
    genshinCss,
    "@media (orientation: landscape) and (max-width: 1024px) and (max-height: 600px) and (any-pointer: coarse)",
  );
  const pegChoice = ruleBody(compact, ':root[data-theme="genshin"] .modal .peg-choice');
  assert.ok(Number.parseFloat(declarationValue(pegChoice, "height")) >= 44);
  assert.ok(Number.parseFloat(declarationValue(pegChoice, "min-height")) >= 44);
});
