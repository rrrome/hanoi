import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const readProjectFile = (path) => readFile(new URL(path, root), "utf8");

test("home page owns the three mode launchers and exposes semantic intro hooks", async () => {
  const html = await readProjectFile("index.html");
  const homeStart = html.indexOf('<section id="homeView"');
  const gameStart = html.indexOf('<section id="gameView"');
  assert.ok(homeStart >= 0 && gameStart > homeStart, "home and game sections must exist in order");

  const homeMarkup = html.slice(homeStart, gameStart);
  const gameMarkup = html.slice(gameStart, html.indexOf('<div id="configModal"'));
  assert.match(homeMarkup, /class="home-content"/, "home content container missing");
  assert.match(homeMarkup, /class="home-intro"/, "home intro container missing");
  for (const key of ["homeEyebrow", "homeHeadline", "homeDescription", "homePrivacy"]) {
    assert.match(homeMarkup, new RegExp(`data-i18n="${key}"`), `${key} hook missing`);
  }
  for (const id of ["homeNewGameButton", "homeDemoButton", "homeSolverButton"]) {
    assert.match(homeMarkup, new RegExp(`id="${id}"`), `${id} must stay on home`);
    assert.doesNotMatch(gameMarkup, new RegExp(`id="${id}"`), `${id} leaked into game view`);
  }
});

test("both languages define the new homepage copy", async () => {
  const { applyThemeTerminology, translations } = await import("../js/i18n.js");
  assert.deepEqual(
    {
      zh: [translations.zh.homeEyebrow, translations.zh.homeHeadline, translations.zh.homeDescription, translations.zh.homePrivacy],
      en: [translations.en.homeEyebrow, translations.en.homeHeadline, translations.en.homeDescription, translations.en.homePrivacy],
    },
    {
      zh: ["游戏规则", "一次只移动一个盘子", "只能移动每根柱子最上方的盘子，大盘子不能放在小盘子上。将所有盘子移到目标柱即可完成。", "所有计算均在浏览器本地完成"],
      en: ["HOW TO PLAY", "Move one disk at a time", "Only the top disk on a peg can move, and a larger disk cannot sit on a smaller one. Move the full stack to a target peg to win.", "Everything runs locally in your browser"],
    },
  );
  assert.equal(
    applyThemeTerminology(translations.zh.homeDescription, "zh", true),
    "只能移动每根柱子最上方的齿轮，大齿轮不能放在小齿轮上。将所有齿轮移到目标柱即可完成。",
  );
});
