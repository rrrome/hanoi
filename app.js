const MIN_DISKS = 2;
const MAX_DISKS = 16;
const PEG_COUNT = 3;
const LANGUAGE_STORAGE_KEY = "hanoi-language";
const THEME_STORAGE_KEY = "hanoi-theme";
const DARK_THEME_QUERY = "(prefers-color-scheme: dark)";
const HOME_MODE = "home";
const PLAY_MODE = "play";
const DEMO_MODE = "demo";
const SETUP_MODE = "setup";
const SOLVER_MODE = "solver";
const GUIDE_MODES = new Set([DEMO_MODE, SOLVER_MODE]);

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

const translations = {
  zh: {
    appTitle: "汉诺塔",
    loading: "加载中...",
    homeButton: "主页",
    homeOpened: "已返回主页",
    homeStatus: "选择一个模式开始。",
    newGameButton: "新游戏",
    demoButton: "教学演示",
    solverButton: "残局破解",
    languageButton: "English",
    themeToDarkButton: "深色",
    themeToLightButton: "浅色",
    themeToggleLabel: "切换深色/浅色模式",
    undoButton: "撤回上一步",
    playAgainButton: "再来一局",
    confirmSetupButton: "确认残局",
    previousButton: "上一步",
    nextButton: "下一步",
    cancelButton: "取消",
    startButton: "开始",
    diskCountLabel: "盘子数量",
    diskCountHint: "请输入 2 到 16 之间的整数。",
    initialPegLabel: "初始盘子位置",
    targetPegLabel: "目标盘子位置",
    pegOption: "第 {peg} 根柱子",
    playTargetHint: "新游戏可选择一个或多个目标柱。",
    singleTargetHint: "请选择一个目标柱。",
    statsLabel: "游戏统计",
    moveCountLabel: "总步数",
    stepCountLabel: "当前步数",
    elapsedTimeLabel: "总时间",
    minimumMovesLabel: "最少步数",
    solutionStepsLabel: "破解步数",
    boardLabel: "汉诺塔棋盘",
    guideProgressLabel: "演示进度",
    requestFailed: "请求失败",
    notTimed: "不计时",
    modePlay: "新游戏",
    modeDemo: "教学演示",
    modeSetup: "设置残局",
    modeSolver: "残局破解",
    playConfigHint: "输入 2-16 个盘子，选择初始柱和目标柱。目标默认第 2 或第 3 根柱子均可。",
    demoConfigHint: "输入 2-16 个盘子，选择初始柱和唯一目标柱，系统会生成最少步骤。",
    solverConfigHint: "输入 2-16 个盘子，选择初始柱和唯一目标柱，然后拖动盘子设置残局。",
    diskCountInvalid: "盘子数量必须是 2 到 16 之间的整数。",
    targetConflict: "初始位置不能同时作为目标位置。",
    targetRequired: "请选择一个目标位置。",
    defaultPlayStatus: "点击一个柱子，再点击目标柱子移动。",
    defaultGuideStatus: "使用上一步、下一步或底部滑条查看步骤。",
    defaultSetupStatus: "拖动任意盘子到任意柱子，确认后开始破解。",
    manualMoveBlocked: "当前模式不能手动移动盘子",
    undoBlocked: "当前模式不能撤回手动移动",
    selectNonEmptyPeg: "请选择有盘子的柱子",
    selectedPeg: "已选择第 {peg} 根柱子",
    setupInvalidMove: "无效摆放：大盘子不能放在小盘子上。",
    setupDragHint: "拖动盘子到目标柱子。",
    setupMoveUnchanged: "盘子位置未改变",
    setupMoveSucceeded: "盘子位置已更新",
    setupStarted: "请拖动盘子设置残局",
    notInSetup: "当前不在残局设置模式",
    solverStarted: "残局破解已开始，共 {total} 步",
    newGameStarted: "新游戏已开始",
    gameAlreadyComplete: "本局已完成，请开始新游戏",
    invalidMove: "无效移动：大盘子不能放在小盘子上",
    completeOnPeg: "完成！已移到第 {peg} 根柱子",
    moveSucceeded: "移动成功",
    nothingToUndo: "没有可撤回的步骤",
    undoSucceeded: "已撤回上一步",
    demoStarted: "教学演示已开启，共 {total} 步",
    notInGuide: "当前不在步骤演示模式",
    alreadyLastStep: "已经是最后一步",
    alreadyFirstStep: "已经是第一步",
    guideBackToStart: "已回到起始状态",
    guideNextStep: "第 {step} 步：将盘子从第 {source} 根移到第 {target} 根",
    guidePreviousStep: "已回到第 {step} 步：盘子在第 {target} 根柱子",
    guideJumped: "已跳转到第 {step} / {total} 步",
    summaryInitial: "初始：第 {initial} 根",
    summaryTargets: "目标：{targets}",
    targetList: "第 {targets} 根",
  },
  en: {
    appTitle: "Tower of Hanoi",
    loading: "Loading...",
    homeButton: "Home",
    homeOpened: "Returned to the home screen",
    homeStatus: "Choose a mode to start.",
    newGameButton: "New Game",
    demoButton: "Tutorial Demo",
    solverButton: "Endgame Solver",
    languageButton: "中文",
    themeToDarkButton: "Dark",
    themeToLightButton: "Light",
    themeToggleLabel: "Toggle dark/light mode",
    undoButton: "Undo Move",
    playAgainButton: "Play Again",
    confirmSetupButton: "Confirm State",
    previousButton: "Previous",
    nextButton: "Next",
    cancelButton: "Cancel",
    startButton: "Start",
    diskCountLabel: "Disks",
    diskCountHint: "Enter an integer from 2 to 16.",
    initialPegLabel: "Initial peg",
    targetPegLabel: "Target peg",
    pegOption: "Peg {peg}",
    playTargetHint: "New games may use one or more target pegs.",
    singleTargetHint: "Choose one target peg.",
    statsLabel: "Game stats",
    moveCountLabel: "Moves",
    stepCountLabel: "Current Step",
    elapsedTimeLabel: "Time",
    minimumMovesLabel: "Minimum Moves",
    solutionStepsLabel: "Solution Steps",
    boardLabel: "Tower of Hanoi board",
    guideProgressLabel: "Progress",
    requestFailed: "Request failed",
    notTimed: "Not timed",
    modePlay: "New Game",
    modeDemo: "Tutorial Demo",
    modeSetup: "Set Endgame State",
    modeSolver: "Endgame Solver",
    playConfigHint: "Enter 2-16 disks, choose the initial peg and target. By default, Peg 2 or Peg 3 wins.",
    demoConfigHint: "Enter 2-16 disks, choose the initial peg and one target peg. The shortest solution is generated.",
    solverConfigHint: "Enter 2-16 disks, choose the initial peg and one target peg, then drag disks to set the endgame state.",
    diskCountInvalid: "Disk count must be an integer from 2 to 16.",
    targetConflict: "The initial peg cannot also be a target peg.",
    targetRequired: "Choose one target peg.",
    defaultPlayStatus: "Click a peg with a disk, then click the destination peg.",
    defaultGuideStatus: "Use Previous, Next, or the slider to inspect each step.",
    defaultSetupStatus: "Drag any disk to any peg, then confirm the state to solve it.",
    manualMoveBlocked: "Manual moves are disabled in this mode.",
    undoBlocked: "Undo is disabled in this mode.",
    selectNonEmptyPeg: "Choose a peg that has disks.",
    selectedPeg: "Selected peg {peg}",
    setupInvalidMove: "Invalid placement: a larger disk cannot be placed on a smaller disk.",
    setupDragHint: "Drag the disk to a target peg.",
    setupMoveUnchanged: "Disk position unchanged",
    setupMoveSucceeded: "Disk position updated",
    setupStarted: "Drag disks to set the endgame state",
    notInSetup: "Endgame setup mode is not active.",
    solverStarted: "Endgame solver started with {total} steps.",
    newGameStarted: "New game started",
    gameAlreadyComplete: "This game is complete. Start a new game.",
    invalidMove: "Invalid move: a larger disk cannot be placed on a smaller disk.",
    completeOnPeg: "Complete! All disks moved to peg {peg}.",
    moveSucceeded: "Move successful",
    nothingToUndo: "No move to undo",
    undoSucceeded: "Last move undone",
    demoStarted: "Tutorial demo started with {total} steps.",
    notInGuide: "Step guide mode is not active.",
    alreadyLastStep: "Already at the last step",
    alreadyFirstStep: "Already at the first step",
    guideBackToStart: "Back to the starting state",
    guideNextStep: "Step {step}: move a disk from peg {source} to peg {target}.",
    guidePreviousStep: "Back to step {step}: the disk is on peg {target}.",
    guideJumped: "Jumped to step {step} / {total}.",
    summaryInitial: "Initial: Peg {initial}",
    summaryTargets: "Target: {targets}",
    targetList: "Peg {targets}",
  },
};

