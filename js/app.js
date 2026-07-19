import {
  DEFAULT_DISKS,
  MAX_DISKS,
  MIN_DISKS,
  PEG_COUNT,
  PLAY_MODE,
  getGuideMove,
  readLocalState,
  runAction,
} from "./game-engine.js?v=20260717-2";
import { GenshinThemeRenderer, GENSHIN_THEME } from "./genshin-theme.js?v=20260717-2";
import { applyThemeTerminology, translations } from "./i18n.js?v=20260717-2";
import { bindPressAndHold } from "./press-hold.js?v=20260717-2";
import { installPullToRefreshGuard } from "./touch-guards.js?v=20260717-2";

const LANGUAGE_STORAGE_KEY = "hanoi-language";
const THEME_STORAGE_KEY = "hanoi-theme";
const THEME_OPTIONS = ["light", "dark", GENSHIN_THEME];
const COMPACT_LANDSCAPE_MEDIA_QUERY = "(orientation: landscape) and (max-width: 1024px) and (max-height: 600px) and (any-pointer: coarse)";
const STANDARD_BOARD_TOP_PADDING = 8;
const STANDARD_BOARD_TOP_SPACE = 40;
const STANDARD_BOARD_BOTTOM_SPACE = 68;
const STANDARD_BOARD_MIN_HEIGHT = 220;
const STANDARD_DISK_MIN_HEIGHT = 10;
const STANDARD_DISK_MAX_HEIGHT = 24;
const STANDARD_PEG_CLEARANCE_LEVELS = 2;

const diskGradientStops = [
  "#bf5af2",
  "#0a84ff",
  "#5ac8fa",
  "#30d158",
  "#ffd60a",
  "#ff9f0a",
  "#ff453a",
];


// DOM 引用集中维护，避免业务函数重复查询节点。
const elements = {
  appTitle: document.querySelector("#appTitle"),
  languageButton: document.querySelector("#languageButton"),
  themeButton: document.querySelector("#themeButton"),
  themeMenu: document.querySelector("#themeMenu"),
  homeButton: document.querySelector("#homeButton"),
  homeView: document.querySelector("#homeView"),
  gameView: document.querySelector("#gameView"),
  homeNewGameButton: document.querySelector("#homeNewGameButton"),
  homeDemoButton: document.querySelector("#homeDemoButton"),
  homeSolverButton: document.querySelector("#homeSolverButton"),
  statusText: document.querySelector("#statusText"),
  modeTitle: document.querySelector("#modeTitle"),
  modeSummary: document.querySelector("#modeSummary"),
  undoButton: document.querySelector("#undoButton"),
  redoButton: document.querySelector("#redoButton"),
  confirmSetupButton: document.querySelector("#confirmSetupButton"),
  guideControls: document.querySelector("#guideControls"),
  previousButton: document.querySelector("#previousButton"),
  nextButton: document.querySelector("#nextButton"),
  guideProgress: document.querySelector("#guideProgress"),
  primaryStatLabel: document.querySelector("#primaryStatLabel"),
  primaryStat: document.querySelector("#primaryStat"),
  elapsedTime: document.querySelector("#elapsedTime"),
  minimumMovesLabel: document.querySelector("#minimumMovesLabel"),
  minimumMoves: document.querySelector("#minimumMoves"),
  canvas: document.querySelector("#board"),
  guideSliderPanel: document.querySelector("#guideSliderPanel"),
  guideStepSlider: document.querySelector("#guideStepSlider"),
  guideSliderValue: document.querySelector("#guideSliderValue"),
  configModal: document.querySelector("#configModal"),
  configForm: document.querySelector("#configForm"),
  configTitle: document.querySelector("#configTitle"),
  configHint: document.querySelector("#configHint"),
  modalDiskCount: document.querySelector("#modalDiskCount"),
  modalDiskCountValue: document.querySelector("#modalDiskCountValue"),
  initialPegButtons: document.querySelector("#initialPegButtons"),
  targetPegButtons: document.querySelector("#targetPegButtons"),
  configError: document.querySelector("#configError"),
  cancelConfigButton: document.querySelector("#cancelConfigButton"),
};

const ctx = elements.canvas.getContext("2d");

let gameState = null;
let currentLanguage = loadLanguage();
let selectedTheme = loadSavedTheme();
let configKind = "play";
let selectedPeg = null;
let hoveredPeg = null;
let localStatusKey = "";
let localStatusArgs = {};
let syncedElapsed = 0;
let lastSyncTime = performance.now();
let guideJumpInFlight = false;
let pendingGuideStep = null;
let diskRects = [];
let dragState = null;
let configInitialPeg = 0;
let configTargetPegs = [1, 2];
let drawFrame = null;

// 主题模块只通过这些回调访问页面状态，避免与主控制器互相污染。
const genshinTheme = new GenshinThemeRenderer({
  ctx,
  canvas: elements.canvas,
  getGameState: () => gameState,
  getDragState: () => dragState,
  getHighlightedPeg,
  getGuideMove: getCurrentGuideMove,
  getDiskColor,
  drawFallbackDisk: drawDisk,
  drawFallbackBoard: drawStandardBoard,
  drawBackground,
  translate: t,
  addDiskRect: (rect) => diskRects.push(rect),
  scheduleDraw,
  drawScene: draw,
  isGameVisible: () => getActiveTheme() === GENSHIN_THEME && !elements.gameView.hidden,
  usesCompactLayout,
});

