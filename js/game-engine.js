// 游戏规则与会话状态独立于 DOM，便于后续接入其他界面或服务端实现。
export const MIN_DISKS = 2;
export const MAX_DISKS = 10;
export const DEFAULT_DISKS = 7;
export const PEG_COUNT = 3;
export const PLAY_MODE = "play";

const HOME_MODE = "home";
const DEMO_MODE = "demo";
const SETUP_MODE = "setup";
const SOLVER_MODE = "solver";
const GUIDE_MODES = new Set([DEMO_MODE, SOLVER_MODE]);

const session = createSession();

export async function readLocalState() {
  return sessionState();
}

export async function runAction(action, payload = {}) {
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
      throw new Error(`Unknown action: ${action}`);
  }
}

export function getGuideMove(step) {
  const move = session.guideMoves[Number(step)];
  return move ? [...move] : null;
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

// 对外只返回棋盘快照，避免界面层意外修改引擎内部状态。
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

// history 与 redoHistory 分别维护“上一步”和“下一步”，新移动会清空后者。
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
  if (seen.sort((a, b) => a - b).join(",") !== expected) {
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
  const solve = (count, start, end, spare) => {
    if (count === 0) return;
    solve(count - 1, start, spare, end);
    moves.push([start, end]);
    solve(count - 1, spare, end, start);
  };
  solve(diskCount, source, target, auxiliary);
  return moves;
}

// 从最大盘开始递归归位，可直接求解任意合法残局。
function buildSolutionFromState(pegs, target) {
  validatePeg(target);
  const diskCount = pegs.reduce((total, peg) => total + peg.length, 0);
  validateDiskCount(diskCount);
  const board = validatePegs(pegs, diskCount);
  const positions = diskPositions(board, diskCount);
  const moves = [];
  const solve = (maxDisk, destination) => {
    if (maxDisk === 0) return;
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
  };
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
  for (let peg = 0; peg < PEG_COUNT; peg += 1) {
    if (peg !== first && peg !== second) return peg;
  }
  throw new Error("No auxiliary peg available.");
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