const elements = {
  languageButton: document.querySelector("#languageButton"),
  themeButton: document.querySelector("#themeButton"),
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
  initialPegButtons: document.querySelector("#initialPegButtons"),
  targetPegButtons: document.querySelector("#targetPegButtons"),
  configError: document.querySelector("#configError"),
  cancelConfigButton: document.querySelector("#cancelConfigButton"),
};

const ctx = elements.canvas.getContext("2d");
const themeMedia = window.matchMedia?.(DARK_THEME_QUERY) || null;

let gameState = null;
let currentLanguage = loadLanguage();
let selectedTheme = loadSavedTheme();
let configKind = "play";
let selectedPeg = null;
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
const session = createSession();

async function readLocalState() {
  return sessionState();
}

async function runAction(action, payload = {}) {
  switch (action) {
    case "home":
      return goHomeSession();
    case "start-play":
      return startPlaySession(
        payload.disk_count,
        payload.initial_peg,
        Array.isArray(payload.target_pegs) ? payload.target_pegs : [],
      );
    case "move":
      return moveSession(payload.source, payload.target);
    case "undo":
      return undoSession();
    case "start-demo":
      return startDemoSession(payload.disk_count, payload.initial_peg, payload.target_peg);
    case "setup-solver":
      return startSolverSetupSession(payload.disk_count, payload.initial_peg, payload.target_peg);
    case "move-setup-disk":
      return moveSetupDiskSession(payload.disk, payload.target);
    case "start-solver":
      return startSolverSession();
    case "guide-next":
      return guideNextSession();
    case "guide-previous":
      return guidePreviousSession();
    case "guide-jump":
      return guideJumpSession(payload.step);
    default:
      throw new Error(t("requestFailed"));
  }
}

