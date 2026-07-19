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
  const { translations } = await import("../js/i18n.js");
  assert.deepEqual(
    {
      zh: [translations.zh.homeEyebrow, translations.zh.homeHeadline, translations.zh.homeDescription, translations.zh.homePrivacy],
      en: [translations.en.homeEyebrow, translations.en.homeHeadline, translations.en.homeDescription, translations.en.homePrivacy],
    },
    {
      zh: ["经典逻辑游戏", "把复杂，一步步放回秩序。", "移动圆盘，建立路径，在最少步数里完成一次清晰的推演。", "所有计算均在浏览器本地完成"],
      en: ["A CLASSIC LOGIC GAME", "Put complexity back in order, one move at a time.", "Move the disks, build a path, and complete a clear line of reasoning in the fewest possible moves.", "Everything runs locally in your browser"],
    },
  );
});
