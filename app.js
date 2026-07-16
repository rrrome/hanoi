const MIN_DISKS = 2;
const MAX_DISKS = 10;
const DEFAULT_DISKS = 7;
const PEG_COUNT = 3;
const LANGUAGE_STORAGE_KEY = "hanoi-language";
const THEME_STORAGE_KEY = "hanoi-theme";
const GENSHIN_THEME = "genshin";
const THEME_OPTIONS = ["light", "dark", GENSHIN_THEME];
const GENSHIN_COLUMN_HIGHLIGHT_TOP_OFFSET = -10;
const GENSHIN_COLUMN_JOIN_ARC_DEPTH_RATIO = 0.45;
const GENSHIN_COLUMN_JOIN_OFFSET_Y = 5;
const GENSHIN_COLUMN_SHAFT_SOURCE = { x: 37, y: 320, width: 98, height: 838 };
const GENSHIN_GEAR_SOURCE_CROP = { x: 210, y: 250, width: 1110, height: 610 };
const GENSHIN_GEAR_VISIBLE_BOUNDS = { x: 44, y: 29, width: 974, height: 499 };
const GENSHIN_GEAR_HEIGHT_RATIO = 0.65;
const GENSHIN_GEAR_STACK_SPACING_RATIO = 0.65;
const GENSHIN_GEAR_STACK_BASE_Y = 735;
const GENSHIN_GEAR_TEXTURE_SHADOW_ALPHA = 0.32;
const GENSHIN_GEAR_TEXTURE_HIGHLIGHT_ALPHA = 0.18;
const GENSHIN_DROP_EFFECT_DURATION = 450;
const GENSHIN_DROP_SPARK_COUNT = 30;
const GENSHIN_DROP_SPARK_ANGLE = Math.PI / 3;
const GENSHIN_DROP_SPARK_SPREAD = Math.PI / 9;
const GENSHIN_ASSET_RETRY_DELAYS = [1500, 4500];
const GENSHIN_ASSET_FALLBACK_DELAY = 30_000;
const GENSHIN_GEAR_HOLE_BOUNDS = { x: 263, y: 105, width: 533, height: 223 };
const GENSHIN_GEAR_HOLE_CENTER_Y = GENSHIN_GEAR_HOLE_BOUNDS.y + GENSHIN_GEAR_HOLE_BOUNDS.height / 2;
const COMPACT_LANDSCAPE_MEDIA_QUERY = "(orientation: landscape) and (max-width: 1024px) and (max-height: 600px) and (any-pointer: coarse)";
const STANDARD_BOARD_TOP_PADDING = 8;
const STANDARD_DISK_MIN_HEIGHT = 10;
const GENSHIN_COMPACT_MIN_GEAR_WIDTH = 34;
const GENSHIN_COMPACT_MIN_GEAR_WIDTH_RATIO = 0.34;
const HOME_MODE = "home";
const PLAY_MODE = "play";
const DEMO_MODE = "demo";
const SETUP_MODE = "setup";
const SOLVER_MODE = "solver";
const GUIDE_MODES = new Set([DEMO_MODE, SOLVER_MODE]);

const diskGradientStops = [
  "#f07a44",
  "#fb8c42",
  "#fdbd49",
  "#d8c54c",
  "#abb46b",
  "#82adac",
  "#978fb4",
];