function createSession() {
  return {
    game: createGame(3, 0, [1, 2]),
    mode: HOME_MODE,
    startTime: performance.now(),
    finished: false,
    finishedElapsedSeconds: null,
    guideMoves: [],
    guideStep: 0,
    guideStartPegs: [],
    guideTargetPeg: 2,
  };
}

function createGame(diskCount, initialPeg, targetPegs) {
  const game = {
    diskCount: 3,
    initialPeg: 0,
    targetPegs: [1, 2],
    pegs: [],
    moveCount: 0,
    history: [],
  };
  resetGame(game, diskCount, initialPeg, targetPegs);
  return game;
}

function sessionState(messageKey = "", messageArgs = {}) {
  const isGuide = GUIDE_MODES.has(session.mode);
  const completionPeg = getCompletionPeg(session.game);
  return {
    mode: session.mode,
    is_home: session.mode === HOME_MODE,
    is_play: session.mode === PLAY_MODE,
    is_setup: session.mode === SETUP_MODE,
    is_guide: isGuide,
    is_demo: session.mode === DEMO_MODE,
    is_solver: session.mode === SOLVER_MODE,
    disk_count: session.game.diskCount,
    initial_peg: session.game.initialPeg,
    target_pegs: [...session.game.targetPegs],
    target_peg: [DEMO_MODE, SETUP_MODE, SOLVER_MODE].includes(session.mode) ? session.guideTargetPeg : null,
    pegs: snapshotGame(session.game),
    move_count: session.game.moveCount,
    minimum_moves: getMinimumMoves(session.game.diskCount),
    elapsed_seconds: elapsedSeconds(),
    is_complete: isComplete(session.game),
    completion_peg: completionPeg,
    guide_step: isGuide ? session.guideStep : 0,
    guide_total_steps: isGuide ? session.guideMoves.length : 0,
    message: "",
    message_key: messageKey,
    message_args: messageArgs,
  };
}

function goHomeSession() {
  session.mode = HOME_MODE;
  clearGuide();
  session.finished = false;
  session.finishedElapsedSeconds = null;
  return sessionState("homeOpened");
}

function startPlaySession(diskCount, initialPeg, targetPegs) {
  const normalizedTargets = validateTargetPegs(targetPegs);
  validateStartConfig(diskCount, initialPeg, normalizedTargets);
  resetGame(session.game, diskCount, initialPeg, normalizedTargets);
  session.mode = PLAY_MODE;
  session.startTime = performance.now();
  session.finished = false;
  session.finishedElapsedSeconds = null;
  clearGuide();
  return sessionState("newGameStarted");
}

function moveSession(source, target) {
  if (session.mode !== PLAY_MODE) {
    return sessionState("manualMoveBlocked");
  }
  if (session.finished) {
    return sessionState("gameAlreadyComplete");
  }
  if (!moveTopDisk(session.game, source, target)) {
    return sessionState("invalidMove");
  }
  if (isComplete(session.game)) {
    session.finished = true;
    session.finishedElapsedSeconds = elapsedSeconds();
    return sessionState("completeOnPeg", { peg: getCompletionPeg(session.game) + 1 });
  }
  return sessionState("moveSucceeded");
}

