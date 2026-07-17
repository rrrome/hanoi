export const GENSHIN_THEME = "genshin";

const COLUMN_HIGHLIGHT_TOP_OFFSET = -10;
const COLUMN_JOIN_ARC_DEPTH_RATIO = 0.45;
const COLUMN_JOIN_OFFSET_Y = 5;
const COLUMN_SHAFT_SOURCE = { x: 37, y: 320, width: 98, height: 838 };
const GEAR_SOURCE_CROP = { x: 210, y: 250, width: 1110, height: 610 };
const GEAR_VISIBLE_BOUNDS = { x: 44, y: 29, width: 974, height: 499 };
const GEAR_HEIGHT_RATIO = 0.65;
const GEAR_STACK_SPACING_RATIO = 0.65;
const GEAR_STACK_BASE_Y = 735;
const GEAR_TEXTURE_SHADOW_ALPHA = 0.32;
const GEAR_TEXTURE_HIGHLIGHT_ALPHA = 0.18;
const DROP_EFFECT_DURATION = 450;
const DROP_SPARK_COUNT = 30;
const DROP_SPARK_ANGLE = Math.PI / 3;
const DROP_SPARK_SPREAD = Math.PI / 9;
const ASSET_RETRY_DELAYS = [1500, 4500];
const ASSET_FALLBACK_DELAY = 30_000;
const GEAR_HOLE_BOUNDS = { x: 263, y: 105, width: 533, height: 223 };
const GEAR_HOLE_CENTER_Y = GEAR_HOLE_BOUNDS.y + GEAR_HOLE_BOUNDS.height / 2;
const COMPACT_MIN_GEAR_WIDTH = 34;
const COMPACT_MIN_GEAR_WIDTH_RATIO = 0.34;

const ASSET_URLS = {
  background: new URL("../genshin_theme/background.webp", import.meta.url).href,
  column: new URL("../genshin_theme/column_alpha.webp", import.meta.url).href,
  gear: new URL("../genshin_theme/gear.webp", import.meta.url).href,
  highlight: new URL("../genshin_theme/column_highlight.webp", import.meta.url).href,
};

/**
 * 原神主题渲染器。
 *
 * 通过回调读取主界面状态，内部独立管理素材、尺寸缓存和粒子特效，
 * 避免主题实现反向依赖页面控制器中的全局变量。
 */
export class GenshinThemeRenderer {
  constructor(options) {
    this.ctx = options.ctx;
    this.canvas = options.canvas;
    this.getGameState = options.getGameState;
    this.getDragState = options.getDragState;
    this.getHighlightedPeg = options.getHighlightedPeg;
    this.getGuideMove = options.getGuideMove;
    this.getDiskColor = options.getDiskColor;
    this.drawFallbackDisk = options.drawFallbackDisk;
    this.drawFallbackBoard = options.drawFallbackBoard;
    this.drawBackground = options.drawBackground;
    this.translate = options.translate;
    this.addDiskRect = options.addDiskRect;
    this.scheduleDraw = options.scheduleDraw;
    this.drawScene = options.drawScene;
    this.isGameVisible = options.isGameVisible;
    this.usesCompactLayout = options.usesCompactLayout;

    this.fallbackAllowed = false;
    this.diskSizeCache = null;
    this.effectFrame = null;
    this.dropEffects = [];
    this.gearCache = new Map();
    this.assets = {
      background: this.loadImage(ASSET_URLS.background),
      column: this.loadImage(ASSET_URLS.column),
      gear: this.loadImage(ASSET_URLS.gear),
      highlight: this.loadImage(ASSET_URLS.highlight),
    };

    window.setTimeout(() => {
      this.fallbackAllowed = true;
      this.scheduleDraw();
    }, ASSET_FALLBACK_DELAY);
  }

  isReady() {
    return this.isImageReady(this.assets.background)
      && this.isImageReady(this.assets.column)
      && this.isImageReady(this.assets.gear);
  }

  isWaiting() {
    return !this.isReady() && !this.fallbackAllowed;
  }

  resetDiskSizes() {
    this.diskSizeCache = null;
  }

  clearDropEffects() {
    this.dropEffects = [];
    if (this.effectFrame !== null) {
      cancelAnimationFrame(this.effectFrame);
      this.effectFrame = null;
    }
  }

  getPegCenters(width, height) {
    return this.getLayout(width, height).centers;
  }

