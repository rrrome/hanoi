import assert from "node:assert/strict";

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

export function topLevelBlocks(source) {
  const blocks = [];
  let cursor = 0;
  while ((cursor = skipTrivia(source, cursor)) < source.length) {
    const openingBrace = source.indexOf("{", cursor);
    if (openingBrace === -1) break;
    const closingBrace = findClosingBrace(source, openingBrace);
    blocks.push({
      prelude: source.slice(cursor, openingBrace).trim(),
      body: source.slice(openingBrace + 1, closingBrace),
      start: cursor,
      end: closingBrace + 1,
    });
    cursor = closingBrace + 1;
  }
  return blocks;
}

export function ruleBlocks(source, selector) {
  const normalizedSelector = normalize(selector);
  return topLevelBlocks(source)
    .filter(({ prelude }) => !prelude.startsWith("@"))
    .filter(({ prelude }) => prelude.split(",").some((part) => normalize(part) === normalizedSelector));
}

export function ruleBlock(source, selector, containing) {
  const blocks = ruleBlocks(source, selector);
  assert.ok(blocks.length > 0, `missing CSS rule for ${selector}`);
  if (!containing) return blocks[0];
  const block = blocks.find(({ body }) => containing.test(body));
  assert.ok(block, `no ${selector} rule matched ${containing}`);
  return block;
}

export function ruleBody(source, selector, containing) {
  return ruleBlock(source, selector, containing).body;
}

export function atRuleBody(source, prelude) {
  const normalizedPrelude = normalize(prelude);
  const block = topLevelBlocks(source).find((candidate) => normalize(candidate.prelude) === normalizedPrelude);
  assert.ok(block, `missing CSS at-rule ${prelude}`);
  return block.body;
}

export function declarationValue(body, property) {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = body.match(new RegExp(`(?:^|;)\\s*${escapedProperty}\\s*:\\s*([^;]+)`, "m"));
  assert.ok(match, `missing ${property} declaration`);
  return normalize(match[1]);
}