function undoSession() {
  if (session.mode !== PLAY_MODE) {
    return sessionState("undoBlocked");
  }
  if (!undoGame(session.game)) {
    return sessionState("nothingToUndo");
  }
  if (session.finishedElapsedSeconds !== null) {
    session.startTime = performance.now() - session.finishedElapsedSeconds * 1000;
  }
  session.finished = false;
  session.finishedElapsedSeconds = null;
  return sessionState("undoSucceeded");
}

function startDemoSession(diskCount, initialPeg, targetPeg) {
  validateStartConfig(diskCount, initialPeg, [Number(targetPeg)]);
  const spare = otherPeg(Number(initialPeg), Number(targetPeg));
  resetGame(session.game, diskCount, initialPeg, [Number(targetPeg)]);
  session.mode = DEMO_MODE;
  session.guideTargetPeg = Number(targetPeg);
  session.guideStartPegs = snapshotGame(session.game);
  session.guideMoves = buildMinimumSolution(Number(diskCount), Number(initialPeg), Number(targetPeg), spare);
  session.guideStep = 0;
  session.finished = false;
  session.finishedElapsedSeconds = null;
  return sessionState("demoStarted", { total: session.guideMoves.length });
}

function startSolverSetupSession(diskCount, initialPeg, targetPeg) {
  validateStartConfig(diskCount, initialPeg, [Number(targetPeg)]);
  resetGame(session.game, diskCount, initialPeg, [Number(targetPeg)]);
  session.mode = SETUP_MODE;
  session.guideTargetPeg = Number(targetPeg);
  clearGuide(true);
  session.finished = false;
  session.finishedElapsedSeconds = null;
  return sessionState("setupStarted");
}

function moveSetupDiskSession(disk, target) {
  if (session.mode !== SETUP_MODE) {
    return sessionState("notInSetup");
  }
  validatePeg(Number(target));
  const source = diskLocation(session.game, Number(disk));
  if (source === Number(target)) {
    return sessionState("setupMoveUnchanged");
  }
  if (!moveAnyDisk(session.game, Number(disk), Number(target))) {
    return sessionState("setupMoveUnchanged");
  }
  return sessionState("setupMoveSucceeded");
}

function startSolverSession() {
  if (session.mode !== SETUP_MODE) {
    return sessionState("notInSetup");
  }
  session.guideStartPegs = snapshotGame(session.game);
  session.guideMoves = buildSolutionFromState(session.guideStartPegs, session.guideTargetPeg);
  session.guideStep = 0;
  session.mode = SOLVER_MODE;
  loadGameState(session.game, session.guideStartPegs, [session.guideTargetPeg]);
  return sessionState("solverStarted", { total: session.guideMoves.length });
}

function guideNextSession() {
  if (!GUIDE_MODES.has(session.mode)) {
    return sessionState("notInGuide");
  }
  if (session.guideStep >= session.guideMoves.length) {
    return sessionState("alreadyLastStep");
  }
  const [source, target] = session.guideMoves[session.guideStep];
  if (!moveTopDisk(session.game, source, target)) {
    throw new Error("Generated guide move is invalid.");
  }
  session.guideStep += 1;
  return sessionState("guideNextStep", { step: session.guideStep, source: source + 1, target: target + 1 });
}

function guidePreviousSession() {
  if (!GUIDE_MODES.has(session.mode)) {
    return sessionState("notInGuide");
  }
  if (session.guideStep === 0) {
    return sessionState("alreadyFirstStep");
  }
  if (!undoGame(session.game)) {
    throw new Error("Cannot undo generated guide move.");
  }
  session.guideStep -= 1;
  if (session.guideStep === 0) {
    return sessionState("guideBackToStart");
  }
  const [source, target] = session.guideMoves[session.guideStep - 1];
  return sessionState("guidePreviousStep", { step: session.guideStep, source: source + 1, target: target + 1 });
}

function guideJumpSession(step) {
  if (!GUIDE_MODES.has(session.mode)) {
    return sessionState("notInGuide");
  }
  const targetStep = Number(step);
  if (targetStep < 0 || targetStep > session.guideMoves.length) {
    throw new Error(`Step must be between 0 and ${session.guideMoves.length}.`);
  }
  loadGameState(session.game, session.guideStartPegs, [session.guideTargetPeg]);
  session.guideMoves.slice(0, targetStep).forEach(([source, target]) => {
    if (!moveTopDisk(session.game, source, target)) {
      throw new Error("Generated guide move is invalid.");
    }
  });
  session.guideStep = targetStep;
  return sessionState("guideJumped", { step: session.guideStep, total: session.guideMoves.length });
}

