const DEFAULT_START_DELAY = 400;
const DEFAULT_REPEAT_DELAY = 80;
const DEFAULT_CLICK_SUPPRESSION_DELAY = 600;
const SYNTHETIC_MOUSE_DELAY = 800;

/**
 * 为按钮绑定“短按一次、长按连续触发”行为。
 *
 * 分开监听鼠标与触摸事件，避免部分浏览器的指针捕获提前丢失，
 * 同时保留键盘触发的原生 click 行为。
 */
export function bindPressAndHold(button, options) {
  const startDelay = options.startDelay ?? DEFAULT_START_DELAY;
  const repeatDelay = options.repeatDelay ?? DEFAULT_REPEAT_DELAY;
  const clickSuppressionDelay = options.clickSuppressionDelay ?? DEFAULT_CLICK_SUPPRESSION_DELAY;
  let holdState = null;
  let suppressClickUntil = 0;
  let lastTouchEnd = Number.NEGATIVE_INFINITY;

  const clearHold = () => {
    if (holdState?.timer !== null) {
      window.clearTimeout(holdState.timer);
    }
    holdState = null;
  };

  const repeat = (state) => {
    if (holdState !== state) {
      return;
    }

    state.repeated = true;
    const shouldContinue = options.onRepeat({
      elapsed: performance.now() - state.startedAt,
    }) !== false;
    if (shouldContinue) {
      state.timer = window.setTimeout(() => repeat(state), repeatDelay);
    }
  };

  const startHold = (inputType) => {
    if (holdState || options.canStart?.() === false) {
      return;
    }

    options.onHoldStart?.();
    holdState = {
      inputType,
      repeated: false,
      startedAt: performance.now(),
      timer: null,
    };
    const state = holdState;
    state.timer = window.setTimeout(() => repeat(state), startDelay);
  };

  const stopHold = (inputType) => {
    if (!holdState || holdState.inputType !== inputType) {
      return;
    }

    const repeated = holdState.repeated;
    clearHold();
    if (inputType === "touch") {
      lastTouchEnd = performance.now();
    }
    if (repeated) {
      suppressClickUntil = performance.now() + clickSuppressionDelay;
    }
  };

  button.addEventListener("mousedown", (event) => {
    if (event.button !== 0 || performance.now() - lastTouchEnd < SYNTHETIC_MOUSE_DELAY) {
      return;
    }
    startHold("mouse");
  });
  button.addEventListener("touchstart", (event) => {
    if (event.touches.length === 1) {
      startHold("touch");
    }
  }, { passive: true });
  button.addEventListener("contextmenu", (event) => event.preventDefault());
  button.addEventListener("click", (event) => {
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      suppressClickUntil = 0;
      return;
    }
    options.onClick();
  });

  window.addEventListener("mouseup", () => stopHold("mouse"));
  window.addEventListener("touchend", () => stopHold("touch"), { passive: true });
  window.addEventListener("touchcancel", () => stopHold("touch"), { passive: true });
  window.addEventListener("blur", clearHold);
}
