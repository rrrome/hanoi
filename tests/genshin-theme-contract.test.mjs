import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { atRuleBody, declarationValue, ruleBlock, ruleBody } from "./helpers/css-blocks.mjs";

const css = await readFile(new URL("../genshin-theme.css", import.meta.url), "utf8");

test("Genshin preserves its assets, typography, gold accent, and hover fix", () => {
  assert.match(css, /url\("genshin_theme\/homepage\.webp"\)/);
  const root = ruleBody(css, ':root[data-theme="genshin"]');
  assert.equal(declarationValue(root, "--border"), "var(--genshin-gold)");
  assert.match(declarationValue(ruleBody(css, ':root[data-theme="genshin"] body'), "font-family"), /HYWenHei-65W/);
  assert.match(css, /button:not\(\.peg-choice\):hover/);
  assert.doesNotMatch(css, /\.peg-choice:hover/);
  assert.doesNotMatch(css, /#0a84ff/i);
});

test("Genshin exposes the approved adventure-handbook palette", () => {
  const root = ruleBody(css, ':root[data-theme="genshin"]');
  assert.equal(declarationValue(root, "--genshin-paper"), "#f3f0e5");
  assert.equal(declarationValue(root, "--genshin-paper-highlight"), "#fffdf5");
  assert.equal(declarationValue(root, "--genshin-ink"), "#4b566e");
  assert.equal(declarationValue(root, "--genshin-action"), "#53617c");
  assert.equal(declarationValue(root, "--genshin-gold"), "#c8aa69");
  assert.equal(declarationValue(root, "--genshin-cancel"), "#ff6262");
  assert.equal(declarationValue(root, "--genshin-start"), "#ffc83d");
});

test("Genshin uses a dark theme-scoped focus outline on light surfaces", () => {
  const focus = ruleBody(css, ':root[data-theme="genshin"] button:focus-visible');
  assert.equal(declarationValue(focus, "outline"), "3px solid var(--genshin-action-dark)");
  assert.equal(declarationValue(focus, "outline-offset"), "2px");
});

test("Genshin dark bars use a scoped light focus outline", () => {
  const focus = ruleBody(css, ':root[data-theme="genshin"] .topbar button:focus-visible');
  assert.equal(declarationValue(focus, "outline-color"), "var(--genshin-paper-highlight)");
});

test("Genshin nested theme menu restores dark focus after the bar override", () => {
  const barOverride = ruleBlock(css, ':root[data-theme="genshin"] .topbar button:focus-visible');
  const menuReset = ruleBlock(css, ':root[data-theme="genshin"] .topbar .theme-menu button:focus-visible');
  assert.equal(declarationValue(menuReset.body, "outline-color"), "var(--genshin-action-dark)");
  assert.ok(menuReset.start > barOverride.start, "paper-menu reset must follow the broad dark-bar override");
});

test("Genshin small instructional text uses the approved dark ink", () => {
  const instructional = ruleBody(css, ':root[data-theme="genshin"] #configHint', /color:/);
  assert.equal(declarationValue(instructional, "color"), "var(--genshin-ink)");
});

test("Genshin styles the new homepage structure and portrait launcher", () => {
  ruleBody(css, ':root[data-theme="genshin"] .home-intro');
  ruleBody(css, ':root[data-theme="genshin"] .home-headline');
  const portrait = atRuleBody(css, "@media (orientation: portrait) and (max-width: 600px)");
  ruleBody(portrait, ':root[data-theme="genshin"] .home-actions');
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

test("Genshin uses approved ink for small text on paper stats and guide surfaces", () => {
  const root = ruleBody(css, ':root[data-theme="genshin"]');
  assert.equal(declarationValue(root, "--genshin-muted"), "#7a8190", "approved muted token must remain unchanged");
  assert.equal(declarationValue(ruleBody(css, ':root[data-theme="genshin"] .stats span'), "color"), "var(--genshin-ink)");
  const guideText = ruleBody(css, ':root[data-theme="genshin"] .guide-slider-panel label');
  assert.equal(declarationValue(guideText, "color"), "var(--genshin-ink)");
  assert.equal(declarationValue(ruleBody(css, ':root[data-theme="genshin"] .guide-slider-panel #guideSliderValue'), "color"), "var(--genshin-ink)");
});

test("Genshin reduced transparency uses opaque surfaces and disables every backdrop filter", () => {
  const reduced = atRuleBody(css, "@media (prefers-reduced-transparency: reduce)");
  const root = ruleBody(reduced, ':root[data-theme="genshin"]');
  assert.equal(declarationValue(root, "--genshin-surface-opacity"), "1");
  assert.equal(declarationValue(root, "--genshin-control"), "#dcd9d1");

  for (const selector of [
    ':root[data-theme="genshin"] .topbar',
    ':root[data-theme="genshin"] .home-actions',
    ':root[data-theme="genshin"] .modebar',
    ':root[data-theme="genshin"] .theme-menu',
    ':root[data-theme="genshin"] .guide-slider-panel',
    ':root[data-theme="genshin"] .modal',
    ':root[data-theme="genshin"] .modal-backdrop',
  ]) {
    const surface = ruleBody(reduced, selector);
    assert.equal(declarationValue(surface, "-webkit-backdrop-filter"), "none", `${selector} keeps WebKit blur`);
    assert.equal(declarationValue(surface, "backdrop-filter"), "none", `${selector} keeps blur`);
  }

  assert.equal(declarationValue(ruleBody(reduced, ':root[data-theme="genshin"] .topbar'), "background"), "#31404e");
  assert.equal(declarationValue(ruleBody(reduced, ':root[data-theme="genshin"] .home-actions'), "background"), "var(--genshin-paper)");
  assert.equal(declarationValue(ruleBody(reduced, ':root[data-theme="genshin"] .modal-backdrop'), "background"), "#141b25");
});