// 页面导航与配置弹窗。
async function loadState() {
  setState(await readLocalState());
}

async function goHome() {
  selectedPeg = null;
  hoveredPeg = null;
  dragState = null;
  genshinTheme.resetDiskSizes();
  genshinTheme.clearDropEffects();
  setState(await runAction("home"));
}

function openConfig(kind) {
  configKind = kind;
  elements.configError.textContent = "";
  const maxDiskCount = getCurrentMaxDisks();
  elements.modalDiskCount.value = Math.min(gameState?.disk_count || DEFAULT_DISKS, maxDiskCount);
  updateDiskCountLimit();
  configInitialPeg = 0;
  configTargetPegs = kind === "play" ? [1, 2] : [2];

  updateConfigText();
  renderPegButtons();
  elements.configModal.hidden = false;
  elements.modalDiskCount.focus();
}

function closeConfig() {
  elements.configModal.hidden = true;
}

async function submitConfig(event) {
  event.preventDefault();
  const config = readConfig();
  if (!config.ok) {
    elements.configError.textContent = config.error;
    return;
  }

  try {
    hoveredPeg = null;
    genshinTheme.resetDiskSizes();
    genshinTheme.clearDropEffects();
    if (configKind === "play") {
      setState(await runAction("start-play", config.payload));
    } else if (configKind === "demo") {
      setState(await runAction("start-demo", config.payload));
    } else {
      setState(await runAction("setup-solver", config.payload));
    }
    closeConfig();
  } catch (error) {
    elements.configError.textContent = error.message;
  }
}

function readConfig() {
  const diskCount = Number.parseInt(elements.modalDiskCount.value, 10);
  const maxDiskCount = getCurrentMaxDisks();
  if (Number.isNaN(diskCount) || diskCount < MIN_DISKS || diskCount > maxDiskCount) {
    return { ok: false, error: t("diskCountInvalid", { min: MIN_DISKS, max: maxDiskCount }) };
  }

  const initialPeg = configInitialPeg;
  if (configKind === "play") {
    const targetPegs = [...configTargetPegs].sort();
    if (!targetPegs.length) {
      return { ok: false, error: t("targetRequired") };
    }
    if (targetPegs.includes(initialPeg)) {
      return { ok: false, error: t("targetConflict") };
    }
    return {
      ok: true,
      payload: {
        disk_count: diskCount,
        initial_peg: initialPeg,
        target_pegs: targetPegs,
      },
    };
  }

  if (configTargetPegs.length !== 1) {
    return { ok: false, error: t("targetRequired") };
  }
  const targetPeg = configTargetPegs[0];
  if (targetPeg === initialPeg) {
    return { ok: false, error: t("targetConflict") };
  }

  return {
    ok: true,
    payload: {
      disk_count: diskCount,
      initial_peg: initialPeg,
      target_peg: targetPeg,
    },
  };
}

function getCurrentMaxDisks() {
  return MAX_DISKS;
}

function updateDiskCountLimit() {
  const maxDiskCount = getCurrentMaxDisks();
  elements.modalDiskCount.min = String(MIN_DISKS);
  elements.modalDiskCount.max = String(maxDiskCount);
  document.querySelectorAll("[data-i18n=\"diskCountHint\"]").forEach((element) => {
    element.textContent = t("diskCountHint", { min: MIN_DISKS, max: maxDiskCount });
  });
  const currentValue = Number.parseInt(elements.modalDiskCount.value, 10);
  const normalizedValue = Math.min(maxDiskCount, Math.max(MIN_DISKS, currentValue || MIN_DISKS));
  elements.modalDiskCount.value = String(normalizedValue);
  elements.modalDiskCountValue.value = String(normalizedValue);
  const range = Math.max(1, maxDiskCount - MIN_DISKS);
  const progress = ((normalizedValue - MIN_DISKS) / range) * 100;
  elements.modalDiskCount.style.setProperty("--range-progress", `${progress}%`);
}

async function undoMove() {
  selectedPeg = null;
  setState(await runAction("undo"), { animateDrop: true });
}

async function redoMove() {
  selectedPeg = null;
  setState(await runAction("redo"), { animateDrop: true });
}

async function restartCurrentPlay() {
  if (!gameState || gameState.mode !== "play") {
    return;
  }

  selectedPeg = null;
  hoveredPeg = null;
  dragState = null;
  genshinTheme.resetDiskSizes();
  genshinTheme.clearDropEffects();
  setState(await runAction("start-play", {
    disk_count: gameState.disk_count,
    initial_peg: gameState.initial_peg,
    target_pegs: gameState.target_pegs,
  }));
}

async function handlePlayAction() {
  if (gameState?.is_complete) {
    await restartCurrentPlay();
    return;
  }

  await undoMove();
}

async function confirmSetup() {
  selectedPeg = null;
  hoveredPeg = null;
  dragState = null;
  setState(await runAction("start-solver"));
}