function elapsedSeconds() {
  if (session.mode !== PLAY_MODE) {
    return 0;
  }
  if (session.finishedElapsedSeconds !== null) {
    return session.finishedElapsedSeconds;
  }
  return Math.floor((performance.now() - session.startTime) / 1000);
}

function clearGuide(keepTarget = false) {
  session.guideMoves = [];
  session.guideStep = 0;
  session.guideStartPegs = [];
  if (!keepTarget) {
    session.guideTargetPeg = 2;
  }
}

function resetGame(game, diskCount = game.diskCount, initialPeg = game.initialPeg, targetPegs = game.targetPegs) {
  const count = Number(diskCount);
  const initial = Number(initialPeg);
  const targets = validateTargetPegs(targetPegs);
  validateDiskCount(count);
  validatePeg(initial);
  if (targets.includes(initial)) {
    throw new Error("Initial peg cannot also be a target peg.");
  }
  game.diskCount = count;
  game.initialPeg = initial;
  game.targetPegs = targets;
  game.pegs = Array.from({ length: PEG_COUNT }, () => []);
  game.pegs[initial] = Array.from({ length: count }, (_item, index) => count - index);
  game.moveCount = 0;
  game.history = [];
}

function loadGameState(game, pegs, targetPegs) {
  const diskCount = pegs.reduce((total, peg) => total + peg.length, 0);
  game.diskCount = diskCount;
  game.pegs = validatePegs(pegs, diskCount);
  game.targetPegs = validateTargetPegs(targetPegs);
  game.initialPeg = inferInitialPeg(game);
  game.moveCount = 0;
  game.history = [];
}

function moveTopDisk(game, source, target) {
  const sourcePeg = Number(source);
  const targetPeg = Number(target);
  validatePeg(sourcePeg);
  validatePeg(targetPeg);
  if (sourcePeg === targetPeg || !game.pegs[sourcePeg].length) {
    return false;
  }
  const disk = game.pegs[sourcePeg][game.pegs[sourcePeg].length - 1];
  const targetStack = game.pegs[targetPeg];
  if (targetStack.length && targetStack[targetStack.length - 1] < disk) {
    return false;
  }
  game.pegs[sourcePeg].pop();
  targetStack.push(disk);
  game.history.push({ source: sourcePeg, target: targetPeg, disk });
  game.moveCount += 1;
  return true;
}

function moveAnyDisk(game, disk, target) {
  validatePeg(target);
  if (disk < 1 || disk > game.diskCount) {
    throw new Error(`Disk must be between 1 and ${game.diskCount}.`);
  }
  const source = diskLocation(game, disk);
  if (source === target) {
    return false;
  }
  const sourceStack = game.pegs[source];
  sourceStack.splice(sourceStack.indexOf(disk), 1);
  const targetStack = game.pegs[target];
  const insertAt = targetStack.findIndex((targetDisk) => targetDisk < disk);
  targetStack.splice(insertAt === -1 ? targetStack.length : insertAt, 0, disk);
  return true;
}

function diskLocation(game, disk) {
  for (let pegIndex = 0; pegIndex < game.pegs.length; pegIndex += 1) {
    if (game.pegs[pegIndex].includes(disk)) {
      return pegIndex;
    }
  }
  throw new Error(`Disk ${disk} is not on the board.`);
}

function undoGame(game) {
  if (!game.history.length) {
    return false;
  }
  const { source, target, disk } = game.history.pop();
  const targetStack = game.pegs[target];
  if (!targetStack.length || targetStack[targetStack.length - 1] !== disk) {
    throw new Error("Game history is inconsistent with the current board.");
  }
  targetStack.pop();
  game.pegs[source].push(disk);
  game.moveCount = Math.max(0, game.moveCount - 1);
  return true;
}

function validateDiskCount(diskCount) {
  if (!Number.isInteger(Number(diskCount)) || diskCount < MIN_DISKS || diskCount > MAX_DISKS) {
    throw new Error(`Disk count must be between ${MIN_DISKS} and ${MAX_DISKS}.`);
  }
}

function validatePeg(peg) {
  if (!Number.isInteger(Number(peg)) || peg < 0 || peg >= PEG_COUNT) {
    throw new Error(`Peg index must be between 0 and ${PEG_COUNT - 1}.`);
  }
}

function validateTargetPegs(targetPegs) {
  const normalized = [...new Set([...targetPegs].map(Number))].sort((a, b) => a - b);
  if (!normalized.length) {
    throw new Error("At least one target peg is required.");
  }
  normalized.forEach(validatePeg);
  return normalized;
}

