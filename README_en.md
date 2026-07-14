# Tower of Hanoi

[中文](README.md)

A fully static Tower of Hanoi game that runs directly in the browser. It does not require a server or backend deployment and is suitable for GitHub Pages.

![Tower of Hanoi demo](Demo.png)

## Features

- Home screen entries for New Game, Tutorial Demo, and Endgame Solver.
- Configurable disk count from 2 to 16.
- New games support configurable initial and target pegs. The timer pauses on completion, and the completed game can be restarted with the same settings.
- Supports undoing the previous move without counting it in the total move count.
- Tracks total moves, total time, and the theoretical minimum move count.
- Tutorial Demo generates the shortest path for the configured disk count, initial peg, and target peg, with Previous, Next, and slider preview controls.
- Endgame Solver lets users drag disks into a legal custom state and calculates the shortest completion path from that state.
- Supports Chinese/English switching and dark/light theme switching.

## Run

Open the root `index.html` file directly in a browser.

You can also publish the repository with GitHub Pages and visit a URL like:

```text
https://rrrome.github.io/hanoi/
```

## Project Structure

```text
index.html
style.css
app.js
```

These three files are the active static app.

The `python_reference/` directory keeps the earlier Python backend version for reference only. The current page does not import, request, or depend on any Python code.

## Check

```bash
node --check app.js
```

To check the reference Python version:

```bash
cd python_reference
python3 -m unittest
```

## License

MIT License. See [LICENSE](LICENSE).