async function showPreviousStep() {
  selectedPeg = null;
  setState(await runAction("guide-previous"), { animateDrop: true });
}

async function showNextStep() {
  selectedPeg = null;
  setState(await runAction("guide-next"), { animateDrop: true });
}

function bindGuideStepButton(button, direction) {
  let holdTargetStep = 0;
  bindPressAndHold(button, {
    canStart: () => Boolean(gameState?.is_guide && !button.disabled),
    onClick: () => runGuideButtonAction(direction),
    onHoldStart: () => {
      holdTargetStep = clampGuideStep(elements.guideStepSlider.value);
    },
    onRepeat: ({ elapsed }) => {
      const stepSize = getGuideHoldStepSize(elapsed);
      const nextStep = clampGuideStep(holdTargetStep + direction * stepSize);
      if (nextStep === holdTargetStep) {
        return false;
      }

      holdTargetStep = nextStep;
      jumpGuideStep(nextStep).catch(showGuideControlError);
      return true;
    },
  });
}

function getGuideHoldStepSize(elapsed) {
  if (elapsed >= 5000) return 10;
  if (elapsed >= 3000) return 5;
  if (elapsed >= 1500) return 2;
  return 1;
}

function runGuideButtonAction(direction) {
  const action = direction < 0 ? showPreviousStep : showNextStep;
  action().catch(showGuideControlError);
}

function showGuideControlError(error) {
  elements.statusText.textContent = error.message;
}

async function jumpGuideStep(step) {
  if (!gameState?.is_guide) {
    return;
  }

  pendingGuideStep = clampGuideStep(step);
  elements.guideStepSlider.value = String(pendingGuideStep);
  elements.guideSliderValue.textContent = `${pendingGuideStep} / ${gameState.guide_total_steps}`;

  if (guideJumpInFlight) {
    return;
  }

  guideJumpInFlight = true;
  try {
    while (pendingGuideStep !== null) {
      const targetStep = pendingGuideStep;
      pendingGuideStep = null;
      setState(await runAction("guide-jump", { step: targetStep }));
    }
  } finally {
    guideJumpInFlight = false;
  }
}

async function moveDisk(source, target) {
  setState(await runAction("move", { source, target }), { animateDrop: true });
}

async function moveSetupDisk(disk, target) {
  setState(await runAction("move-setup-disk", { disk, target }), { animateDrop: true });
}

// 状态同步与界面渲染。
function setState(nextState, options = {}) {
  const dropTransition = options.animateDrop ? getSingleDiskTransition(gameState, nextState) : null;
  gameState = nextState;
  localStatusKey = "";
  localStatusArgs = {};
  syncedElapsed = gameState.elapsed_seconds;
  lastSyncTime = performance.now();
  renderState();
  if (dropTransition) {
    if (getActiveTheme() === GENSHIN_THEME) {
      genshinTheme.startDropEffect(dropTransition.disk, dropTransition.targetPeg);
    }
  }
}

function getSingleDiskTransition(previousState, nextState) {
  if (!previousState?.pegs || !nextState?.pegs || previousState.disk_count !== nextState.disk_count) {
    return null;
  }

  const previousPositions = new Map();
  const nextPositions = new Map();
  previousState.pegs.forEach((peg, pegIndex) => {
    peg.forEach((disk) => previousPositions.set(disk, pegIndex));
  });
  nextState.pegs.forEach((peg, pegIndex) => {
    peg.forEach((disk) => nextPositions.set(disk, pegIndex));
  });

  const changedDisks = [];
  nextPositions.forEach((targetPeg, disk) => {
    if (previousPositions.get(disk) !== targetPeg) {
      changedDisks.push({ disk, targetPeg });
    }
  });
  return changedDisks.length === 1 ? changedDisks[0] : null;
}

function renderState() {
  if (!gameState) {
    elements.statusText.textContent = t("loading");
    return;
  }

  const isHome = gameState.mode === "home";
  document.body.classList.toggle("is-home", isHome);
  elements.homeView.hidden = !isHome;
  elements.gameView.hidden = isHome;
  elements.homeButton.hidden = isHome;
  elements.languageButton.hidden = !isHome;
  elements.appTitle.hidden = !isHome;
  elements.statusText.textContent = getStatusText();

  if (isHome) {
    return;
  }

  updateStandardBoardHeight();
  elements.modeTitle.textContent = getModeTitle();
  elements.modeSummary.textContent = getModeSummary();
  elements.undoButton.hidden = gameState.mode !== "play";
  elements.undoButton.textContent = gameState.is_complete ? t("playAgainButton") : t("undoButton");
  elements.undoButton.disabled = !gameState.is_complete && !gameState.can_undo;
  elements.redoButton.hidden = gameState.mode !== "play" || gameState.is_complete;
  elements.redoButton.disabled = !gameState.can_redo || gameState.is_complete;
  elements.confirmSetupButton.hidden = gameState.mode !== "setup";
  elements.guideControls.hidden = !gameState.is_guide;
  elements.previousButton.disabled = !gameState.is_guide || gameState.guide_step <= 0;
  elements.nextButton.disabled = !gameState.is_guide || gameState.guide_step >= gameState.guide_total_steps;
  elements.guideProgress.textContent = gameState.is_guide ? `${gameState.guide_step} / ${gameState.guide_total_steps}` : "";

  elements.primaryStatLabel.textContent = gameState.is_guide ? t("stepCountLabel") : t("moveCountLabel");
  elements.primaryStat.textContent = gameState.is_guide
    ? `${gameState.guide_step} / ${gameState.guide_total_steps}`
    : gameState.move_count;
  elements.elapsedTime.textContent = gameState.mode === "play" ? currentElapsedText() : t("notTimed");
  elements.minimumMovesLabel.textContent = gameState.mode === "solver" ? t("solutionStepsLabel") : t("minimumMovesLabel");
  elements.minimumMoves.textContent = gameState.is_guide ? gameState.guide_total_steps : gameState.minimum_moves;

  elements.guideSliderPanel.hidden = !gameState.is_guide;
  elements.guideStepSlider.max = String(gameState.guide_total_steps);
  elements.guideStepSlider.value = String(gameState.guide_step);
  elements.guideSliderValue.textContent = gameState.is_guide ? `${gameState.guide_step} / ${gameState.guide_total_steps}` : "";

  scheduleDraw();
}