function validatePegs(pegs, diskCount) {
  validateDiskCount(diskCount);
  if (pegs.length !== PEG_COUNT) {
    throw new Error(`Expected ${PEG_COUNT} pegs.`);
  }
  const seen = [];
  const normalized = pegs.map((peg) => {
    const pegDisks = peg.map(Number);
    for (let index = 0; index < pegDisks.length - 1; index += 1) {
      if (pegDisks[index] < pegDisks[index + 1]) {
        throw new Error("Each peg must be ordered from larger disks to smaller disks.");
      }
    }
    seen.push(...pegDisks);
    return pegDisks;
  });
  const expected = Array.from({ length: diskCount }, (_item, index) => index + 1).join(",");
  if ([...seen].sort((a, b) => a - b).join(",") !== expected) {
    throw new Error(`Board must contain every disk from 1 to ${diskCount} exactly once.`);
  }
  return normalized;
}

function validateStartConfig(diskCount, initialPeg, targetPegs) {
  validateDiskCount(Number(diskCount));
  validatePeg(Number(initialPeg));
  const targets = validateTargetPegs(targetPegs);
  if (targets.includes(Number(initialPeg))) {
    throw new Error("Initial peg cannot also be a target peg.");
  }
}

function buildMinimumSolution(diskCount, source = 0, target = 2, auxiliary = 1) {
  validateDiskCount(diskCount);
  validatePeg(source);
  validatePeg(target);
  validatePeg(auxiliary);
  if (new Set([source, target, auxiliary]).size !== PEG_COUNT) {
    throw new Error("Source, target, and auxiliary pegs must be different.");
  }
  const moves = [];
  function solve(count, start, end, spare) {
    if (count === 0) {
      return;
    }
    solve(count - 1, start, spare, end);
    moves.push([start, end]);
    solve(count - 1, spare, end, start);
  }
  solve(diskCount, source, target, auxiliary);
  return moves;
}

function buildSolutionFromState(pegs, target) {
  validatePeg(target);
  const diskCount = pegs.reduce((total, peg) => total + peg.length, 0);
  validateDiskCount(diskCount);
  const board = validatePegs(pegs, diskCount);
  const positions = diskPositions(board, diskCount);
  const moves = [];
  function solve(maxDisk, destination) {
    if (maxDisk === 0) {
      return;
    }
    const source = positions[maxDisk];
    if (source === destination) {
      solve(maxDisk - 1, destination);
      return;
    }
    const spare = otherPeg(source, destination);
    solve(maxDisk - 1, spare);
    moves.push([source, destination]);
    positions[maxDisk] = destination;
    solve(maxDisk - 1, destination);
  }
  solve(diskCount, target);
  return moves;
}

function diskPositions(pegs, diskCount) {
  const positions = {};
  pegs.forEach((peg, pegIndex) => {
    peg.forEach((disk) => {
      positions[disk] = pegIndex;
    });
  });
  if (Object.keys(positions).length !== diskCount) {
    throw new Error("Board has duplicate or missing disks.");
  }
  return positions;
}

function otherPeg(first, second) {
  validatePeg(first);
  validatePeg(second);
  if (first === second) {
    throw new Error("Source and target pegs must be different.");
  }
  return [0, 1, 2].find((peg) => peg !== first && peg !== second);
}

function snapshotGame(game) {
  return game.pegs.map((peg) => [...peg]);
}

function isComplete(game) {
  return game.targetPegs.some((peg) => game.pegs[peg].length === game.diskCount);
}

function getCompletionPeg(game) {
  return game.targetPegs.find((peg) => game.pegs[peg].length === game.diskCount) ?? null;
}

function getMinimumMoves(diskCount) {
  return 2 ** diskCount - 1;
}

function inferInitialPeg(game) {
  const inferred = game.pegs.findIndex((peg) => peg.length === game.diskCount);
  return inferred === -1 ? 0 : inferred;
}

async function loadState() {
  setState(await readLocalState());
}

async function goHome() {
  selectedPeg = null;
  dragState = null;
  setState(await runAction("home"));
}