const translations = {
  zh: {
    appTitle: "堆栈塔",
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
    themeButton: "主题",
    themeLightOption: "浅色",
    themeDarkOption: "深色",
    themeGenshinOption: "原神",
    themeToggleLabel: "选择主题",
    undoButton: "上一步",
    redoButton: "下一步",
    playAgainButton: "再来一局",
    confirmSetupButton: "确认残局",
    previousButton: "上一步",
    nextButton: "下一步",
    cancelButton: "取消",
    startButton: "开始",
    diskCountLabel: "盘子数量",
    diskCountHint: "拖动滑块选择 {min} 到 {max} 个盘子。",
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
    boardLabel: "堆栈塔棋盘",
    guideProgressLabel: "演示进度",
    themeAssetsLoading: "原神主题资源加载中，最多等待 30 秒…",
    requestFailed: "请求失败",
    notTimed: "不计时",
    modePlay: "新游戏",
    modeDemo: "教学演示",
    modeSetup: "设置残局",
    modeSolver: "残局破解",
    playConfigHint: "选择 2-10 个盘子，设置初始柱和目标柱。目标默认第 2 或第 3 根柱子均可。",
    demoConfigHint: "选择 2-10 个盘子，设置初始柱和唯一目标柱，系统会生成最少步骤。",
    solverConfigHint: "选择 2-10 个盘子，设置初始柱和唯一目标柱，然后拖动盘子设置残局。",
    diskCountInvalid: "盘子数量必须是 {min} 到 {max} 之间的整数。",
    targetConflict: "初始位置不能同时作为目标位置。",
    targetRequired: "请选择一个目标位置。",
    defaultPlayStatus: "点击一个柱子，再点击目标柱子移动。",
    defaultGuideStatus: "使用上一步、下一步或底部滑条查看步骤。",
    defaultSetupStatus: "拖动任意盘子到任意柱子，确认后开始破解。",
    manualMoveBlocked: "当前模式不能手动移动盘子",
    undoBlocked: "当前模式不能撤回手动移动",
    redoBlocked: "当前模式不能返回下一步",
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
    nothingToRedo: "没有可返回的步骤",
    redoSucceeded: "已返回下一步",
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
    appTitle: "Stack Tower",
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
    themeButton: "Theme",
    themeLightOption: "Light",
    themeDarkOption: "Dark",
    themeGenshinOption: "Genshin",
    themeToggleLabel: "Choose theme",
    undoButton: "Previous",
    redoButton: "Next",
    playAgainButton: "Play Again",
    confirmSetupButton: "Confirm State",
    previousButton: "Previous",
    nextButton: "Next",
    cancelButton: "Cancel",
    startButton: "Start",
    diskCountLabel: "Disks",
    diskCountHint: "Move the slider to choose {min} to {max} disks.",
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
    boardLabel: "Stack Tower board",
    guideProgressLabel: "Progress",
    themeAssetsLoading: "Loading Genshin theme assets; waiting up to 30 seconds…",
    requestFailed: "Request failed",
    notTimed: "Not timed",
    modePlay: "New Game",
    modeDemo: "Tutorial Demo",
    modeSetup: "Set Endgame State",
    modeSolver: "Endgame Solver",
    playConfigHint: "Choose 2-10 disks, then set the initial peg and target. By default, Peg 2 or Peg 3 wins.",
    demoConfigHint: "Choose 2-10 disks, then set the initial peg and one target peg. The shortest solution is generated.",
    solverConfigHint: "Choose 2-10 disks, then set the initial peg and one target peg before arranging the endgame state.",
    diskCountInvalid: "Disk count must be an integer from {min} to {max}.",
    targetConflict: "The initial peg cannot also be a target peg.",
    targetRequired: "Choose one target peg.",
    defaultPlayStatus: "Click a peg with a disk, then click the destination peg.",
    defaultGuideStatus: "Use Previous, Next, or the slider to inspect each step.",
    defaultSetupStatus: "Drag any disk to any peg, then confirm the state to solve it.",
    manualMoveBlocked: "Manual moves are disabled in this mode.",
    undoBlocked: "Undo is disabled in this mode.",
    redoBlocked: "Redo is disabled in this mode.",
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
    nothingToRedo: "No move to redo",
    redoSucceeded: "Next move restored",
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
let genshinAssetFallbackAllowed = false;
const genshinAssets = {
  background: loadImage("genshin_theme/background.webp"),
  column: loadImage("genshin_theme/column_alpha.webp"),
  gear: loadImage("genshin_theme/gear.webp"),
  highlight: loadImage("genshin_theme/column_highlight.webp"),
};
const genshinGearCache = new Map();

let gameState = null;
let genshinDiskSizeCache = null;
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
let genshinEffectFrame = null;
let genshinDropEffects = [];
const session = createSession();

window.setTimeout(() => {
  genshinAssetFallbackAllowed = true;
  scheduleDraw();
}, GENSHIN_ASSET_FALLBACK_DELAY);

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
    case "redo":
      return redoSession();
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
    game: createGame(DEFAULT_DISKS, 0, [1, 2]),
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
    diskCount: DEFAULT_DISKS,
    initialPeg: 0,
    targetPegs: [1, 2],
    pegs: [],
    moveCount: 0,
    history: [],
    redoHistory: [],
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
    can_undo: session.game.history.length > 0,
    can_redo: session.game.redoHistory.length > 0,
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

function redoSession() {
  if (session.mode !== PLAY_MODE) {
    return sessionState("redoBlocked");
  }
  if (!redoGame(session.game)) {
    return sessionState("nothingToRedo");
  }
  if (isComplete(session.game)) {
    session.finished = true;
    session.finishedElapsedSeconds = elapsedSeconds();
    return sessionState("completeOnPeg", { peg: getCompletionPeg(session.game) + 1 });
  }
  return sessionState("redoSucceeded");
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
  game.redoHistory = [];
}

function loadGameState(game, pegs, targetPegs) {
  const diskCount = pegs.reduce((total, peg) => total + peg.length, 0);
  game.diskCount = diskCount;
  game.pegs = validatePegs(pegs, diskCount);
  game.targetPegs = validateTargetPegs(targetPegs);
  game.initialPeg = inferInitialPeg(game);
  game.moveCount = 0;
  game.history = [];
  game.redoHistory = [];
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
  game.redoHistory = [];
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
  game.redoHistory.push({ source, target, disk });
  game.moveCount = Math.max(0, game.moveCount - 1);
  return true;
}

function redoGame(game) {
  if (!game.redoHistory.length) {
    return false;
  }
  const { source, target, disk } = game.redoHistory.pop();
  const sourceStack = game.pegs[source];
  const targetStack = game.pegs[target];
  if (!sourceStack.length || sourceStack[sourceStack.length - 1] !== disk) {
    throw new Error("Game redo history is inconsistent with the current board.");
  }
  if (targetStack.length && targetStack[targetStack.length - 1] < disk) {
    throw new Error("Game redo history contains an invalid move.");
  }
  sourceStack.pop();
  targetStack.push(disk);
  game.history.push({ source, target, disk });
  game.moveCount += 1;
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
  hoveredPeg = null;
  dragState = null;
  genshinDiskSizeCache = null;
  clearGenshinDropEffects();
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
    genshinDiskSizeCache = null;
    clearGenshinDropEffects();
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
  genshinDiskSizeCache = null;
  clearGenshinDropEffects();
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

function setState(nextState, options = {}) {
  const dropTransition = options.animateDrop ? getSingleDiskTransition(gameState, nextState) : null;
  gameState = nextState;
  localStatusKey = "";
  localStatusArgs = {};
  syncedElapsed = gameState.elapsed_seconds;
  lastSyncTime = performance.now();
  renderState();
  if (dropTransition) {
    startGenshinDropEffect(dropTransition.disk, dropTransition.targetPeg);
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
  elements.statusText.textContent = getStatusText();

  if (isHome) {
    return;
  }

  elements.modeTitle.textContent = getModeTitle();
  elements.modeSummary.textContent = getModeSummary();
  elements.undoButton.hidden = gameState.mode !== "play";
  elements.undoButton.textContent = gameState.is_complete ? t("playAgainButton") : t("undoButton");
  elements.undoButton.disabled = !gameState.is_complete && !gameState.can_undo;
  elements.redoButton.hidden = gameState.mode !== "play";
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
  const themedTemplate = getActiveTheme() === GENSHIN_THEME && currentLanguage === "zh"
    ? template.replaceAll("盘子", "齿轮")
    : template;
  return themedTemplate.replace(/\{(\w+)\}/g, (_match, name) => {
    return Object.prototype.hasOwnProperty.call(args, name) ? String(args[name]) : "";
  });
}

function loadImage(src) {
  const image = new Image();
  let retryCount = 0;
  image.decoding = "async";

  const requestImage = () => {
    const separator = src.includes("?") ? "&" : "?";
    image.src = retryCount === 0 ? src : `${src}${separator}retry=${retryCount}`;
  };

  image.addEventListener("load", () => {
    genshinGearCache.clear();
    scheduleDraw();
  });
  image.addEventListener("error", () => {
    scheduleDraw();
    if (retryCount >= GENSHIN_ASSET_RETRY_DELAYS.length) {
      return;
    }
    const delay = GENSHIN_ASSET_RETRY_DELAYS[retryCount];
    retryCount += 1;
    window.setTimeout(requestImage, delay);
  });
  requestImage();
  return image;
}

function isImageReady(image) {
  return image.complete && image.naturalWidth > 0;
}

function areGenshinCoreAssetsReady() {
  return isImageReady(genshinAssets.background)
    && isImageReady(genshinAssets.column)
    && isImageReady(genshinAssets.gear);
}

function isGenshinAssetWaitActive() {
  return getActiveTheme() === GENSHIN_THEME
    && !areGenshinCoreAssetsReady()
    && !genshinAssetFallbackAllowed;
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
  if (getActiveTheme() === GENSHIN_THEME) {
    if (areGenshinCoreAssetsReady()) {
      drawGenshinBoard(width, height, colors);
    } else if (genshinAssetFallbackAllowed) {
      drawStandardBoard(width, height, colors);
    } else {
      drawGenshinAssetLoading(width, height, colors);
    }
    return;
  }

  drawStandardBoard(width, height, colors);
}

function drawStandardBoard(width, height, colors) {
  drawBackground(width, height, colors);

  const centers = getPegCenters(width);
  const baseY = height - 68;
  const pegTopY = 56;
  const diskHeight = getStandardDiskHeight(baseY, pegTopY, gameState.disk_count);
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
  const preferredHeight = (baseY - pegTopY - 16) / diskCount;
  const maximumFittingHeight = (baseY - STANDARD_BOARD_TOP_PADDING) / diskCount;
  return Math.min(24, Math.max(STANDARD_DISK_MIN_HEIGHT, preferredHeight), maximumFittingHeight);
}

function drawGenshinAssetLoading(width, height, colors) {
  drawBackground(width, height, colors);

  const centerX = width / 2;
  const centerY = height / 2;
  const diamondSize = Math.max(8, Math.min(13, width / 90));
  const diamondGap = diamondSize * 2.5;

  ctx.save();
  ctx.fillStyle = "rgba(246, 216, 139, 0.88)";
  [-1, 0, 1].forEach((offset) => {
    ctx.save();
    ctx.translate(centerX + offset * diamondGap, centerY - 24);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
    ctx.restore();
  });

  ctx.fillStyle = colors.pegLabel;
  ctx.font = `600 ${Math.max(15, Math.min(20, width / 55))}px "HYWenHei-65W", "Hanyi WenHei 65W", "汉仪文黑 65W", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(t("themeAssetsLoading"), centerX, centerY + 24);
  ctx.restore();
}

function drawGenshinBoard(width, height, colors) {
  if (!areGenshinCoreAssetsReady()) {
    drawStandardBoard(width, height, colors);
    return;
  }

  const layout = getGenshinLayout(width, height);
  drawGenshinBackdrop(width, height);
  ctx.drawImage(
    genshinAssets.background,
    layout.imageX,
    layout.imageY,
    layout.imageWidth,
    layout.imageHeight,
  );

  drawGenshinColumns(layout);

  const highlightedPeg = getHighlightedPeg();
  layout.centers.forEach((centerX, index) => {
    if (highlightedPeg === index) {
      drawGenshinPegHighlight(centerX, layout, colors);
    }
  });

  const guideMove = getCurrentGuideMove();
  if (guideMove) {
    drawGuideMoveArrow(
      layout.centers[guideMove.source],
      layout.centers[guideMove.target],
      getGenshinGuideArrowY(layout),
      colors,
      { genshin: true, scale: layout.scale },
    );
  }

  gameState.pegs.forEach((peg, pegIndex) => {
    peg.forEach((disk, level) => {
      if (dragState && dragState.disk === disk) {
        return;
      }

      const rect = getGenshinDiskRect(layout, disk, pegIndex, level);
      drawGenshinDisk(rect, disk, false, colors);
      diskRects.push({ ...rect, disk, peg: pegIndex, level });
    });
  });

  drawGenshinColumnFronts(layout);

  if (dragState) {
    drawGenshinDisk(
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

  drawGenshinDropEffects(performance.now());
}

function startGenshinDropEffect(disk, targetPeg) {
  if (
    getActiveTheme() !== GENSHIN_THEME
    || !areGenshinCoreAssetsReady()
    || !gameState
    || elements.gameView.hidden
  ) {
    return;
  }

  const canvasRect = elements.canvas.getBoundingClientRect();
  if (canvasRect.width <= 0 || canvasRect.height <= 0) {
    return;
  }

  const level = gameState.pegs[targetPeg]?.indexOf(disk) ?? -1;
  if (level < 0) {
    return;
  }

  const layout = getGenshinLayout(canvasRect.width, canvasRect.height);
  const diskRect = getGenshinDiskRect(layout, disk, targetPeg, level);
  const effectScale = Math.max(0.65, Math.min(1.25, diskRect.width / 240));
  const radiusX = diskRect.width * 0.48;
  const radiusY = diskRect.height * 0.42;
  const particles = Array.from({ length: GENSHIN_DROP_SPARK_COUNT }, (_item, index) => {
    const edgeStep = Math.PI * 2 / GENSHIN_DROP_SPARK_COUNT;
    const edgeAngle = index * edgeStep + (Math.random() - 0.5) * edgeStep * 0.45;
    const edgeRadius = 0.84 + Math.random() * 0.13;
    const side = Math.cos(edgeAngle) >= 0 ? 1 : -1;
    const baseAngle = side > 0
      ? -GENSHIN_DROP_SPARK_ANGLE
      : Math.PI + GENSHIN_DROP_SPARK_ANGLE;
    const angle = baseAngle + (Math.random() - 0.5) * GENSHIN_DROP_SPARK_SPREAD;
    return {
      angle,
      originOffsetX: Math.cos(edgeAngle) * radiusX * edgeRadius,
      originOffsetY: Math.sin(edgeAngle) * radiusY * edgeRadius,
      delay: Math.random() * 55,
      travel: radiusX * (0.45 + Math.random() * 1.05),
      tail: (10 + Math.random() * 22) * effectScale,
      size: (1.4 + Math.random() * 2.8) * effectScale,
      gravity: (4 + Math.random() * 12) * effectScale,
      twinkle: index % 4 === 0,
    };
  });

  genshinDropEffects.push({
    startedAt: performance.now(),
    x: diskRect.x + diskRect.width / 2,
    y: diskRect.y + diskRect.height * 0.48,
    radiusX,
    radiusY,
    scale: effectScale,
    particles,
  });
  requestGenshinEffectFrame();
}

function requestGenshinEffectFrame() {
  if (genshinEffectFrame !== null) {
    return;
  }

  genshinEffectFrame = requestAnimationFrame((now) => {
    genshinEffectFrame = null;
    genshinDropEffects = genshinDropEffects.filter(
      (effect) => now - effect.startedAt < GENSHIN_DROP_EFFECT_DURATION,
    );
    draw();
    if (genshinDropEffects.length) {
      requestGenshinEffectFrame();
    }
  });
}

function clearGenshinDropEffects() {
  genshinDropEffects = [];
  if (genshinEffectFrame !== null) {
    cancelAnimationFrame(genshinEffectFrame);
    genshinEffectFrame = null;
  }
}

function drawGenshinDropEffects(now) {
  genshinDropEffects.forEach((effect) => {
    const elapsed = now - effect.startedAt;
    const progress = Math.max(0, Math.min(1, elapsed / GENSHIN_DROP_EFFECT_DURATION));
    const fade = (1 - progress) ** 1.7;
    const expansionProgress = 1 - (1 - progress) ** 3;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const glowRadius = effect.radiusX * (0.7 + expansionProgress * 0.45);
    const glow = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, glowRadius);
    glow.addColorStop(0, `rgba(255, 248, 190, ${0.46 * fade})`);
    glow.addColorStop(0.42, `rgba(255, 208, 88, ${0.28 * fade})`);
    glow.addColorStop(1, "rgba(239, 137, 38, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(
      effect.x,
      effect.y,
      glowRadius,
      effect.radiusY * (0.78 + expansionProgress * 0.35),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    effect.particles.forEach((particle, index) => {
      const particleDuration = GENSHIN_DROP_EFFECT_DURATION - particle.delay;
      const particleProgress = Math.max(0, Math.min(1, (elapsed - particle.delay) / particleDuration));
      if (particleProgress <= 0 || particleProgress >= 1) {
        return;
      }

      const eased = 1 - (1 - particleProgress) ** 2.4;
      const alpha = Math.min(1, particleProgress * 7) * (1 - particleProgress) ** 1.45;
      const directionX = Math.cos(particle.angle);
      const directionY = Math.sin(particle.angle);
      const originX = effect.x + particle.originOffsetX;
      const originY = effect.y + particle.originOffsetY;
      const x = originX + directionX * particle.travel * eased;
      const y = originY + directionY * particle.travel * eased + particle.gravity * particleProgress ** 2;
      const tailLength = particle.tail * (1 - particleProgress * 0.45);

      ctx.strokeStyle = `rgba(255, 190, 56, ${0.86 * alpha})`;
      ctx.lineWidth = Math.max(0.8, particle.size * 0.58);
      ctx.beginPath();
      ctx.moveTo(x - directionX * tailLength, y - directionY * tailLength);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 244, 170, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      if (particle.twinkle) {
        drawGenshinDropSpark(
          x,
          y,
          particle.size * (2.2 + Math.sin(particleProgress * Math.PI * 5) * 0.35),
          particle.angle + index,
          alpha,
        );
      }
    });

    ctx.restore();
  });
}

function drawGenshinDropSpark(x, y, size, rotation, alpha) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = `rgba(255, 250, 205, ${alpha})`;
  ctx.beginPath();
  for (let index = 0; index < 8; index += 1) {
    const angle = -Math.PI / 2 + index * Math.PI / 4;
    const radius = index % 2 === 0 ? size : size * 0.24;
    const pointX = Math.cos(angle) * radius;
    const pointY = Math.sin(angle) * radius;
    if (index === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGenshinBackdrop(width, height) {
  const imageWidth = genshinAssets.background.naturalWidth || 1672;
  const imageHeight = genshinAssets.background.naturalHeight || 941;
  const scale = Math.max(width / imageWidth, height / imageHeight);
  const drawnWidth = imageWidth * scale;
  const drawnHeight = imageHeight * scale;

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.drawImage(
    genshinAssets.background,
    (width - drawnWidth) / 2,
    (height - drawnHeight) / 2,
    drawnWidth,
    drawnHeight,
  );
  ctx.restore();
}

function getGenshinLayout(width, height) {
  const imageWidth = genshinAssets.background.naturalWidth || 1448;
  const imageHeight = genshinAssets.background.naturalHeight || 1086;
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const drawnWidth = imageWidth * scale;
  const drawnHeight = imageHeight * scale;
  const imageX = (width - drawnWidth) / 2;
  const imageY = (height - drawnHeight) / 2;
  const mapX = (x) => imageX + x * scale;
  const mapY = (y) => imageY + y * scale;
  const stackBaseY = mapY(GENSHIN_GEAR_STACK_BASE_Y);
  const topLimitY = Math.max(34, mapY(348));
  const diskStep = Math.max(12, Math.min(26, (stackBaseY - topLimitY) / Math.max(1, gameState.disk_count - 1)));
  const responsiveMaxDiskWidth = Math.min(width * 0.22, scale * 350);
  const compactLandscape = usesCompactLandscapeLayout();
  const responsiveMinDiskWidth = compactLandscape
    ? Math.min(
      responsiveMaxDiskWidth,
      Math.max(GENSHIN_COMPACT_MIN_GEAR_WIDTH, responsiveMaxDiskWidth * GENSHIN_COMPACT_MIN_GEAR_WIDTH_RATIO),
    )
    : Math.max(54, responsiveMaxDiskWidth * 0.46);
  const diskWidths = getLockedGenshinDiskWidths(
    responsiveMinDiskWidth,
    responsiveMaxDiskWidth,
    compactLandscape ? "compact-landscape" : "regular",
  );
  const maxDiskWidth = diskWidths[diskWidths.length - 1];
  const maxDiskHeight = getGenshinDiskHeight(maxDiskWidth);
  const stackCenterY = stackBaseY - maxDiskHeight / 2;
  const stackHoleCenterY = stackCenterY + maxDiskHeight * (
    GENSHIN_GEAR_HOLE_CENTER_Y / GENSHIN_GEAR_SOURCE_CROP.height - 0.5
  );
  const columnHeight = scale * 455;
  const columnWidth = columnHeight * (169 / 1260);
  const columnBottomY = mapY(630);

  return {
    imageX,
    imageY,
    imageWidth: drawnWidth,
    imageHeight: drawnHeight,
    scale,
    centers: [mapX(420), mapX(836), mapX(1252)],
    pegTopY: columnBottomY - columnHeight,
    pegBottomY: columnBottomY,
    stackHoleCenterY,
    diskStep,
    diskWidths,
    columnWidth,
    columnHeight,
    columnBottomY,
  };
}

function drawGenshinColumns(layout) {
  if (!genshinAssets.column.complete || !genshinAssets.column.naturalWidth) {
    return;
  }

  layout.centers.forEach((centerX) => {
    ctx.drawImage(
      genshinAssets.column,
      centerX - layout.columnWidth / 2,
      layout.columnBottomY - layout.columnHeight,
      layout.columnWidth,
      layout.columnHeight,
    );
  });
}

function drawGenshinColumnFront(layout, columnX, columnY) {
  const image = genshinAssets.column;
  const source = GENSHIN_COLUMN_SHAFT_SOURCE;
  const topHeight = layout.columnHeight * (source.y / image.naturalHeight);
  const shaftX = columnX + layout.columnWidth * (source.x / image.naturalWidth);
  const shaftWidth = layout.columnWidth * (source.width / image.naturalWidth);

  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    source.y,
    columnX,
    columnY,
    layout.columnWidth,
    topHeight,
  );
  ctx.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    shaftX,
    columnY + topHeight,
    shaftWidth,
    layout.columnHeight - topHeight,
  );
}

function drawGenshinColumnFronts(layout) {
  if (!genshinAssets.column.complete || !genshinAssets.column.naturalWidth) {
    return;
  }

  gameState.pegs.forEach((peg, pegIndex) => {
    if (!peg.length) {
      return;
    }

    let topLevel = peg.length - 1;
    if (dragState && dragState.sourcePeg === pegIndex && peg[topLevel] === dragState.disk) {
      topLevel -= 1;
    }
    if (topLevel < 0) {
      return;
    }

    const centerX = layout.centers[pegIndex];
    const columnX = centerX - layout.columnWidth / 2;
    const columnY = layout.columnBottomY - layout.columnHeight;
    const halfColumnWidth = layout.columnWidth / 2;
    const arcDepth = halfColumnWidth * Math.max(0, Math.min(1, GENSHIN_COLUMN_JOIN_ARC_DEPTH_RATIO));
    const holeCenterY = layout.stackHoleCenterY
      - topLevel * layout.diskStep * GENSHIN_GEAR_STACK_SPACING_RATIO;
    const arcY = holeCenterY + GENSHIN_COLUMN_JOIN_OFFSET_Y - arcDepth;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(columnX, columnY);
    ctx.lineTo(columnX + layout.columnWidth, columnY);
    ctx.lineTo(columnX + layout.columnWidth, arcY);
    if (arcDepth > 0) {
      const arcRadius = (halfColumnWidth ** 2 + arcDepth ** 2) / (2 * arcDepth);
      const arcCenterY = arcY - (arcRadius - arcDepth);
      const arcStartAngle = Math.atan2(arcY - arcCenterY, halfColumnWidth);
      ctx.arc(centerX, arcCenterY, arcRadius, arcStartAngle, Math.PI - arcStartAngle);
    } else {
      ctx.lineTo(columnX, arcY);
    }
    ctx.closePath();
    ctx.clip();
    drawGenshinColumnFront(layout, columnX, columnY);
    ctx.restore();
  });
}

function getGenshinDiskRect(layout, disk, pegIndex, level) {
  const imageWidth = getGenshinDiskWidth(layout, disk);
  const imageHeight = getGenshinDiskHeight(imageWidth);
  const visibleWidth = imageWidth * (GENSHIN_GEAR_VISIBLE_BOUNDS.width / GENSHIN_GEAR_SOURCE_CROP.width);
  const visibleHeight = imageHeight * (GENSHIN_GEAR_VISIBLE_BOUNDS.height / GENSHIN_GEAR_SOURCE_CROP.height);
  const holeCenterY = layout.stackHoleCenterY
    - level * layout.diskStep * GENSHIN_GEAR_STACK_SPACING_RATIO;
  const imageY = holeCenterY
    - imageHeight * (GENSHIN_GEAR_HOLE_CENTER_Y / GENSHIN_GEAR_SOURCE_CROP.height);
  return {
    x: layout.centers[pegIndex] - visibleWidth / 2,
    y: imageY + imageHeight * (GENSHIN_GEAR_VISIBLE_BOUNDS.y / GENSHIN_GEAR_SOURCE_CROP.height),
    width: visibleWidth,
    height: visibleHeight,
  };
}

function getLockedGenshinDiskWidths(minDiskWidth, maxDiskWidth, layoutProfile) {
  const diskCount = gameState.disk_count;
  if (
    !genshinDiskSizeCache
    || genshinDiskSizeCache.diskCount !== diskCount
    || genshinDiskSizeCache.layoutProfile !== layoutProfile
  ) {
    const widthStep = (maxDiskWidth - minDiskWidth) / Math.max(1, diskCount - 1);
    genshinDiskSizeCache = {
      diskCount,
      layoutProfile,
      widths: Array.from({ length: diskCount }, (_item, index) => minDiskWidth + index * widthStep),
    };
  }

  return genshinDiskSizeCache.widths;
}

function usesCompactLandscapeLayout() {
  return window.matchMedia?.(COMPACT_LANDSCAPE_MEDIA_QUERY).matches ?? false;
}

function getGenshinDiskWidth(layout, disk) {
  return layout.diskWidths[disk - 1];
}

function getGenshinDiskHeight(diskWidth) {
  return diskWidth * GENSHIN_GEAR_HEIGHT_RATIO;
}

function getGenshinGearDrawRect(rect) {
  const width = rect.width * (GENSHIN_GEAR_SOURCE_CROP.width / GENSHIN_GEAR_VISIBLE_BOUNDS.width);
  const height = rect.height * (GENSHIN_GEAR_SOURCE_CROP.height / GENSHIN_GEAR_VISIBLE_BOUNDS.height);
  return {
    x: rect.x - width * (GENSHIN_GEAR_VISIBLE_BOUNDS.x / GENSHIN_GEAR_SOURCE_CROP.width),
    y: rect.y - height * (GENSHIN_GEAR_VISIBLE_BOUNDS.y / GENSHIN_GEAR_SOURCE_CROP.height),
    width,
    height,
  };
}

function drawGenshinPegHighlight(centerX, layout, colors) {
  if (!genshinAssets.highlight.complete || !genshinAssets.highlight.naturalWidth) {
    return;
  }

  const highlightWidth = Math.max(layout.columnWidth * 1.125, layout.scale * 31);
  const highlightHeight = highlightWidth * (genshinAssets.highlight.naturalHeight / genshinAssets.highlight.naturalWidth);
  const y = layout.pegTopY + layout.scale * GENSHIN_COLUMN_HIGHLIGHT_TOP_OFFSET - highlightHeight;

  ctx.save();
  ctx.shadowColor = "rgba(255, 238, 184, 0.58)";
  ctx.shadowBlur = Math.max(4, layout.scale * 9);
  ctx.drawImage(
    genshinAssets.highlight,
    centerX - highlightWidth / 2,
    y,
    highlightWidth,
    highlightHeight,
  );
  ctx.restore();
}

function drawGenshinDisk(rect, disk, lifted, colors) {
  const gear = getTintedGenshinGear(getDiskColor(disk));
  const drawRect = getGenshinGearDrawRect(rect);

  ctx.save();
  ctx.shadowColor = lifted ? colors.diskShadowLifted : colors.diskShadow;
  ctx.shadowBlur = lifted ? 18 : 10;
  ctx.shadowOffsetY = lifted ? 10 : 4;
  if (gear) {
    ctx.drawImage(gear, drawRect.x, drawRect.y, drawRect.width, drawRect.height);
  } else {
    drawDisk(rect, disk, lifted, colors);
    ctx.restore();
    return;
  }
  ctx.shadowColor = "transparent";
  ctx.restore();
}

function getTintedGenshinGear(color) {
  if (!genshinAssets.gear.complete || !genshinAssets.gear.naturalWidth) {
    return null;
  }
  if (genshinGearCache.has(color)) {
    return genshinGearCache.get(color);
  }

  const crop = GENSHIN_GEAR_SOURCE_CROP;
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const offscreen = canvas.getContext("2d");
  const sourceLayer = document.createElement("canvas");
  sourceLayer.width = crop.width;
  sourceLayer.height = crop.height;
  const sourceContext = sourceLayer.getContext("2d");
  sourceContext.drawImage(
    genshinAssets.gear,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  offscreen.fillStyle = color;
  offscreen.fillRect(0, 0, crop.width, crop.height);
  offscreen.globalCompositeOperation = "destination-in";
  offscreen.drawImage(
    sourceLayer,
    0,
    0,
  );

  offscreen.globalCompositeOperation = "multiply";
  offscreen.globalAlpha = GENSHIN_GEAR_TEXTURE_SHADOW_ALPHA;
  offscreen.drawImage(sourceLayer, 0, 0);
  offscreen.globalCompositeOperation = "screen";
  offscreen.globalAlpha = GENSHIN_GEAR_TEXTURE_HIGHLIGHT_ALPHA;
  offscreen.drawImage(sourceLayer, 0, 0);
  offscreen.globalAlpha = 1;

  genshinGearCache.set(color, canvas);
  return canvas;
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

  const move = session.guideMoves[gameState.guide_step - 1];
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

function getGenshinGuideArrowY(layout) {
  const highlightWidth = Math.max(layout.columnWidth * 1.125, layout.scale * 31);
  const highlightRatio = genshinAssets.highlight.naturalWidth
    ? genshinAssets.highlight.naturalHeight / genshinAssets.highlight.naturalWidth
    : 225 / 252;
  const highlightHeight = highlightWidth * highlightRatio;
  const highlightBottomY = layout.pegTopY + layout.scale * GENSHIN_COLUMN_HIGHLIGHT_TOP_OFFSET;
  return highlightBottomY - highlightHeight / 2;
}

function drawGuideMoveArrow(sourceX, targetX, y, colors = getBoardColors(), options = {}) {
  const direction = Math.sign(targetX - sourceX);
  if (!direction) {
    return;
  }

  const scale = Math.max(0.65, options.scale || 1);
  const endpointGap = (options.genshin ? 34 : 24) * scale;
  const startX = sourceX + direction * endpointGap;
  const endX = targetX - direction * endpointGap;
  if (options.genshin) {
    drawGenshinGuideMoveArrow(startX, endX, y, direction, scale, colors);
    return;
  }

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

function drawGenshinGuideMoveArrow(startX, endX, y, direction, scale, colors) {
  const length = Math.abs(endX - startX);
  const headLength = Math.min(46 * scale, length * 0.3);
  const headHalfHeight = 23 * scale;
  const shaftHalfHeight = 7 * scale;
  const tailCurveLength = Math.min(58 * scale, length * 0.34);
  const headBaseX = length - headLength;

  ctx.save();
  ctx.translate(startX, y);
  ctx.scale(direction, 1);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(255, 145, 54, 0.52)";
  ctx.shadowBlur = 12 * scale;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    10 * scale,
    -4 * scale,
    tailCurveLength * 0.44,
    -shaftHalfHeight * 1.65,
    tailCurveLength,
    -shaftHalfHeight,
  );
  ctx.lineTo(headBaseX, -shaftHalfHeight);
  ctx.lineTo(headBaseX, -headHalfHeight);
  ctx.quadraticCurveTo(headBaseX + 7 * scale, -headHalfHeight * 0.82, length, 0);
  ctx.quadraticCurveTo(headBaseX + 7 * scale, headHalfHeight * 0.82, headBaseX, headHalfHeight);
  ctx.lineTo(headBaseX, shaftHalfHeight);
  ctx.lineTo(tailCurveLength, shaftHalfHeight);
  ctx.bezierCurveTo(
    tailCurveLength * 0.44,
    shaftHalfHeight * 1.65,
    10 * scale,
    4 * scale,
    0,
    0,
  );
  ctx.closePath();

  const fillGradient = ctx.createLinearGradient(0, -headHalfHeight, 0, headHalfHeight);
  fillGradient.addColorStop(0, colors.guideArrowAccent);
  fillGradient.addColorStop(0.2, colors.guideArrowFill);
  fillGradient.addColorStop(1, "#db6c2e");
  ctx.fillStyle = fillGradient;
  ctx.fill();

  ctx.strokeStyle = colors.guideArrowAccent;
  ctx.lineWidth = 12 * scale;
  ctx.stroke();
  ctx.strokeStyle = colors.guideArrowStroke;
  ctx.lineWidth = 6 * scale;
  ctx.stroke();

  ctx.shadowColor = "transparent";
  ctx.beginPath();
  ctx.moveTo(tailCurveLength * 0.5, -shaftHalfHeight * 0.45);
  ctx.bezierCurveTo(
    length * 0.42,
    -shaftHalfHeight * 0.85,
    headBaseX - 10 * scale,
    -shaftHalfHeight * 0.55,
    headBaseX + 5 * scale,
    -headHalfHeight * 0.43,
  );
  ctx.strokeStyle = "rgba(235, 255, 252, 0.5)";
  ctx.lineWidth = 2.2 * scale;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(headBaseX + headLength * 0.42, -7 * scale);
  ctx.lineTo(headBaseX + headLength * 0.58, -3 * scale);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.62)";
  ctx.lineWidth = 1.8 * scale;
  ctx.stroke();
  ctx.restore();
}

function drawDisk(rect, disk, lifted, colors = getBoardColors()) {
  ctx.shadowColor = lifted ? colors.diskShadowLifted : colors.diskShadow;
  ctx.shadowBlur = lifted ? 16 : 8;
  ctx.shadowOffsetY = lifted ? 8 : 3;
  ctx.fillStyle = getDiskColor(disk);
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
  if (getActiveTheme() === GENSHIN_THEME && areGenshinCoreAssetsReady()) {
    const height = elements.canvas.getBoundingClientRect().height;
    return getGenshinLayout(width, height).centers;
  }
  return [width * 0.2, width * 0.5, width * 0.8];
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
  setHoveredPeg(null);
  dragState = null;
  draw();
});
elements.canvas.addEventListener("pointerleave", () => {
  setHoveredPeg(null);
});
elements.canvas.addEventListener("click", handleBoardClick);
window.addEventListener("resize", resizeCanvas);
window.visualViewport?.addEventListener("resize", resizeCanvas);

setInterval(updateTimer, 250);
applyTheme();
resizeCanvas();
loadState().catch((error) => {
  elements.statusText.textContent = error.message;
});