function getModeTitle() {
  if (gameState.mode === "play") return t("modePlay");
  if (gameState.mode === "demo") return t("modeDemo");
  if (gameState.mode === "setup") return t("modeSetup");
  if (gameState.mode === "solver") return t("modeSolver");
  return t("appTitle");
}

function getModeSummary() {
  const initial = (gameState.initial_peg ?? 0) + 1;
  const targets = getDisplayTargetPegs().map((peg) => peg + 1).join(" / ");
  return `${t("summaryInitial", { initial })} · ${t("summaryTargets", { targets: t("targetList", { targets }) })}`;
}

function getDisplayTargetPegs() {
  if (!gameState) {
    return [];
  }
  if (gameState.mode !== "play" && Number.isInteger(gameState.target_peg)) {
    return [gameState.target_peg];
  }
  return Array.isArray(gameState.target_pegs) ? gameState.target_pegs : [];
}

function getStatusText() {
  if (!gameState) return t("loading");
  if (localStatusKey) return t(localStatusKey, localStatusArgs);
  if (gameState.message_key) return t(gameState.message_key, gameState.message_args || {});
  if (gameState.mode === "home") return t("homeStatus");
  if (gameState.mode === "setup") return t("defaultSetupStatus");
  if (gameState.is_guide) return t("defaultGuideStatus");
  return t("defaultPlayStatus");
}

function currentElapsedText() {
  if (!gameState) return "00:00";
  const extra = gameState.is_complete ? 0 : Math.floor((performance.now() - lastSyncTime) / 1000);
  return formatTime(syncedElapsed + extra);
}

function updateTimer() {
  if (!gameState || gameState.mode !== "play") {
    return;
  }
  elements.elapsedTime.textContent = currentElapsedText();
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function clampGuideStep(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || !gameState) {
    return 0;
  }
  return Math.min(gameState.guide_total_steps, Math.max(0, parsed));
}

function updateStandardBoardHeight() {
  const levelCount = gameState.disk_count + STANDARD_PEG_CLEARANCE_LEVELS;
  const contentHeight = STANDARD_BOARD_TOP_SPACE
    + levelCount * STANDARD_DISK_MAX_HEIGHT
    + STANDARD_BOARD_BOTTOM_SPACE;
  const minimumContentHeight = STANDARD_BOARD_TOP_SPACE
    + levelCount * STANDARD_DISK_MIN_HEIGHT
    + STANDARD_BOARD_BOTTOM_SPACE;
  const boardHeight = Math.max(STANDARD_BOARD_MIN_HEIGHT, contentHeight);
  elements.gameView.style.setProperty("--standard-board-height", `${boardHeight}px`);
  elements.gameView.style.setProperty(
    "--standard-board-content-min-height",
    `${minimumContentHeight}px`,
  );
}

function loadLanguage() {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return savedLanguage === "en" ? "en" : "zh";
}

function loadSavedTheme() {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return THEME_OPTIONS.includes(savedTheme) ? savedTheme : GENSHIN_THEME;
}

function getActiveTheme() {
  return selectedTheme || GENSHIN_THEME;
}

function toggleThemeMenu() {
  const isOpen = !elements.themeMenu.hidden;
  elements.themeMenu.hidden = isOpen;
  elements.themeButton.setAttribute("aria-expanded", String(!isOpen));
}

function closeThemeMenu() {
  elements.themeMenu.hidden = true;
  elements.themeButton.setAttribute("aria-expanded", "false");
}

function selectTheme(theme) {
  if (!THEME_OPTIONS.includes(theme)) {
    return;
  }
  selectedTheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
  closeThemeMenu();
  applyTheme();
}

// 主题与语言切换。
function applyTheme() {
  document.documentElement.dataset.theme = getActiveTheme();
  applyLanguage();
  if (gameState) {
    renderState();
  }
  scheduleDraw();
}

