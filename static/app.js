const MIN_DISKS = 2;
const MAX_DISKS = 16;
const diskColors = [
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#0d9488",
  "#4f46e5",
  "#ca8a04",
  "#16a34a",
  "#9333ea",
  "#0284c7",
  "#e11d48",
];

const LANGUAGE_STORAGE_KEY = "hanoi-language";

const translations = {
  zh: {
    appTitle: "汉诺塔",
    languageButton: "English",
    controlsLabel: "游戏控制",
    loading: "加载中...",
    diskCountLabel: "盘子数量",
    newGameButton: "新游戏",
    undoButton: "撤回上一步",
    demoButton: "教学演示",
    previousButton: "上一步",
    nextButton: "下一步",
    exitDemoButton: "退出演示",
    statsLabel: "游戏统计",
    moveCountLabel: "总步数",
    elapsedTimeLabel: "总时间",
    minimumMovesLabel: "最少步数",
    boardLabel: "汉诺塔棋盘",
    demoProgressLabel: "演示进度",
    requestFailed: "请求失败",
    demoNotTimed: "不计时",
    defaultPlayStatus: "点击一个柱子，再点击目标柱子移动",
    defaultDemoStatus: "教学演示：使用上一步、下一步或底部滑条查看最少步骤",
    selectNonEmptyPeg: "请选择有盘子的柱子",
    selectedPeg: "已选择第 {peg} 根柱子",
    newGameStarted: "新游戏已开始",
    demoManualMoveBlocked: "教学演示模式中不能手动移动盘子",
    gameAlreadyComplete: "本局已完成，请开始新游戏",
    invalidMove: "无效移动：大盘子不能放在小盘子上",
    completeOnPeg: "完成！已移到第 {peg} 根柱子",
    moveSucceeded: "移动成功",
    demoUsePrevious: "教学演示模式中请使用上一步",
    nothingToUndo: "没有可撤回的步骤",
    undoSucceeded: "已撤回上一步",
    demoStarted: "教学演示已开启，共 {total} 步",
    notInDemo: "当前不在教学演示模式",
    alreadyLastStep: "已经是最后一步",
    demoNextStep: "第 {step} 步：将盘子从第 {source} 根移到第 {target} 根",
    alreadyFirstStep: "已经是第一步",
    demoBackToStart: "已回到初始状态",
    demoPreviousStep: "已回到第 {step} 步：盘子在第 {target} 根柱子",
    demoJumped: "已跳转到第 {step} / {total} 步",
    demoExited: "已退出教学演示模式",
  },
  en: {
    appTitle: "Tower of Hanoi",
    languageButton: "中文",
    controlsLabel: "Game controls",
    loading: "Loading...",
    diskCountLabel: "Disks",
    newGameButton: "New Game",
    undoButton: "Undo Move",
    demoButton: "Tutorial Demo",
    previousButton: "Previous",
    nextButton: "Next",
    exitDemoButton: "Exit Demo",
    statsLabel: "Game stats",
    moveCountLabel: "Moves",
    elapsedTimeLabel: "Time",
    minimumMovesLabel: "Minimum Moves",
    boardLabel: "Tower of Hanoi board",
    demoProgressLabel: "Demo Progress",
    requestFailed: "Request failed",
    demoNotTimed: "Not timed",
    defaultPlayStatus: "Click a peg with a disk, then click the destination peg.",
    defaultDemoStatus: "Tutorial demo: use Previous, Next, or the slider to preview the minimum path.",
    selectNonEmptyPeg: "Choose a peg that has disks.",
    selectedPeg: "Selected peg {peg}",
    newGameStarted: "New game started",
    demoManualMoveBlocked: "Manual moves are disabled in tutorial demo mode.",
    gameAlreadyComplete: "This game is complete. Start a new game.",
    invalidMove: "Invalid move: a larger disk cannot be placed on a smaller disk.",
    completeOnPeg: "Complete! All disks moved to peg {peg}.",
    moveSucceeded: "Move successful",
    demoUsePrevious: "Use Previous in tutorial demo mode.",
    nothingToUndo: "No move to undo",
    undoSucceeded: "Last move undone",
    demoStarted: "Tutorial demo started with {total} steps.",
    notInDemo: "Tutorial demo mode is not active.",
    alreadyLastStep: "Already at the last step",
    demoNextStep: "Step {step}: move a disk from peg {source} to peg {target}.",
    alreadyFirstStep: "Already at the first step",
    demoBackToStart: "Back to the initial state",
    demoPreviousStep: "Back to step {step}: the disk is on peg {target}.",
    demoJumped: "Jumped to step {step} / {total}.",
    demoExited: "Exited tutorial demo mode",
  },
};

