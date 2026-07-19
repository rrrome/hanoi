import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../style.css", import.meta.url), "utf8");

const normalize = (value) => value.replace(/\s+/g, " ").trim();

function skipTrivia(source, start) {
  let cursor = start;
  while (cursor < source.length) {
    const whitespace = source.slice(cursor).match(/^\s+/);
    if (whitespace) {
      cursor += whitespace[0].length;
      continue;
    }
    if (source.startsWith("/*", cursor)) {
      const commentEnd = source.indexOf("*/", cursor + 2);
      assert.notEqual(commentEnd, -1, "unterminated CSS comment");
      cursor = commentEnd + 2;
      continue;
    }
    break;
  }
  return cursor;
}

function findClosingBrace(source, openingBrace) {
  let depth = 0;
  for (let cursor = openingBrace; cursor < source.length; cursor += 1) {
    if (source[cursor] === "{") depth += 1;
    if (source[cursor] === "}") depth -= 1;
    if (depth === 0) return cursor;
  }
  assert.fail(`unclosed CSS block at offset ${openingBrace}`);
}

function topLevelBlocks(source) {
  const blocks = [];
  let cursor = 0;
  while ((cursor = skipTrivia(source, cursor)) < source.length) {
    const openingBrace = source.indexOf("{", cursor);
    if (openingBrace === -1) break;
    const closingBrace = findClosingBrace(source, openingBrace);
    blocks.push({
      prelude: source.slice(cursor, openingBrace).trim(),
      body: source.slice(openingBrace + 1, closingBrace),
    });
    cursor = closingBrace + 1;
  }
  return blocks;
}

function ruleBodies(source, selector) {
  const normalizedSelector = normalize(selector);
  return topLevelBlocks(source)
    .filter(({ prelude }) => !prelude.startsWith("@"))
    .filter(({ prelude }) => prelude.split(",").some((part) => normalize(part) === normalizedSelector))
    .map(({ body }) => body);
}

function ruleBody(source, selector, containing) {
  const bodies = ruleBodies(source, selector);
  assert.ok(bodies.length > 0, `missing CSS rule for ${selector}`);
  if (!containing) return bodies[0];
  const body = bodies.find((candidate) => containing.test(candidate));
  assert.ok(body, `no ${selector} rule matched ${containing}`);
  return body;
}

function atRuleBody(source, prelude) {
  const normalizedPrelude = normalize(prelude);
  const block = topLevelBlocks(source).find((candidate) => normalize(candidate.prelude) === normalizedPrelude);
  assert.ok(block, `missing CSS at-rule ${prelude}`);
  return block.body;
}

test("desktop home is a three-command island with subject-specific intro", () => {
  ruleBody(css, ".home-content");
  ruleBody(css, ".home-headline");
  assert.match(ruleBody(css, ".home-actions"), /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
});

test("portrait mobile stacks launchers and protects touch targets", () => {
  const portrait = atRuleBody(css, "@media (orientation: portrait) and (max-width: 600px)");
  assert.match(ruleBody(portrait, ".home-actions"), /grid-template-columns:\s*1fr/);
  assert.match(ruleBody(css, "button", /min-height:/), /min-height:\s*44px/);
  assert.match(ruleBody(portrait, ".app-shell"), /padding-left:\s*max\(10px,\s*env\(safe-area-inset-left\)\)/);
  assert.match(ruleBody(portrait, ".app-shell"), /padding-right:\s*max\(10px,\s*env\(safe-area-inset-right\)\)/);
});

test("stats and board use content surfaces rather than glass", () => {
  assert.match(ruleBody(css, ".stats > div"), /background:\s*var\(--content-surface\)/);
  assert.match(ruleBody(css, ".board-panel"), /background:\s*var\(--content-surface\)/);
  assert.match(ruleBody(css, ".stats strong", /font-variant-numeric:/), /font-variant-numeric:\s*tabular-nums/);
});

test("compact landscape resets shared bar spacing without losing compact rhythm", () => {
  const compact = atRuleBody(
    css,
    "@media (orientation: landscape) and (max-width: 1024px) and (max-height: 600px) and (any-pointer: coarse)",
  );
  const topbarRules = ruleBodies(compact, ".topbar");
  const modebarRules = ruleBodies(compact, ".modebar");
  const homeActionRules = ruleBodies(compact, ".home-actions");

  assert.ok(topbarRules.some((body) => /padding:\s*6px\s+10px\s*;/.test(body)), "compact topbar must expand around its controls");
  assert.ok(modebarRules.some((body) => /padding:\s*0\s*;/.test(body)), "compact modebar padding must reset");
  assert.ok(modebarRules.some((body) => /margin-top:\s*0\s*;/.test(body)), "compact modebar top margin must reset");
  assert.ok(topbarRules.some((body) => /gap:\s*8px/.test(body) && /margin-bottom:\s*6px/.test(body)));
  assert.ok(modebarRules.some((body) => /gap:\s*8px/.test(body) && /margin-bottom:\s*6px/.test(body)));
  assert.ok(homeActionRules.some((body) => /margin-inline:\s*auto\s*;/.test(body)), "compact home actions must be centered");
});