function openConfig(kind) {
  configKind = kind;
  elements.configError.textContent = "";
  elements.modalDiskCount.value = gameState?.disk_count || 3;
  configInitialPeg = 0;
  configTargetPegs = kind === "play" ? [1, 2] : [2];

  const titleKey = kind === "play" ? "modePlay" : kind === "demo" ? "modeDemo" : "modeSolver";
  const hintKey = kind === "play" ? "playConfigHint" : kind === "demo" ? "demoConfigHint" : "solverConfigHint";
  elements.configTitle.textContent = t(titleKey);
  elements.configHint.textContent = `${t(hintKey)} ${t(kind === "play" ? "playTargetHint" : "singleTargetHint")}`;
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
  if (Number.isNaN(diskCount) || diskCount < MIN_DISKS || diskCount > MAX_DISKS) {
    return { ok: false, error: t("diskCountInvalid") };
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

async function undoMove() {
  selectedPeg = null;
  setState(await runAction("undo"));
}

async function restartCurrentPlay() {
  if (!gameState || gameState.mode !== "play") {
    return;
  }

  selectedPeg = null;
  dragState = null;
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
  dragState = null;
  setState(await runAction("start-solver"));
}

async function showPreviousStep() {
  selectedPeg = null;
  setState(await runAction("guide-previous"));
}

async function showNextStep() {
  selectedPeg = null;
  setState(await runAction("guide-next"));
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
  setState(await runAction("move", { source, target }));
}

async function moveSetupDisk(disk, target) {
  setState(await runAction("move-setup-disk", { disk, target }));
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

  const isHome = gameState.mode === "home";
  elements.homeView.hidden = !isHome;
  elements.gameView.hidden = isHome;
  elements.homeButton.hidden = isHome;
  elements.languageButton.hidden = !isHome;
  elements.statusText.textContent = getStatusText();

  if (isHome) {
    return;
  }

  elements.modeTitle.textContent = getModeTitle();
  elements.modeSummary.textContent = getModeSummary();
  elements.undoButton.hidden = gameState.mode !== "play";
  elements.undoButton.textContent = gameState.is_complete ? t("playAgainButton") : t("undoButton");
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

function loadLanguage() {
  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return savedLanguage === "en" ? "en" : "zh";
}

function loadSavedTheme() {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "dark" || savedTheme === "light" ? savedTheme : "";
}

function getSystemTheme() {
  return themeMedia?.matches ? "dark" : "light";
}

function getActiveTheme() {
  return selectedTheme || getSystemTheme();
}

function toggleTheme() {
  selectedTheme = getActiveTheme() === "dark" ? "light" : "dark";
  window.localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
  applyTheme();
}

function applyTheme() {
  document.documentElement.dataset.theme = getActiveTheme();
  updateThemeButton();
  scheduleDraw();
}

function updateThemeButton() {
  const nextThemeKey = getActiveTheme() === "dark" ? "themeToLightButton" : "themeToDarkButton";
  elements.themeButton.textContent = t(nextThemeKey);
  elements.themeButton.setAttribute("aria-label", t("themeToggleLabel"));
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
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
  elements.languageButton.textContent = t("languageButton");
  updateThemeButton();
  renderPegButtons();
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
  return template.replace(/\{(\w+)\}/g, (_match, name) => {
    return Object.prototype.hasOwnProperty.call(args, name) ? String(args[name]) : "";
  });
}

function setLocalStatus(key, args = {}) {
  localStatusKey = key;
  localStatusArgs = args;
  elements.statusText.textContent = t(key, args);
}

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
  drawBackground(width, height, colors);

  const centers = getPegCenters(width);
  const baseY = height - 68;
  const pegTopY = 56;
  const diskHeight = Math.max(12, Math.min(24, (baseY - pegTopY - 16) / gameState.disk_count));
  const pegHeight = baseY - pegTopY;

  ctx.fillStyle = colors.base;
  roundRect(ctx, 44, baseY, width - 88, 14, 7);
  ctx.fill();

  const targetPegs = gameState.mode === "play" ? [] : getDisplayTargetPegs();

  centers.forEach((x, index) => {
    const isTarget = targetPegs.includes(index);
    const isSelected = gameState.mode === "play" && selectedPeg === index;
    const isGreenPeg = isTarget || isSelected;

    ctx.fillStyle = isGreenPeg ? colors.target : colors.peg;
    roundRect(ctx, x - 7, pegTopY, 14, pegHeight, 7);
    ctx.fill();

    ctx.fillStyle = isGreenPeg ? colors.targetLabel : colors.pegLabel;
    ctx.font = "700 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(String(index + 1), x, baseY + 42);
  });

  const maxDiskWidth = Math.min(290, width / 3 - 52);
  const minDiskWidth = 48;
  const widthStep = (maxDiskWidth - minDiskWidth) / Math.max(1, gameState.disk_count - 1);
  const guideOrigin = getGuideMoveOrigin();

  if (guideOrigin) {
    const originRect = getDiskRect(
      centers[guideOrigin.peg],
      baseY,
      diskHeight,
      minDiskWidth,
      widthStep,
      guideOrigin.disk,
      guideOrigin.level,
    );
    drawGuideOrigin(originRect, guideOrigin.disk, colors);
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

function getGuideMoveOrigin() {
  if (!gameState?.is_guide || gameState.guide_step <= 0) {
    return null;
  }

  const lastMove = session.game.history[session.game.history.length - 1];
  if (!lastMove) {
    return null;
  }

  const peg = Number(lastMove.source);
  const disk = Number(lastMove.disk);
  if (
    !Number.isInteger(peg) ||
    peg < 0 ||
    peg >= PEG_COUNT ||
    !Number.isInteger(disk) ||
    disk < 1 ||
    disk > gameState.disk_count
  ) {
    return null;
  }

  return {
    disk,
    peg,
    level: gameState.pegs[peg]?.length ?? 0,
  };
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

function drawGuideOrigin(rect, disk, colors = getBoardColors()) {
  ctx.save();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = colors.guideOriginFill;
  ctx.strokeStyle = colors.guideOriginStroke;
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 6]);
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 7);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = colors.guideOriginLabel;
  ctx.font = `700 ${Math.max(9, Math.min(12, rect.height - 4))}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(disk), rect.x + rect.width / 2, rect.y + rect.height / 2);
  ctx.restore();
}

function drawDisk(rect, disk, lifted, colors = getBoardColors()) {
  ctx.shadowColor = lifted ? colors.diskShadowLifted : colors.diskShadow;
  ctx.shadowBlur = lifted ? 16 : 8;
  ctx.shadowOffsetY = lifted ? 8 : 3;
  ctx.fillStyle = diskColors[(disk - 1) % diskColors.length];
  roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 7);
  ctx.fill();
  ctx.shadowColor = "transparent";

  ctx.fillStyle = colors.diskLabel;
  ctx.font = `700 ${Math.max(9, Math.min(12, rect.height - 4))}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(disk), rect.x + rect.width / 2, rect.y + rect.height / 2);
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
    guideOriginFill: cssColor("--guide-origin-fill", "rgba(36, 107, 254, 0.07)"),
    guideOriginStroke: cssColor("--guide-origin-stroke", "rgba(36, 107, 254, 0.38)"),
    guideOriginLabel: cssColor("--guide-origin-label", "#94a3b8"),
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
  return [width * 0.2, width * 0.5, width * 0.8];
}

function getPegFromClientX(clientX) {
  const rect = elements.canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const centers = getPegCenters(rect.width);
  const zoneWidth = rect.width / 3;
  return centers.findIndex((center) => Math.abs(x - center) <= zoneWidth / 2);
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

function handlePointerDown(event) {
  if (gameState?.mode !== "setup") {
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
  if (!dragState) {
    return;
  }

  const point = canvasPoint(event);
  dragState.x = point.x;
  dragState.y = point.y;
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
  if (!gameState || gameState.mode !== "play") {
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
    setLocalStatus("selectedPeg", { peg: peg + 1 });
    draw();
    return;
  }

  const source = selectedPeg;
  selectedPeg = null;
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
elements.themeButton.addEventListener("click", toggleTheme);
elements.homeNewGameButton.addEventListener("click", () => openConfig("play"));
elements.homeDemoButton.addEventListener("click", () => openConfig("demo"));
elements.homeSolverButton.addEventListener("click", () => openConfig("solver"));
elements.cancelConfigButton.addEventListener("click", closeConfig);
elements.configForm.addEventListener("submit", submitConfig);
elements.undoButton.addEventListener("click", () => {
  handlePlayAction().catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
elements.confirmSetupButton.addEventListener("click", () => {
  confirmSetup().catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
elements.previousButton.addEventListener("click", () => {
  showPreviousStep().catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
elements.nextButton.addEventListener("click", () => {
  showNextStep().catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
elements.guideStepSlider.addEventListener("input", (event) => {
  jumpGuideStep(event.target.value).catch((error) => {
    elements.statusText.textContent = error.message;
  });
});
elements.canvas.addEventListener("pointerdown", handlePointerDown);
elements.canvas.addEventListener("pointermove", handlePointerMove);
elements.canvas.addEventListener("pointerup", handlePointerUp);
elements.canvas.addEventListener("pointercancel", () => {
  dragState = null;
  draw();
});
elements.canvas.addEventListener("click", handleBoardClick);
window.addEventListener("resize", resizeCanvas);
if (themeMedia) {
  const handleSystemThemeChange = () => {
    if (!selectedTheme) {
      applyTheme();
    }
  };
  if (themeMedia.addEventListener) {
    themeMedia.addEventListener("change", handleSystemThemeChange);
  } else {
    themeMedia.addListener(handleSystemThemeChange);
  }
}

setInterval(updateTimer, 250);
applyTheme();
applyLanguage();
resizeCanvas();
loadState().catch((error) => {
  elements.statusText.textContent = error.message;
});