const elements = {
  languageButton: document.querySelector("#languageButton"),
  canvas: document.querySelector("#board"),
  diskCount: document.querySelector("#diskCount"),
  newGameButton: document.querySelector("#newGameButton"),
  undoButton: document.querySelector("#undoButton"),
  demoButton: document.querySelector("#demoButton"),
  demoControls: document.querySelector("#demoControls"),
  demoPreviousButton: document.querySelector("#demoPreviousButton"),
  demoNextButton: document.querySelector("#demoNextButton"),
  demoExitButton: document.querySelector("#demoExitButton"),
  demoProgress: document.querySelector("#demoProgress"),
  demoSliderPanel: document.querySelector("#demoSliderPanel"),
  demoStepSlider: document.querySelector("#demoStepSlider"),
  demoSliderValue: document.querySelector("#demoSliderValue"),
  moveCount: document.querySelector("#moveCount"),
  elapsedTime: document.querySelector("#elapsedTime"),
  minimumMoves: document.querySelector("#minimumMoves"),
  statusText: document.querySelector("#statusText"),
};

const ctx = elements.canvas.getContext("2d");

let gameState = null;
let selectedPeg = null;
let lastSyncTime = performance.now();
let syncedElapsed = 0;
let demoJumpInFlight = false;
let pendingDemoStep = null;
let currentLanguage = loadLanguage();
let localStatusKey = "";
let localStatusArgs = {};

async function requestJson(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || t("requestFailed"));
  }
  return data;
}

async function loadState() {
  setState(await requestJson("/api/state"));
}

async function startNewGame() {
  const diskCount = clampDiskCount(elements.diskCount.value);
  selectedPeg = null;
  setState(
    await requestJson("/api/reset", {
      method: "POST",
      body: JSON.stringify({ disk_count: diskCount }),
    }),
  );
}

async function undoMove() {
  selectedPeg = null;
  setState(await requestJson("/api/undo", { method: "POST", body: "{}" }));
}

async function startDemo() {
  const diskCount = clampDiskCount(elements.diskCount.value);
  selectedPeg = null;
  setState(
    await requestJson("/api/demo/start", {
      method: "POST",
      body: JSON.stringify({ disk_count: diskCount }),
    }),
  );
}

async function showPreviousDemoStep() {
  selectedPeg = null;
  setState(await requestJson("/api/demo/previous", { method: "POST", body: "{}" }));
}

async function showNextDemoStep() {
  selectedPeg = null;
  setState(await requestJson("/api/demo/next", { method: "POST", body: "{}" }));
}

async function exitDemo() {
  selectedPeg = null;
  setState(await requestJson("/api/demo/exit", { method: "POST", body: "{}" }));
}

async function jumpDemoStep(step) {
  if (!gameState || !gameState.is_demo) {
    return;
  }

  pendingDemoStep = clampDemoStep(step);
  elements.demoStepSlider.value = pendingDemoStep;
  elements.demoSliderValue.textContent = `${pendingDemoStep} / ${gameState.demo_total_steps}`;

  if (demoJumpInFlight) {
    return;
  }

  demoJumpInFlight = true;
  try {
    while (pendingDemoStep !== null) {
      const targetStep = pendingDemoStep;
      pendingDemoStep = null;
      setState(
        await requestJson("/api/demo/jump", {
          method: "POST",
          body: JSON.stringify({ step: targetStep }),
        }),
      );
    }
  } finally {
    demoJumpInFlight = false;
  }
}

