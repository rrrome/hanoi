// 兼容尚未完整支持 overscroll-behavior 的移动浏览器。
export function installPullToRefreshGuard() {
  if (!("ontouchstart" in window) && (navigator.maxTouchPoints || 0) <= 0) {
    return;
  }

  let previousTouch = null;

  const resetTouch = () => {
    previousTouch = null;
  };

  document.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) {
      resetTouch();
      return;
    }

    previousTouch = getTouchPosition(event.touches[0]);
  }, { passive: true });

  document.addEventListener("touchmove", (event) => {
    if (event.touches.length !== 1 || !previousTouch) {
      resetTouch();
      return;
    }

    const currentTouch = getTouchPosition(event.touches[0]);
    const deltaX = currentTouch.x - previousTouch.x;
    const deltaY = currentTouch.y - previousTouch.y;
    previousTouch = currentTouch;

    const isPullingDown = deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX);
    if (!event.cancelable || !isPullingDown || canScrollTowardTop(event.target)) {
      return;
    }

    const scrollingElement = document.scrollingElement || document.documentElement;
    if (scrollingElement.scrollTop <= 0) {
      event.preventDefault();
    }
  }, { passive: false });

  document.addEventListener("touchend", resetTouch, { passive: true });
  document.addEventListener("touchcancel", resetTouch, { passive: true });
}

function getTouchPosition(touch) {
  return {
    x: touch.clientX,
    y: touch.clientY,
  };
}

// 内层弹窗仍可正常向上滚动；到达顶部后才阻断继续下拉。
function canScrollTowardTop(target) {
  let element = target instanceof Element ? target : target?.parentElement;

  while (element && element !== document.body && element !== document.documentElement) {
    if (element.scrollHeight > element.clientHeight && element.scrollTop > 0) {
      return true;
    }
    element = element.parentElement;
  }

  return false;
}