function updateThemeButton() {
  elements.themeButton.textContent = t("themeButton");
  elements.themeButton.setAttribute("aria-label", t("themeToggleLabel"));
  elements.themeMenu.querySelectorAll("[data-theme-option]").forEach((button) => {
    const theme = button.dataset.themeOption;
    const labelKey = theme === "light" ? "themeLightOption" : theme === "dark" ? "themeDarkOption" : "themeGenshinOption";
    button.textContent = t(labelKey);
    button.setAttribute("aria-checked", String(theme === getActiveTheme()));
  });
}

function toggleLanguage() {
  if (gameState && gameState.mode !== "home") {
    return;
  }
  currentLanguage = currentLanguage === "zh" ? "en" : "zh";
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  applyLanguage();
  renderState();
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.title = t("appTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    if (element.dataset.i18n === "diskCountHint") {
      return;
    }
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  elements.languageButton.textContent = t("languageButton");
  elements.initialPegButtons.setAttribute("aria-label", t("initialPegLabel"));
  elements.targetPegButtons.setAttribute("aria-label", t("targetPegLabel"));
  updateThemeButton();
  updateDiskCountLimit();
  renderPegButtons();
  updateConfigText();
}

function updateConfigText() {
  const titleKey = configKind === "play" ? "modePlay" : configKind === "demo" ? "modeDemo" : "modeSolver";
  const hintKey = configKind === "play" ? "playConfigHint" : configKind === "demo" ? "demoConfigHint" : "solverConfigHint";
  elements.configTitle.textContent = t(titleKey);
  elements.configHint.textContent = `${t(hintKey)} ${t(configKind === "play" ? "playTargetHint" : "singleTargetHint")}`;
}

function renderPegButtons() {
  if (!elements.initialPegButtons || !elements.targetPegButtons) {
    return;
  }

  elements.initialPegButtons.innerHTML = "";
  elements.targetPegButtons.innerHTML = "";
  for (let peg = 0; peg < 3; peg += 1) {
    elements.initialPegButtons.appendChild(createPegButton(peg, configInitialPeg === peg, () => {
      configInitialPeg = peg;
      renderPegButtons();
      validateConfigSilently();
    }));
    elements.targetPegButtons.appendChild(createPegButton(peg, configTargetPegs.includes(peg), () => {
      if (configKind === "play") {
        configTargetPegs = configTargetPegs.includes(peg)
          ? configTargetPegs.filter((target) => target !== peg)
          : [...configTargetPegs, peg];
      } else {
        configTargetPegs = [peg];
      }
      renderPegButtons();
      validateConfigSilently();
    }));
  }
}

function createPegButton(peg, selected, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `peg-choice${selected ? " is-selected" : ""}`;
  button.textContent = String(peg + 1);
  button.setAttribute("aria-pressed", String(selected));
  button.setAttribute("aria-label", t("pegOption", { peg: peg + 1 }));
  button.addEventListener("click", onClick);
  return button;
}

function validateConfigSilently() {
  if (elements.configModal.hidden) {
    return;
  }
  const config = readConfig();
  elements.configError.textContent = config.ok ? "" : config.error;
}

function t(key, args = {}) {
  const template = translations[currentLanguage][key] || translations.zh[key] || key;
  const themedTemplate = applyThemeTerminology(
    template,
    currentLanguage,
    getActiveTheme() === GENSHIN_THEME,
  );
  return themedTemplate.replace(/\{(\w+)\}/g, (_match, name) => {
    return Object.prototype.hasOwnProperty.call(args, name) ? String(args[name]) : "";
  });
}

function isGenshinAssetWaitActive() {
  return getActiveTheme() === GENSHIN_THEME && genshinTheme.isWaiting();
}

function setLocalStatus(key, args = {}) {
  localStatusKey = key;
  localStatusArgs = args;
  elements.statusText.textContent = t(key, args);
}

// Canvas 主绘制流程。
function scheduleDraw() {
  if (drawFrame !== null) {
    cancelAnimationFrame(drawFrame);
  }

  drawFrame = requestAnimationFrame(() => {
    drawFrame = null;
    if (!resizeCanvas()) {
      window.setTimeout(resizeCanvas, 0);
    }
  });
}

function resizeCanvas() {
  const rect = elements.canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return false;
  }

  const scale = window.devicePixelRatio || 1;
  elements.canvas.width = Math.max(1, Math.floor(rect.width * scale));
  elements.canvas.height = Math.max(1, Math.floor(rect.height * scale));
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  draw();
  return true;
}

function draw() {
  if (!gameState || gameState.mode === "home" || elements.gameView.hidden) {
    return;
  }

  const rect = elements.canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  if (width <= 0 || height <= 0) {
    return;
  }

  ctx.clearRect(0, 0, width, height);
  diskRects = [];

  const colors = getBoardColors();
  if (getActiveTheme() === GENSHIN_THEME) {
    if (genshinTheme.isReady()) {
      genshinTheme.draw(width, height, colors);
    } else if (genshinTheme.isWaiting()) {
      genshinTheme.drawLoading(width, height, colors);
    } else {
      drawStandardBoard(width, height, colors);
    }
    return;
  }

  drawStandardBoard(width, height, colors);
}