async function moveDisk(source, target) {
  setState(
    await requestJson("/api/move", {
      method: "POST",
      body: JSON.stringify({ source, target }),
    }),
  );
}

function setState(nextState) {
  gameState = nextState;
  localStatusKey = "";
  localStatusArgs = {};
  syncedElapsed = gameState.elapsed_seconds;
  lastSyncTime = performance.now();
  renderState();
}

function renderState() {
  if (!gameState) {
    elements.statusText.textContent = t("loading");
    return;
  }

  const isDemo = gameState.is_demo;
  elements.diskCount.value = gameState.disk_count;
  elements.moveCount.textContent = isDemo
    ? `${gameState.demo_step} / ${gameState.demo_total_steps}`
    : gameState.move_count;
  elements.minimumMoves.textContent = gameState.minimum_moves;
  elements.statusText.textContent = getStatusText();

  elements.demoControls.hidden = !isDemo;
  elements.demoButton.hidden = isDemo;
  elements.diskCount.disabled = isDemo;
  elements.newGameButton.disabled = isDemo;
  elements.undoButton.disabled = isDemo;
  elements.demoPreviousButton.disabled = !isDemo || gameState.demo_step <= 0;
  elements.demoNextButton.disabled = !isDemo || gameState.demo_step >= gameState.demo_total_steps;
  elements.demoProgress.textContent = isDemo ? `${gameState.demo_step} / ${gameState.demo_total_steps}` : "";
  elements.demoSliderPanel.hidden = !isDemo;
  elements.demoStepSlider.disabled = !isDemo;
  elements.demoStepSlider.max = String(gameState.demo_total_steps);
  elements.demoStepSlider.value = String(gameState.demo_step);
  elements.demoSliderValue.textContent = isDemo ? `${gameState.demo_step} / ${gameState.demo_total_steps}` : "";

  draw();
  updateTimer();
}

function getStatusText() {
  if (!gameState) {
    return t("loading");
  }

  if (localStatusKey) {
    return t(localStatusKey, localStatusArgs);
  }

  if (gameState.message_key) {
    return t(gameState.message_key, gameState.message_args || {});
  }

  return gameState.is_demo ? t("defaultDemoStatus") : t("defaultPlayStatus");
}

function loadLanguage() {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return savedLanguage === "en" ? "en" : "zh";
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "zh" ? "en" : "zh";
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  applyLanguage();
  renderState();
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";
  document.title = t("appTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  elements.languageButton.textContent = t("languageButton");
}

function t(key, args = {}) {
  const template = translations[currentLanguage][key] || translations.zh[key] || key;
  return template.replace(/\{(\w+)\}/g, (_match, name) => {
    return Object.prototype.hasOwnProperty.call(args, name) ? String(args[name]) : "";
  });
}

function setLocalStatus(key, args = {}) {
  localStatusKey = key;
  localStatusArgs = args;
  elements.statusText.textContent = t(key, args);
}

function clampDiskCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return gameState ? gameState.disk_count : 3;
  }
  return Math.min(MAX_DISKS, Math.max(MIN_DISKS, parsed));
}

function clampDemoStep(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || !gameState) {
    return 0;
  }
  return Math.min(gameState.demo_total_steps, Math.max(0, parsed));
}

