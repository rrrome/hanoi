# 汉诺塔

[English](README_en.md)

一个可直接在浏览器运行的纯静态汉诺塔游戏。项目不需要服务器或部署后端，适合通过 GitHub Pages 公开访问。

![汉诺塔演示](Demo.png)

## 功能

- 主页入口：新游戏、教学演示、残局破解。
- 盘子数量可设置为 2 到 16。
- 新游戏支持选择初始柱和目标柱，完成后自动暂停计时，并可“再来一局”。
- 支持撤回上一步，撤回不计入总步数。
- 实时统计总步数、总时间和理论最少步数。
- 教学演示会按当前盘数、初始柱和目标柱生成最少步骤，支持上一步、下一步和滑条预览。
- 残局破解支持拖动任意盘子设置合法残局，并从当前状态计算最少完成步骤。
- 支持中文/英文切换，以及深色/浅色模式切换。

## 运行

直接打开根目录的 `index.html` 即可运行。

也可以把仓库发布到 GitHub Pages，访问类似：

```text
https://rrrome.github.io/hanoi/
```

## 项目结构

```text
index.html
style.css
app.js
```

以上三个文件就是实际运行的纯静态版本。

`python_reference/` 中保留早期 Python 后端版本，仅供参考学习；当前页面不引用、不请求、不依赖其中任何代码。

## 检查

```bash
node --check app.js
```

如需检查参考 Python 版本：

```bash
cd python_reference
python3 -m unittest
```

## 许可证

MIT License. See [LICENSE](LICENSE).