function drawStandardBoard(width, height, colors) {
  drawBackground(width, height, colors);

  const centers = getPegCenters(width);
  const baseY = height - STANDARD_BOARD_BOTTOM_SPACE;
  const defaultPegTopY = 56;
  const diskHeight = getStandardDiskHeight(baseY, defaultPegTopY, gameState.disk_count);
  const pegTopY = getActiveTheme() !== GENSHIN_THEME
    ? Math.max(
      STANDARD_BOARD_TOP_PADDING,
      baseY - (gameState.disk_count + STANDARD_PEG_CLEARANCE_LEVELS) * diskHeight,
    )
    : defaultPegTopY;
  const pegHeight = baseY - pegTopY;

  ctx.fillStyle = colors.base;
  roundRect(ctx, 44, baseY, width - 88, 14, 7);
  ctx.fill();

  const highlightedPeg = getHighlightedPeg();
  centers.forEach((x, index) => {
    const isHighlighted = highlightedPeg === index;

    ctx.fillStyle = isHighlighted ? colors.target : colors.peg;
    roundRect(ctx, x - 7, pegTopY, 14, pegHeight, 7);
    ctx.fill();

    ctx.fillStyle = isHighlighted ? colors.targetLabel : colors.pegLabel;
    ctx.font = "700 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(String(index + 1), x, baseY + 42);
  });

  const maxDiskWidth = Math.min(290, width / 3 - 52);
  const minDiskWidth = 48;
  const widthStep = (maxDiskWidth - minDiskWidth) / Math.max(1, gameState.disk_count - 1);
  const guideMove = getCurrentGuideMove();
  if (guideMove) {
    drawGuideMoveArrow(
      centers[guideMove.source],
      centers[guideMove.target],
      pegTopY - 20,
      colors,
    );
  }

  gameState.pegs.forEach((peg, pegIndex) => {
    const centerX = centers[pegIndex];
    peg.forEach((disk, level) => {
      if (dragState && dragState.disk === disk) {
        return;
      }

      const rect = getDiskRect(centerX, baseY, diskHeight, minDiskWidth, widthStep, disk, level);
      drawDisk(rect, disk, false, colors);
      diskRects.push({ ...rect, disk, peg: pegIndex, level });
    });
  });

  if (dragState) {
    drawDisk(
      {
        x: dragState.x - dragState.width / 2,
        y: dragState.y - dragState.height / 2,
        width: dragState.width,
        height: dragState.height,
      },
      dragState.disk,
      true,
      colors,
    );
  }
}

function getStandardDiskHeight(baseY, pegTopY, diskCount) {
  // 优先保持正常厚度；空间不足时压缩，但始终为顶部预留安全区。
  const preferredHeight = (baseY - pegTopY - 16) / diskCount;
  const maximumFittingHeight = getActiveTheme() === GENSHIN_THEME
    ? (baseY - STANDARD_BOARD_TOP_PADDING) / diskCount
    : (baseY - STANDARD_BOARD_TOP_SPACE)
      / (diskCount + STANDARD_PEG_CLEARANCE_LEVELS);
  return Math.min(
    STANDARD_DISK_MAX_HEIGHT,
    Math.max(STANDARD_DISK_MIN_HEIGHT, preferredHeight),
    maximumFittingHeight,
  );
}

function getDiskColor(disk) {
  const diskCount = Math.max(1, gameState?.disk_count || MAX_DISKS);
  const position = diskCount === 1 ? 0 : (diskCount - disk) / (diskCount - 1);
  const scaled = position * (diskGradientStops.length - 1);
  const index = Math.min(diskGradientStops.length - 2, Math.max(0, Math.floor(scaled)));
  return mixHexColors(
    diskGradientStops[index],
    diskGradientStops[index + 1],
    scaled - index,
  );
}

function mixHexColors(start, end, amount) {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);
  const mix = (channel) => Math.round(startRgb[channel] + (endRgb[channel] - startRgb[channel]) * amount);
  return rgbToHex(mix("r"), mix("g"), mix("b"));
}