  drawLoading(width, height, colors) {
    this.drawBackground(width, height, colors);

    const centerX = width / 2;
    const centerY = height / 2;
    const diamondSize = Math.max(8, Math.min(13, width / 90));
    const diamondGap = diamondSize * 2.5;

    this.ctx.save();
    this.ctx.fillStyle = "rgba(246, 216, 139, 0.88)";
    [-1, 0, 1].forEach((offset) => {
      this.ctx.save();
      this.ctx.translate(centerX + offset * diamondGap, centerY - 24);
      this.ctx.rotate(Math.PI / 4);
      this.ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
      this.ctx.restore();
    });

    this.ctx.fillStyle = colors.pegLabel;
    this.ctx.font = `600 ${Math.max(15, Math.min(20, width / 55))}px "HYWenHei-65W", "Hanyi WenHei 65W", "汉仪文黑 65W", Arial, sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(this.translate("themeAssetsLoading"), centerX, centerY + 24);
    this.ctx.restore();
  }

  draw(width, height, colors) {
    if (!this.isReady()) {
      this.drawFallbackBoard(width, height, colors);
      return;
    }

    const gameState = this.getGameState();
    const dragState = this.getDragState();
    const layout = this.getLayout(width, height);
    this.drawBackdrop(width, height);
    this.ctx.drawImage(
      this.assets.background,
      layout.imageX,
      layout.imageY,
      layout.imageWidth,
      layout.imageHeight,
    );

    this.drawColumns(layout);

    const highlightedPeg = this.getHighlightedPeg();
    layout.centers.forEach((centerX, index) => {
      if (highlightedPeg === index) {
        this.drawPegHighlight(centerX, layout);
      }
    });

    const guideMove = this.getGuideMove();
    if (guideMove) {
      this.drawGuideMoveArrow(
        layout.centers[guideMove.source],
        layout.centers[guideMove.target],
        this.getGuideArrowY(layout),
        layout.scale,
        colors,
      );
    }

    gameState.pegs.forEach((peg, pegIndex) => {
      peg.forEach((disk, level) => {
        if (dragState && dragState.disk === disk) {
          return;
        }
        const rect = this.getDiskRect(layout, disk, pegIndex, level);
        this.drawDisk(rect, disk, false, colors);
        this.addDiskRect({ ...rect, disk, peg: pegIndex, level });
      });
    });

    this.drawColumnFronts(layout);

    if (dragState) {
      this.drawDisk(
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

    this.drawDropEffects(performance.now());
  }

  startDropEffect(disk, targetPeg) {
    const gameState = this.getGameState();
    if (!this.isReady() || !gameState || !this.isGameVisible()) {
      return;
    }

    const canvasRect = this.canvas.getBoundingClientRect();
    if (canvasRect.width <= 0 || canvasRect.height <= 0) {
      return;
    }

    const level = gameState.pegs[targetPeg]?.indexOf(disk) ?? -1;
    if (level < 0) {
      return;
    }

    const layout = this.getLayout(canvasRect.width, canvasRect.height);
    const diskRect = this.getDiskRect(layout, disk, targetPeg, level);
    const effectScale = Math.max(0.65, Math.min(1.25, diskRect.width / 240));
    const radiusX = diskRect.width * 0.48;
    const radiusY = diskRect.height * 0.42;
    const particles = Array.from({ length: DROP_SPARK_COUNT }, (_item, index) => {
      const edgeStep = Math.PI * 2 / DROP_SPARK_COUNT;
      const edgeAngle = index * edgeStep + (Math.random() - 0.5) * edgeStep * 0.45;
      const edgeRadius = 0.84 + Math.random() * 0.13;
      const side = Math.cos(edgeAngle) >= 0 ? 1 : -1;
      const baseAngle = side > 0 ? -DROP_SPARK_ANGLE : Math.PI + DROP_SPARK_ANGLE;
      const angle = baseAngle + (Math.random() - 0.5) * DROP_SPARK_SPREAD;
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

    this.dropEffects.push({
      startedAt: performance.now(),
      x: diskRect.x + diskRect.width / 2,
      y: diskRect.y + diskRect.height * 0.48,
      radiusX,
      radiusY,
      scale: effectScale,
      particles,
    });
    this.requestEffectFrame();
  }

  loadImage(src) {
    const image = new Image();
    let retryCount = 0;
    image.decoding = "async";

    const requestImage = () => {
      const separator = src.includes("?") ? "&" : "?";
      image.src = retryCount === 0 ? src : `${src}${separator}retry=${retryCount}`;
    };

    image.addEventListener("load", () => {
      this.gearCache.clear();
      this.scheduleDraw();
    });
    image.addEventListener("error", () => {
      this.scheduleDraw();
      if (retryCount >= ASSET_RETRY_DELAYS.length) {
        return;
      }
      const delay = ASSET_RETRY_DELAYS[retryCount];
      retryCount += 1;
      window.setTimeout(requestImage, delay);
    });
    requestImage();
    return image;
  }

  isImageReady(image) {
    return image.complete && image.naturalWidth > 0;
  }

  requestEffectFrame() {
    if (this.effectFrame !== null) {
      return;
    }

    this.effectFrame = requestAnimationFrame((now) => {
      this.effectFrame = null;
      this.dropEffects = this.dropEffects.filter(
        (effect) => now - effect.startedAt < DROP_EFFECT_DURATION,
      );
      this.drawScene();
      if (this.dropEffects.length) {
        this.requestEffectFrame();
      }
    });
  }

  drawDropEffects(now) {
    this.dropEffects.forEach((effect) => {
      const elapsed = now - effect.startedAt;
      const progress = Math.max(0, Math.min(1, elapsed / DROP_EFFECT_DURATION));
      const fade = (1 - progress) ** 1.7;
      const expansionProgress = 1 - (1 - progress) ** 3;

      this.ctx.save();
      this.ctx.globalCompositeOperation = "lighter";

      const glowRadius = effect.radiusX * (0.7 + expansionProgress * 0.45);
      const glow = this.ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, glowRadius);
      glow.addColorStop(0, `rgba(255, 248, 190, ${0.46 * fade})`);
      glow.addColorStop(0.42, `rgba(255, 208, 88, ${0.28 * fade})`);
      glow.addColorStop(1, "rgba(239, 137, 38, 0)");
      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.ellipse(
        effect.x,
        effect.y,
        glowRadius,
        effect.radiusY * (0.78 + expansionProgress * 0.35),
        0,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();

      effect.particles.forEach((particle, index) => {
        const particleDuration = DROP_EFFECT_DURATION - particle.delay;
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

        this.ctx.strokeStyle = `rgba(255, 190, 56, ${0.86 * alpha})`;
        this.ctx.lineWidth = Math.max(0.8, particle.size * 0.58);
        this.ctx.beginPath();
        this.ctx.moveTo(x - directionX * tailLength, y - directionY * tailLength);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();

        this.ctx.fillStyle = `rgba(255, 244, 170, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();

        if (particle.twinkle) {
          this.drawDropSpark(
            x,
            y,
            particle.size * (2.2 + Math.sin(particleProgress * Math.PI * 5) * 0.35),
            particle.angle + index,
            alpha,
          );
        }
      });

