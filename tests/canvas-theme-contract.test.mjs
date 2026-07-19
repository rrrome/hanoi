import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../js/app.js", import.meta.url), "utf8");

test("standard disks use the approved iOS-inspired semantic palette", () => {
  const paletteBlock = source.slice(source.indexOf("const diskGradientStops"), source.indexOf("// DOM 引用"));
  for (const color of ["#0a84ff", "#5ac8fa", "#30d158", "#ffd60a", "#ff9f0a", "#bf5af2"]) {
    assert.match(paletteBlock, new RegExp(color, "i"), `${color} missing from disk palette`);
  }
});

test("standard disks render a dimensional gradient without changing geometry", () => {
  const drawDiskBlock = source.slice(source.indexOf("function drawDisk"), source.indexOf("function getBoardColors"));
  assert.match(drawDiskBlock, /ctx\.createLinearGradient\(0,\s*rect\.y,\s*0,\s*rect\.y\s*\+\s*rect\.height\)/);
  assert.match(drawDiskBlock, /mixHexColors\(diskColor,\s*"#ffffff",\s*0\.28\)/);
  assert.match(drawDiskBlock, /mixHexColors\(diskColor,\s*"#000000",\s*0\.16\)/);
  assert.match(drawDiskBlock, /roundRect\(ctx,\s*rect\.x,\s*rect\.y,\s*rect\.width,\s*rect\.height,\s*7\)/);
});