function updateTimer() {
  if (!gameState) {
    return;
  }

  if (gameState.is_demo) {
    elements.elapsedTime.textContent = t("demoNotTimed");
    return;
  }

  const extra = gameState.is_complete ? 0 : Math.floor((performance.now() - lastSyncTime) / 1000);
  elements.elapsedTime.textContent = formatTime(syncedElapsed + extra);
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

function resizeCanvas() {
  const rect = elements.canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  elements.canvas.width = Math.floor(rect.width * scale);
  elements.canvas.height = Math.floor(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  draw();
}

function draw() {
  if (!gameState) {
    return;
  }

  const width = elements.canvas.clientWidth;
  const height = elements.canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  drawBackground(width, height);

  const centers = getPegCenters(width);
  const baseY = height - 68;
  const pegTopY = 56;
  const diskHeight = Math.max(12, Math.min(24, (baseY - pegTopY - 16) / gameState.disk_count));
  const pegHeight = baseY - pegTopY;

  ctx.fillStyle = "#27364b";
  roundRect(ctx, 44, baseY, width - 88, 14, 7);
  ctx.fill();

  centers.forEach((x, index) => {
    ctx.fillStyle = selectedPeg === index ? "#246bfe" : "#748097";
    roundRect(ctx, x - 7, pegTopY, 14, pegHeight, 7);
    ctx.fill();

    ctx.fillStyle = "#59657a";
    ctx.font = "700 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(String(index + 1), x, baseY + 42);
  });

  const maxDiskWidth = Math.min(290, width / 3 - 52);
  const minDiskWidth = 48;
  const widthStep = (maxDiskWidth - minDiskWidth) / Math.max(1, gameState.disk_count - 1);

  gameState.pegs.forEach((peg, pegIndex) => {
    const centerX = centers[pegIndex];
    peg.forEach((disk, level) => {
      const diskWidth = minDiskWidth + (disk - 1) * widthStep;
      const y = baseY - (level + 1) * diskHeight;
      const isSelectedTop = selectedPeg === pegIndex && level === peg.length - 1;

      ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = diskColors[(disk - 1) % diskColors.length];
      roundRect(ctx, centerX - diskWidth / 2, y, diskWidth, diskHeight - 2, 7);
      ctx.fill();
      ctx.shadowColor = "transparent";

      if (isSelectedTop) {
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 3;
        roundRect(ctx, centerX - diskWidth / 2, y, diskWidth, diskHeight - 2, 7);
        ctx.stroke();
      }

      const labelSize = Math.max(9, Math.min(12, diskHeight - 5));
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 ${labelSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(disk), centerX, y + diskHeight / 2 - 1);
    });
  });
}

function drawBackground(width, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(1, "#eef3fb");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(100, 116, 139, 0.12)";
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
  return [width * 0.2, width * 0.5, width * 0.8];
}

function getPegFromClientX(clientX) {
  const rect = elements.canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const centers = getPegCenters(rect.width);
  const zoneWidth = rect.width / 3;
  return centers.findIndex((center) => Math.abs(x - center) <= zoneWidth / 2);
}

async function handleBoardClick(event) {
  if (!gameState) {
    return;
  }

  if (gameState.is_demo) {
    setLocalStatus("demoManualMoveBlocked");
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
    if (gameState.pegs[peg].length === 0) {
      setLocalStatus("selectNonEmptyPeg");
      return;
    }
    selectedPeg = peg;
    setLocalStatus("selectedPeg", { peg: peg + 1 });
    draw();
    return;
  }

  const source = selectedPeg;
  selectedPeg = null;
  await moveDisk(source, peg);
}

elements.newGameButton.addEventListener("click", startNewGame);
elements.undoButton.addEventListener("click", undoMove);
elements.languageButton.addEventListener("click", toggleLanguage);
elements.demoButton.addEventListener("click", startDemo);
elements.demoPreviousButton.addEventListener("click", showPreviousDemoStep);
elements.demoNextButton.addEventListener("click", showNextDemoStep);
elements.demoExitButton.addEventListener("click", exitDemo);
elements.demoStepSlider.addEventListener("input", (event) => {
  jumpDemoStep(event.target.value).catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
elements.diskCount.addEventListener("change", () => {
  elements.diskCount.value = clampDiskCount(elements.diskCount.value);
});
elements.canvas.addEventListener("click", (event) => {
  handleBoardClick(event).catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
window.addEventListener("resize", resizeCanvas);

setInterval(updateTimer, 250);
applyLanguage();
resizeCanvas();
loadState().catch((error) => {
  elements.statusText.textContent = error.message;
});
