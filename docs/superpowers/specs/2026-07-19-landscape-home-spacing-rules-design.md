# 横屏手机主页间距与规则文案设计

## 目标

修复手机横屏主页顶部胶囊边框过于贴近内容的问题，将主页宣传文案替换为简要游戏规则，并确保三个模式入口在横屏下整体水平居中。

## 范围

- 仅调整横屏、最大宽度 1024px、最大高度 600px、粗指针设备对应的紧凑布局。
- 保持竖屏、平板和桌面布局不变。
- 保持按钮名称“新游戏 / 教学演示 / 残局破解”及其英文名称不变。
- 保持三按钮的三列排列和现有触控高度不变。

## 布局设计

紧凑横屏断点目前将顶部 `.topbar` 的内边距清零，导致标题与操作按钮紧贴胶囊边框。该断点下将顶部胶囊内边距设为 `6px 10px`，通过增大外框内容区域提供上下和左右留白；`.modebar` 继续保持现有紧凑设置，避免改变游戏页。

横屏下的 `.home-actions` 保持现有三列、间距、宽度和按钮尺寸，并增加水平自动外边距，使整个功能入口组相对于主页内容居中。

## 双语规则文案

继续复用现有 `homeEyebrow`、`homeHeadline`、`homeDescription` 国际化键，不改变 DOM 结构。

中文：

- `homeEyebrow`: “游戏规则”
- `homeHeadline`: “一次只移动一个盘子”
- `homeDescription`: “只能移动每根柱子最上方的盘子，大盘子不能放在小盘子上。将所有盘子移到目标柱即可完成。”

英文：

- `homeEyebrow`: “HOW TO PLAY”
- `homeHeadline`: “Move one disk at a time”
- `homeDescription`: “Only the top disk on a peg can move, and a larger disk cannot sit on a smaller one. Move the full stack to a target peg to win.”

原神主题沿用现有术语转换逻辑，在中文显示“齿轮”、英文显示“gear”。隐私说明保持不变。

## 验证

- 契约测试确认中英文文案准确更新。
- 响应式契约测试确认横屏 `.topbar` 使用 `6px 10px` 内边距，`.modebar` 不受影响，`.home-actions` 水平居中。
- 在典型手机横屏尺寸下分别检查中英文页面，确认顶部胶囊不拥挤、规则文案不溢出、三个入口居中且保持三列。
- 运行完整前端与 Python 测试，并执行 CSS/补丁格式检查。
