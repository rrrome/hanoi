# Tower of Hanoi

[中文](README.md)

A Tower of Hanoi web game built with the Python standard library. Running `main.py` starts a local server, and the game UI is shown in the browser.

![Tower of Hanoi demo](Demo.png)

## Features

- All disks start on the leftmost peg by default. The disk count can be set in the game UI from 2 to 16.
- Click pegs to move disks. The Python server validates moves and blocks invalid ones.
- Supports undoing the previous move. Undoing a move subtracts it from the total move count.
- Moving all disks correctly to either the second or third peg automatically wins the game and pauses the timer.
- Tracks total moves, total time, and the theoretical minimum move count.
- Supports tutorial demo mode: the system calculates the minimum solution path, lets users step through it with Previous and Next, and supports dragging the bottom slider to preview any step. Demo mode is not timed, disables manual moves, and can be exited at any time.
- Supports global Chinese/English switching at any time during the game.
- Changing the disk count immediately starts a new game.

## Run

```bash
python3 main.py
```

The default address is `http://127.0.0.1:8000`. If the port is already in use, the program automatically chooses an available port and prints it in the terminal.

## Test

```bash
python3 -m unittest
```

You can also run a syntax check first:

```bash
python3 -m py_compile main.py hanoi_game.py
```

## License

MIT License. See [LICENSE](LICENSE).