      this.ctx.restore();
    });
  }

  drawDropSpark(x, y, size, rotation, alpha) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(rotation);
    this.ctx.fillStyle = `rgba(255, 250, 205, ${alpha})`;
    this.ctx.beginPath();
    for (let index = 0; index < 8; index += 1) {
      const angle = -Math.PI / 2 + index * Math.PI / 4;
      const radius = index % 2 === 0 ? size : size * 0.24;
      const pointX = Math.cos(angle) * radius;
      const pointY = Math.sin(angle) * radius;
      if (index === 0) {
        this.ctx.moveTo(pointX, pointY);
      } else {
        this.ctx.lineTo(pointX, pointY);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  drawBackdrop(width, height) {
    const imageWidth = this.assets.background.naturalWidth || 1672;
    const imageHeight = this.assets.background.naturalHeight || 941;
    const scale = Math.max(width / imageWidth, height / imageHeight);
    const drawnWidth = imageWidth * scale;
    const drawnHeight = imageHeight * scale;

    this.ctx.save();
    this.ctx.globalAlpha = 0.28;
    this.ctx.drawImage(
      this.assets.background,
      (width - drawnWidth) / 2,
      (height - drawnHeight) / 2,
      drawnWidth,
      drawnHeight,
    );
    this.ctx.restore();
  }

  // 棋盘按背景图原始坐标映射，确保柱子、齿轮孔位和装饰始终对齐。
  getLayout(width, height) {
    const gameState = this.getGameState();
    const imageWidth = this.assets.background.naturalWidth || 1448;
    const imageHeight = this.assets.background.naturalHeight || 1086;
    const scale = Math.min(width / imageWidth, height / imageHeight);
    const drawnWidth = imageWidth * scale;
    const drawnHeight = imageHeight * scale;
    const imageX = (width - drawnWidth) / 2;
    const imageY = (height - drawnHeight) / 2;
    const mapX = (x) => imageX + x * scale;
    const mapY = (y) => imageY + y * scale;
    const stackBaseY = mapY(GEAR_STACK_BASE_Y);
    const topLimitY = Math.max(34, mapY(348));
    const diskStep = Math.max(12, Math.min(26, (stackBaseY - topLimitY) / Math.max(1, gameState.disk_count - 1)));
    const responsiveMaxDiskWidth = Math.min(width * 0.22, scale * 350);
    const compactLandscape = this.usesCompactLayout();
    const responsiveMinDiskWidth = compactLandscape
      ? Math.min(
        responsiveMaxDiskWidth,
        Math.max(COMPACT_MIN_GEAR_WIDTH, responsiveMaxDiskWidth * COMPACT_MIN_GEAR_WIDTH_RATIO),
      )
      : Math.max(54, responsiveMaxDiskWidth * 0.46);
    const diskWidths = this.getLockedDiskWidths(
      responsiveMinDiskWidth,
      responsiveMaxDiskWidth,
      compactLandscape ? "compact-landscape" : "regular",
    );
    const maxDiskWidth = diskWidths[diskWidths.length - 1];
    const maxDiskHeight = this.getDiskHeight(maxDiskWidth);
    const stackCenterY = stackBaseY - maxDiskHeight / 2;
    const stackHoleCenterY = stackCenterY + maxDiskHeight * (
      GEAR_HOLE_CENTER_Y / GEAR_SOURCE_CROP.height - 0.5
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

  drawColumns(layout) {
    if (!this.isImageReady(this.assets.column)) {
      return;
    }
    layout.centers.forEach((centerX) => {
      this.ctx.drawImage(
        this.assets.column,
        centerX - layout.columnWidth / 2,
        layout.columnBottomY - layout.columnHeight,
        layout.columnWidth,
        layout.columnHeight,
      );
    });
  }

  drawColumnFront(layout, columnX, columnY) {
    const image = this.assets.column;
    const source = COLUMN_SHAFT_SOURCE;
    const topHeight = layout.columnHeight * (source.y / image.naturalHeight);
    const shaftX = columnX + layout.columnWidth * (source.x / image.naturalWidth);
    const shaftWidth = layout.columnWidth * (source.width / image.naturalWidth);

    this.ctx.drawImage(
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
    this.ctx.drawImage(
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

  drawColumnFronts(layout) {
    if (!this.isImageReady(this.assets.column)) {
      return;
    }

    const gameState = this.getGameState();
    const dragState = this.getDragState();
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
      const arcDepth = halfColumnWidth * Math.max(0, Math.min(1, COLUMN_JOIN_ARC_DEPTH_RATIO));
      const holeCenterY = layout.stackHoleCenterY
        - topLevel * layout.diskStep * GEAR_STACK_SPACING_RATIO;
      const arcY = holeCenterY + COLUMN_JOIN_OFFSET_Y - arcDepth;

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(columnX, columnY);
      this.ctx.lineTo(columnX + layout.columnWidth, columnY);
      this.ctx.lineTo(columnX + layout.columnWidth, arcY);
      if (arcDepth > 0) {
        const arcRadius = (halfColumnWidth ** 2 + arcDepth ** 2) / (2 * arcDepth);
        const arcCenterY = arcY - (arcRadius - arcDepth);
        const arcStartAngle = Math.atan2(arcY - arcCenterY, halfColumnWidth);
        this.ctx.arc(centerX, arcCenterY, arcRadius, arcStartAngle, Math.PI - arcStartAngle);
      } else {
        this.ctx.lineTo(columnX, arcY);
      }
      this.ctx.closePath();
      this.ctx.clip();
      this.drawColumnFront(layout, columnX, columnY);
      this.ctx.restore();
    });
  }

  getDiskRect(layout, disk, pegIndex, level) {
    const imageWidth = layout.diskWidths[disk - 1];
    const imageHeight = this.getDiskHeight(imageWidth);
    const visibleWidth = imageWidth * (GEAR_VISIBLE_BOUNDS.width / GEAR_SOURCE_CROP.width);
    const visibleHeight = imageHeight * (GEAR_VISIBLE_BOUNDS.height / GEAR_SOURCE_CROP.height);
    const holeCenterY = layout.stackHoleCenterY
      - level * layout.diskStep * GEAR_STACK_SPACING_RATIO;
    const imageY = holeCenterY - imageHeight * (GEAR_HOLE_CENTER_Y / GEAR_SOURCE_CROP.height);
    return {
      x: layout.centers[pegIndex] - visibleWidth / 2,
      y: imageY + imageHeight * (GEAR_VISIBLE_BOUNDS.y / GEAR_SOURCE_CROP.height),
      width: visibleWidth,
      height: visibleHeight,
    };
  }

  getLockedDiskWidths(minDiskWidth, maxDiskWidth, layoutProfile) {
    const diskCount = this.getGameState().disk_count;
    if (
      !this.diskSizeCache
      || this.diskSizeCache.diskCount !== diskCount
      || this.diskSizeCache.layoutProfile !== layoutProfile
    ) {
      const widthStep = (maxDiskWidth - minDiskWidth) / Math.max(1, diskCount - 1);
      this.diskSizeCache = {
        diskCount,
        layoutProfile,
        widths: Array.from({ length: diskCount }, (_item, index) => minDiskWidth + index * widthStep),
      };
    }
    return this.diskSizeCache.widths;
  }

  getDiskHeight(diskWidth) {
    return diskWidth * GEAR_HEIGHT_RATIO;
  }

  getGearDrawRect(rect) {
    const width = rect.width * (GEAR_SOURCE_CROP.width / GEAR_VISIBLE_BOUNDS.width);
    const height = rect.height * (GEAR_SOURCE_CROP.height / GEAR_VISIBLE_BOUNDS.height);
    return {
      x: rect.x - width * (GEAR_VISIBLE_BOUNDS.x / GEAR_SOURCE_CROP.width),
      y: rect.y - height * (GEAR_VISIBLE_BOUNDS.y / GEAR_SOURCE_CROP.height),
      width,
      height,
    };
  }

  drawPegHighlight(centerX, layout) {
    if (!this.isImageReady(this.assets.highlight)) {
      return;
    }

    const highlightWidth = Math.max(layout.columnWidth * 1.125, layout.scale * 31);
    const highlightHeight = highlightWidth * (
      this.assets.highlight.naturalHeight / this.assets.highlight.naturalWidth
    );
    const y = layout.pegTopY + layout.scale * COLUMN_HIGHLIGHT_TOP_OFFSET - highlightHeight;

    this.ctx.save();
    this.ctx.shadowColor = "rgba(255, 238, 184, 0.58)";
    this.ctx.shadowBlur = Math.max(4, layout.scale * 9);
    this.ctx.drawImage(
      this.assets.highlight,
      centerX - highlightWidth / 2,
      y,
      highlightWidth,
      highlightHeight,
    );
    this.ctx.restore();
  }

  drawDisk(rect, disk, lifted, colors) {
    const gear = this.getTintedGear(this.getDiskColor(disk));
    const drawRect = this.getGearDrawRect(rect);

    this.ctx.save();
    this.ctx.shadowColor = lifted ? colors.diskShadowLifted : colors.diskShadow;
    this.ctx.shadowBlur = lifted ? 18 : 10;
    this.ctx.shadowOffsetY = lifted ? 10 : 4;
    if (gear) {
      this.ctx.drawImage(gear, drawRect.x, drawRect.y, drawRect.width, drawRect.height);
    } else {
      this.drawFallbackDisk(rect, disk, lifted, colors);
      this.ctx.restore();
      return;
    }
    this.ctx.shadowColor = "transparent";
    this.ctx.restore();
  }

  getTintedGear(color) {
    if (!this.isImageReady(this.assets.gear)) {
      return null;
    }
    if (this.gearCache.has(color)) {
      return this.gearCache.get(color);
    }

    const crop = GEAR_SOURCE_CROP;
    const canvas = document.createElement("canvas");
    canvas.width = crop.width;
    canvas.height = crop.height;
    const offscreen = canvas.getContext("2d");
    const sourceLayer = document.createElement("canvas");
    sourceLayer.width = crop.width;
    sourceLayer.height = crop.height;
    const sourceContext = sourceLayer.getContext("2d");
    sourceContext.drawImage(
      this.assets.gear,
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
    offscreen.drawImage(sourceLayer, 0, 0);
    offscreen.globalCompositeOperation = "multiply";
    offscreen.globalAlpha = GEAR_TEXTURE_SHADOW_ALPHA;
    offscreen.drawImage(sourceLayer, 0, 0);
    offscreen.globalCompositeOperation = "screen";
    offscreen.globalAlpha = GEAR_TEXTURE_HIGHLIGHT_ALPHA;
    offscreen.drawImage(sourceLayer, 0, 0);
    offscreen.globalAlpha = 1;

    this.gearCache.set(color, canvas);
    return canvas;
  }

  getGuideArrowY(layout) {
    const highlightWidth = Math.max(layout.columnWidth * 1.125, layout.scale * 31);
    const highlightRatio = this.assets.highlight.naturalWidth
      ? this.assets.highlight.naturalHeight / this.assets.highlight.naturalWidth
      : 225 / 252;
    const highlightHeight = highlightWidth * highlightRatio;
    const highlightBottomY = layout.pegTopY + layout.scale * COLUMN_HIGHLIGHT_TOP_OFFSET;
    return highlightBottomY - highlightHeight / 2;
  }

  drawGuideMoveArrow(sourceX, targetX, y, scale, colors) {
    const direction = Math.sign(targetX - sourceX);
    if (!direction) {
      return;
    }

    const safeScale = Math.max(0.65, scale || 1);
    const endpointGap = 34 * safeScale;
    const startX = sourceX + direction * endpointGap;
    const endX = targetX - direction * endpointGap;
    const length = Math.abs(endX - startX);
    const headLength = Math.min(46 * safeScale, length * 0.3);
    const headHalfHeight = 23 * safeScale;
    const shaftHalfHeight = 7 * safeScale;
    const tailCurveLength = Math.min(58 * safeScale, length * 0.34);
    const headBaseX = length - headLength;

    this.ctx.save();
    this.ctx.translate(startX, y);
    this.ctx.scale(direction, 1);
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.shadowColor = "rgba(255, 145, 54, 0.52)";
    this.ctx.shadowBlur = 12 * safeScale;

    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.bezierCurveTo(
      10 * safeScale,
      -4 * safeScale,
      tailCurveLength * 0.44,
      -shaftHalfHeight * 1.65,
      tailCurveLength,
      -shaftHalfHeight,
    );
    this.ctx.lineTo(headBaseX, -shaftHalfHeight);
    this.ctx.lineTo(headBaseX, -headHalfHeight);
    this.ctx.quadraticCurveTo(headBaseX + 7 * safeScale, -headHalfHeight * 0.82, length, 0);
    this.ctx.quadraticCurveTo(headBaseX + 7 * safeScale, headHalfHeight * 0.82, headBaseX, headHalfHeight);
    this.ctx.lineTo(headBaseX, shaftHalfHeight);
    this.ctx.lineTo(tailCurveLength, shaftHalfHeight);
    this.ctx.bezierCurveTo(
      tailCurveLength * 0.44,
      shaftHalfHeight * 1.65,
      10 * safeScale,
      4 * safeScale,
      0,
      0,
    );
    this.ctx.closePath();

    const fillGradient = this.ctx.createLinearGradient(0, -headHalfHeight, 0, headHalfHeight);
    fillGradient.addColorStop(0, colors.guideArrowAccent);
    fillGradient.addColorStop(0.2, colors.guideArrowFill);
    fillGradient.addColorStop(1, "#db6c2e");
    this.ctx.fillStyle = fillGradient;
    this.ctx.fill();

    this.ctx.strokeStyle = colors.guideArrowAccent;
    this.ctx.lineWidth = 12 * safeScale;
    this.ctx.stroke();
    this.ctx.strokeStyle = colors.guideArrowStroke;
    this.ctx.lineWidth = 6 * safeScale;
    this.ctx.stroke();

    this.ctx.shadowColor = "transparent";
    this.ctx.beginPath();
    this.ctx.moveTo(tailCurveLength * 0.5, -shaftHalfHeight * 0.45);
    this.ctx.bezierCurveTo(
      length * 0.42,
      -shaftHalfHeight * 0.85,
      headBaseX - 10 * safeScale,
      -shaftHalfHeight * 0.55,
      headBaseX + 5 * safeScale,
      -headHalfHeight * 0.43,
    );
    this.ctx.strokeStyle = "rgba(235, 255, 252, 0.5)";
    this.ctx.lineWidth = 2.2 * safeScale;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(headBaseX + headLength * 0.42, -7 * safeScale);
    this.ctx.lineTo(headBaseX + headLength * 0.58, -3 * safeScale);
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.62)";
    this.ctx.lineWidth = 1.8 * safeScale;
    this.ctx.stroke();
    this.ctx.restore();
  }
}