function hexToRgb(color) {
  return {
    r: Number.parseInt(color.slice(1, 3), 16),
    g: Number.parseInt(color.slice(3, 5), 16),
    b: Number.parseInt(color.slice(5, 7), 16),
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function getCurrentGuideMove() {
  if (!gameState?.is_guide || gameState.guide_step <= 0) {
    return null;
  }

  const move = getGuideMove(gameState.guide_step - 1);
  if (!move) {
    return null;
  }

  const source = Number(move[0]);
  const target = Number(move[1]);
  if (
    !Number.isInteger(source) ||
    source < 0 ||
    source >= PEG_COUNT ||
    !Number.isInteger(target) ||
    target < 0 ||
    target >= PEG_COUNT ||
    source === target
  ) {
    return null;
  }

  return { source, target };
}

function getDiskRect(centerX, baseY, diskHeight, minDiskWidth, widthStep, disk, level) {
  const width = minDiskWidth + (disk - 1) * widthStep;
  return {
    x: centerX - width / 2,
    y: baseY - (level + 1) * diskHeight,
    width,
    height: diskHeight - 2,
  };
}

function drawGuideMoveArrow(sourceX, targetX, y, colors = getBoardColors()) {
  const direction = Math.sign(targetX - sourceX);
  if (!direction) {
    return;
  }

  const scale = 1;
  const endpointGap = 24;
  const startX = sourceX + direction * endpointGap;
  const endX = targetX - direction * endpointGap;
  const headLength = 18 * scale;
  const headWidth = 10 * scale;
  const headBaseX = endX - direction * headLength;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(15, 23, 42, 0.24)";
  ctx.shadowBlur = 5 * scale;

  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(headBaseX + direction * 3 * scale, y);
  ctx.strokeStyle = colors.guideArrowStroke;
  ctx.lineWidth = 6 * scale;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(startX, y);
  ctx.lineTo(headBaseX + direction * 3 * scale, y);
  ctx.strokeStyle = colors.guideArrowFill;
  ctx.lineWidth = 3 * scale;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(endX, y);
  ctx.lineTo(headBaseX, y - headWidth);
  ctx.lineTo(headBaseX + direction * 5 * scale, y);
  ctx.lineTo(headBaseX, y + headWidth);
  ctx.closePath();
  ctx.fillStyle = colors.guideArrowFill;
  ctx.fill();
  ctx.strokeStyle = colors.guideArrowStroke;
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  ctx.restore();
}

function drawDisk(rect, disk, lifted, colors = getBoardColors()) {
  const diskColor = getDiskColor(disk);
  const diskGradient = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.height);
  diskGradient.addColorStop(0, mixHexColors(diskColor, "#ffffff", 0.28));
  diskGradient.addColorStop(0.42, diskColor);
  diskGradient.addColorStop(1, mixHexColors(diskColor, "#000000", 0.16));

  ctx.save();
  ctx.shadowColor = lifted ? colors.diskShadowLifted : colors.diskShadow;
  ctx.shadowBlur = lifted ? 16 : 8;
  ctx.shadowOffsetY = lifted ? 8 : 3;
  ctx.fillStyle = diskGradient;
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 7);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = mixHexColors(diskColor, "#ffffff", 0.2);
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = colors.diskLabel;
  ctx.font = `700 ${Math.max(9, Math.min(12, rect.height - 4))}px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(disk), rect.x + rect.width / 2, rect.y + rect.height / 2);
  ctx.restore();
}

function getBoardColors() {
  const styles = getComputedStyle(document.documentElement);
  const cssColor = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;
  return {
    backgroundStart: cssColor("--board-bg-start", "#ffffff"),
    backgroundEnd: cssColor("--board-bg-end", "#eef3fb"),
    grid: cssColor("--board-grid", "rgba(100, 116, 139, 0.12)"),
    base: cssColor("--board-base", "#27364b"),
    peg: cssColor("--peg", "#748097"),
    pegLabel: cssColor("--peg-label", "#59657a"),
    target: cssColor("--target", "#0f9f6e"),
    targetLabel: cssColor("--target-label", "#0f7a55"),
    diskLabel: cssColor("--disk-label", "#ffffff"),
    diskShadow: cssColor("--disk-shadow", "rgba(15, 23, 42, 0.12)"),
    diskShadowLifted: cssColor("--disk-shadow-lifted", "rgba(15, 23, 42, 0.26)"),
    guideArrowFill: cssColor("--guide-arrow-fill", "#246bfe"),
    guideArrowStroke: cssColor("--guide-arrow-stroke", "#1649ad"),
    guideArrowAccent: cssColor("--guide-arrow-accent", "#ffffff"),
  };
}

function drawBackground(width, height, colors) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colors.backgroundStart);
  gradient.addColorStop(1, colors.backgroundEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;
  for (let y = 64; y < height - 80; y += 46) {
    ctx.beginPath();
    ctx.moveTo(42, y);
    ctx.lineTo(width - 42, y);
    ctx.stroke();
  }
}

function roundRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function getPegCenters(width) {
  if (getActiveTheme() === GENSHIN_THEME && genshinTheme.isReady()) {
    const height = elements.canvas.getBoundingClientRect().height;
    return genshinTheme.getPegCenters(width, height);
  }
  return [width * 0.2, width * 0.5, width * 0.8];
}

function usesCompactLayout() {
  return window.matchMedia?.(COMPACT_LANDSCAPE_MEDIA_QUERY).matches ?? false;
}

function getHighlightedPeg() {
  if (gameState?.is_guide) {
    return null;
  }
  if (gameState?.mode === PLAY_MODE && selectedPeg !== null) {
    return selectedPeg;
  }
  return hoveredPeg;
}

function getPegFromClientX(clientX) {
  const rect = elements.canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const centers = getPegCenters(rect.width);
  const leftEdge = centers[0] - (centers[1] - centers[0]) / 2;
  const rightEdge = centers[centers.length - 1]
    + (centers[centers.length - 1] - centers[centers.length - 2]) / 2;

  if (x < leftEdge || x > rightEdge) {
    return -1;
  }

  for (let index = 0; index < centers.length - 1; index += 1) {
    if (x < (centers[index] + centers[index + 1]) / 2) {
      return index;
    }
  }
  return centers.length - 1;
}

function canvasPoint(event) {
  const rect = elements.canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function hitDisk(point) {
  for (let index = diskRects.length - 1; index >= 0; index -= 1) {
    const rect = diskRects[index];
    if (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    ) {
      return rect;
    }
  }
  return null;
}

// 鼠标与触摸交互统一使用 Pointer Events。
function handlePointerDown(event) {
  if (isGenshinAssetWaitActive() || gameState?.mode !== "setup") {
    return;
  }

  const point = canvasPoint(event);
  const rect = hitDisk(point);
  if (!rect) {
    return;
  }

  dragState = {
    disk: rect.disk,
    sourcePeg: rect.peg,
    x: point.x,
    y: point.y,
    width: rect.width,
    height: rect.height,
  };
  elements.canvas.setPointerCapture(event.pointerId);
  setLocalStatus("setupDragHint");
  draw();
}

function handlePointerMove(event) {
  updateHoveredPegFromEvent(event);

  if (!dragState) {
    return;
  }

  const point = canvasPoint(event);
  dragState.x = point.x;
  dragState.y = point.y;
  draw();
}

function updateHoveredPegFromEvent(event) {
  if (
    isGenshinAssetWaitActive()
    || !gameState
    || gameState.mode === "home"
    || elements.gameView.hidden
  ) {
    setHoveredPeg(null);
    return;
  }
  if (gameState.is_guide) {
    setHoveredPeg(null);
    return;
  }
  if (gameState.mode === PLAY_MODE && selectedPeg !== null) {
    return;
  }

  const peg = getPegFromClientX(event.clientX);
  setHoveredPeg(peg < 0 ? null : peg);
}

function setHoveredPeg(peg) {
  if (hoveredPeg === peg) {
    return;
  }

  hoveredPeg = peg;
  draw();
}

function handlePointerUp(event) {
  if (!dragState) {
    return;
  }

  const target = getPegFromClientX(event.clientX);
  const disk = dragState.disk;
  const sourcePeg = dragState.sourcePeg;
  dragState = null;
  draw();

  if (target < 0 || target === sourcePeg) {
    setLocalStatus("setupMoveUnchanged");
    return;
  }

  moveSetupDisk(disk, target).catch((error) => {
    elements.statusText.textContent = error.message;
  });
}

function handleBoardClick(event) {
  if (isGenshinAssetWaitActive() || !gameState || gameState.mode !== "play") {
    return;
  }

  if (gameState.is_complete) {
    return;
  }

  const peg = getPegFromClientX(event.clientX);
  if (peg < 0) {
    return;
  }

  if (selectedPeg === null) {
    if (!gameState.pegs[peg].length) {
      setLocalStatus("selectNonEmptyPeg");
      return;
    }
    selectedPeg = peg;
    hoveredPeg = null;
    setLocalStatus("selectedPeg", { peg: peg + 1 });
    draw();
    return;
  }

  const source = selectedPeg;
  if (source === peg) {
    setLocalStatus("destinationMatchesSource");
    return;
  }

  selectedPeg = null;
  hoveredPeg = null;
  draw();
  moveDisk(source, peg).catch((error) => {
    elements.statusText.textContent = error.message;
  });
}

elements.homeButton.addEventListener("click", () => {
  goHome().catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
elements.languageButton.addEventListener("click", toggleLanguage);
elements.themeButton.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleThemeMenu();
});
elements.themeMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-theme-option]");
  if (!option) {
    return;
  }
  selectTheme(option.dataset.themeOption);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".theme-picker")) {
    closeThemeMenu();
  }
});
elements.homeNewGameButton.addEventListener("click", () => openConfig("play"));
elements.homeDemoButton.addEventListener("click", () => openConfig("demo"));
elements.homeSolverButton.addEventListener("click", () => openConfig("solver"));
elements.cancelConfigButton.addEventListener("click", closeConfig);
elements.configForm.addEventListener("submit", submitConfig);
elements.modalDiskCount.addEventListener("input", () => {
  updateDiskCountLimit();
  validateConfigSilently();
});
elements.undoButton.addEventListener("click", () => {
  handlePlayAction().catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
elements.redoButton.addEventListener("click", () => {
  redoMove().catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
elements.confirmSetupButton.addEventListener("click", () => {
  confirmSetup().catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
bindGuideStepButton(elements.previousButton, -1);
bindGuideStepButton(elements.nextButton, 1);
elements.guideStepSlider.addEventListener("input", (event) => {
  jumpGuideStep(event.target.value).catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
elements.canvas.addEventListener("pointerdown", handlePointerDown);
elements.canvas.addEventListener("pointermove", handlePointerMove);
elements.canvas.addEventListener("pointerup", handlePointerUp);
elements.canvas.addEventListener("pointercancel", () => {
  setHoveredPeg(null);
  dragState = null;
  draw();
});
elements.canvas.addEventListener("pointerleave", () => {
  setHoveredPeg(null);
});
elements.canvas.addEventListener("click", handleBoardClick);
window.addEventListener("resize", scheduleDraw);
window.visualViewport?.addEventListener("resize", scheduleDraw);

setInterval(updateTimer, 250);
installPullToRefreshGuard();
applyTheme();
resizeCanvas();
loadState().catch((error) => {
  elements.statusText.textContent = error.message;
});
