import assert from "node:assert/strict";
import test from "node:test";

import { GenshinThemeRenderer } from "../js/genshin-theme.js";

test("drawDisk bounds the saturation filter to the saved gear draw", () => {
  const calls = [];
  const gear = { id: "tinted-gear" };
  const renderer = Object.create(GenshinThemeRenderer.prototype);
  renderer.ctx = {
    save() { calls.push("save"); },
    restore() { calls.push("restore"); },
    drawImage(...args) { calls.push(["drawImage", ...args]); },
    set filter(value) { calls.push(`filter=${value}`); },
    set shadowColor(_value) {},
    set shadowBlur(_value) {},
    set shadowOffsetY(_value) {},
  };
  renderer.getDiskColor = () => "#abcdef";
  renderer.getTintedGear = () => gear;
  renderer.getGearDrawRect = () => ({ x: 10, y: 20, width: 30, height: 40 });

  renderer.drawDisk({ x: 1, y: 2, width: 3, height: 4 }, 7, false, {
    diskShadow: "shadow",
    diskShadowLifted: "lifted-shadow",
  });

  assert.deepEqual(calls, [
    "save",
    "filter=saturate(0.9)",
    ["drawImage", gear, 10, 20, 30, 40],
    "restore",
  ]);
});
