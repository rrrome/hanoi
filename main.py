from __future__ import annotations

import argparse
import json
import socket
import threading
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from hanoi_game import HanoiGame, build_minimum_solution


ROOT = Path(__file__).resolve().parent
STATIC_DIR = ROOT / "static"


class GameSession:
    def __init__(self, disk_count: int = 3) -> None:
        self.game = HanoiGame(disk_count)
        self.start_time = time.monotonic()
        self.finished = False
        self.finished_elapsed_seconds: int | None = None
        self.mode = "play"
        self.demo_moves: list[tuple[int, int]] = []
        self.demo_step = 0
        self.saved_play_state: dict[str, Any] | None = None
        self.lock = threading.Lock()

    def state(
        self,
        message: str = "",
        message_key: str = "",
        message_args: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        elapsed_seconds = self._elapsed_seconds()
        completion_peg = self.game.completion_peg
        is_demo = self.mode == "demo"
        return {
            "mode": self.mode,
            "is_demo": is_demo,
            "disk_count": self.game.disk_count,
            "pegs": self.game.pegs,
            "move_count": self.game.move_count,
            "minimum_moves": self.game.minimum_moves,
            "elapsed_seconds": elapsed_seconds,
            "is_complete": self.game.is_complete,
            "completion_peg": completion_peg,
            "demo_step": self.demo_step if is_demo else 0,
            "demo_total_steps": len(self.demo_moves) if is_demo else 0,
            "demo_target_peg": 2 if is_demo else None,
            "message": message,
            "message_key": message_key,
            "message_args": message_args or {},
        }

    def reset(self, disk_count: int) -> dict[str, Any]:
        with self.lock:
            self.mode = "play"
            self.demo_moves = []
            self.demo_step = 0
            self.saved_play_state = None
            self.game.reset(disk_count)
            self.start_time = time.monotonic()
            self.finished = False
            self.finished_elapsed_seconds = None
            return self.state("新游戏已开始", "newGameStarted")

    def move(self, source: int, target: int) -> dict[str, Any]:
        with self.lock:
            if self.mode == "demo":
                return self.state("教学演示模式中不能手动移动盘子", "demoManualMoveBlocked")

            if self.finished:
                return self.state("本局已完成，请开始新游戏", "gameAlreadyComplete")

            if not self.game.move(source, target):
                return self.state("无效移动：大盘子不能放在小盘子上", "invalidMove")

            if self.game.is_complete:
                self.finished = True
                self.finished_elapsed_seconds = int(time.monotonic() - self.start_time)
                completion_peg = self.game.completion_peg
                peg_number = (completion_peg or 0) + 1
                return self.state(
                    f"完成！已移到第 {peg_number} 根柱子",
                    "completeOnPeg",
                    {"peg": peg_number},
                )

            return self.state("移动成功", "moveSucceeded")

    def undo(self) -> dict[str, Any]:
        with self.lock:
            if self.mode == "demo":
                return self.state("教学演示模式中请使用上一步", "demoUsePrevious")

            if not self.game.undo():
                return self.state("没有可撤回的步骤", "nothingToUndo")

            if self.finished_elapsed_seconds is not None:
                self.start_time = time.monotonic() - self.finished_elapsed_seconds

            self.finished = False
            self.finished_elapsed_seconds = None
            return self.state("已撤回上一步", "undoSucceeded")

    def start_demo(self, disk_count: int) -> dict[str, Any]:
        with self.lock:
            if self.mode != "demo":
                self.saved_play_state = self._snapshot_play_state()

            self.mode = "demo"
            self.demo_moves = build_minimum_solution(disk_count, source=0, target=2, auxiliary=1)
            self.demo_step = 0
            self.game.reset(disk_count)
            self.finished = False
            self.finished_elapsed_seconds = None
            return self.state(
                f"教学演示已开启，共 {len(self.demo_moves)} 步",
                "demoStarted",
                {"total": len(self.demo_moves)},
            )

    def demo_next(self) -> dict[str, Any]:
        with self.lock:
            if self.mode != "demo":
                return self.state("当前不在教学演示模式", "notInDemo")
            if self.demo_step >= len(self.demo_moves):
                return self.state("已经是最后一步", "alreadyLastStep")

            source, target = self.demo_moves[self.demo_step]
            if not self.game.move(source, target):
                raise RuntimeError("Generated demo move is invalid.")

            self.demo_step += 1
            return self.state(
                f"第 {self.demo_step} 步：将盘子从第 {source + 1} 根移到第 {target + 1} 根",
                "demoNextStep",
                {"step": self.demo_step, "source": source + 1, "target": target + 1},
            )

    def demo_previous(self) -> dict[str, Any]:
        with self.lock:
            if self.mode != "demo":
                return self.state("当前不在教学演示模式", "notInDemo")
            if self.demo_step == 0:
                return self.state("已经是第一步", "alreadyFirstStep")

            if not self.game.undo():
                raise RuntimeError("Cannot undo generated demo move.")

            self.demo_step -= 1
            if self.demo_step == 0:
                return self.state("已回到初始状态", "demoBackToStart")

            source, target = self.demo_moves[self.demo_step - 1]
            return self.state(
                f"已回到第 {self.demo_step} 步：盘子在第 {target + 1} 根柱子",
                "demoPreviousStep",
                {"step": self.demo_step, "source": source + 1, "target": target + 1},
            )

    def demo_jump(self, step: int) -> dict[str, Any]:
        with self.lock:
            if self.mode != "demo":
                return self.state("当前不在教学演示模式", "notInDemo")
            if step < 0 or step > len(self.demo_moves):
                raise ValueError(f"Step must be between 0 and {len(self.demo_moves)}.")

            while self.demo_step < step:
                source, target = self.demo_moves[self.demo_step]
                if not self.game.move(source, target):
                    raise RuntimeError("Generated demo move is invalid.")
                self.demo_step += 1

            while self.demo_step > step:
                if not self.game.undo():
                    raise RuntimeError("Cannot undo generated demo move.")
                self.demo_step -= 1

            return self.state(
                f"已跳转到第 {self.demo_step} / {len(self.demo_moves)} 步",
                "demoJumped",
                {"step": self.demo_step, "total": len(self.demo_moves)},
            )

    def exit_demo(self) -> dict[str, Any]:
        with self.lock:
            if self.mode != "demo":
                return self.state("当前不在教学演示模式", "notInDemo")

            self.mode = "play"
            self.demo_moves = []
            self.demo_step = 0
            self._restore_play_state()
            self.saved_play_state = None
            return self.state("已退出教学演示模式", "demoExited")

    def _elapsed_seconds(self) -> int:
        if self.mode == "demo":
            return 0
        if self.finished_elapsed_seconds is not None:
            return self.finished_elapsed_seconds
        return int(time.monotonic() - self.start_time)

    def _snapshot_play_state(self) -> dict[str, Any]:
        return {
            "disk_count": self.game.disk_count,
            "pegs": [peg.copy() for peg in self.game.pegs],
            "move_count": self.game.move_count,
            "history": self.game.history.copy(),
            "elapsed_seconds": self._elapsed_seconds(),
            "finished": self.finished,
            "finished_elapsed_seconds": self.finished_elapsed_seconds,
        }

    def _restore_play_state(self) -> None:
        if self.saved_play_state is None:
            self.game.reset()
            self.start_time = time.monotonic()
            self.finished = False
            self.finished_elapsed_seconds = None
            return

        state = self.saved_play_state
        self.game.disk_count = int(state["disk_count"])
        self.game.pegs = [peg.copy() for peg in state["pegs"]]
        self.game.move_count = int(state["move_count"])
        self.game.history = state["history"].copy()
        self.finished = bool(state["finished"])
        self.finished_elapsed_seconds = state["finished_elapsed_seconds"]
        self.start_time = time.monotonic() - int(state["elapsed_seconds"])


class HanoiRequestHandler(BaseHTTPRequestHandler):
    server_version = "HanoiHTTP/1.0"

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/state":
            self._send_json(self.server.session.state())  # type: ignore[attr-defined]
            return

        if path == "/":
            path = "/index.html"

        self._serve_static(path)

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        try:
            payload = self._read_json()
            session = self.server.session  # type: ignore[attr-defined]

            if path == "/api/reset":
                disk_count = int(payload.get("disk_count", session.game.disk_count))
                self._send_json(session.reset(disk_count))
            elif path == "/api/move":
                source = int(payload["source"])
                target = int(payload["target"])
                self._send_json(session.move(source, target))
            elif path == "/api/undo":
                self._send_json(session.undo())
            elif path == "/api/demo/start":
                disk_count = int(payload.get("disk_count", session.game.disk_count))
                self._send_json(session.start_demo(disk_count))
            elif path == "/api/demo/next":
                self._send_json(session.demo_next())
            elif path == "/api/demo/previous":
                self._send_json(session.demo_previous())
            elif path == "/api/demo/jump":
                step = int(payload["step"])
                self._send_json(session.demo_jump(step))
            elif path == "/api/demo/exit":
                self._send_json(session.exit_demo())
            else:
                self._send_json({"error": "Not found"}, status=404)
        except (KeyError, TypeError, ValueError) as exc:
            self._send_json({"error": str(exc)}, status=400)

    def log_message(self, format: str, *args: Any) -> None:
        return

    def _read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}

        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def _serve_static(self, url_path: str) -> None:
        requested = (STATIC_DIR / url_path.lstrip("/")).resolve()
        if not requested.is_file() or STATIC_DIR not in requested.parents:
            self._send_json({"error": "Not found"}, status=404)
            return

        content_type = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".svg": "image/svg+xml",
        }.get(requested.suffix, "application/octet-stream")

        data = requested.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _send_json(self, data: dict[str, Any], status: int = 200) -> None:
        encoded = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def find_available_port(preferred_port: int) -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(("127.0.0.1", preferred_port))
            return preferred_port
        except OSError:
            sock.bind(("127.0.0.1", 0))
            return int(sock.getsockname()[1])


def run(port: int, open_browser: bool) -> None:
    selected_port = find_available_port(port)
    server = ThreadingHTTPServer(("127.0.0.1", selected_port), HanoiRequestHandler)
    server.session = GameSession()  # type: ignore[attr-defined]

    url = f"http://127.0.0.1:{selected_port}"
    print(f"汉诺塔已启动：{url}")
    print("按 Ctrl+C 停止服务器")

    if open_browser:
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
    finally:
        server.server_close()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="运行汉诺塔 Web 游戏")
    parser.add_argument("--port", type=int, default=8000, help="本地服务器端口，默认 8000")
    parser.add_argument("--no-browser", action="store_true", help="启动后不自动打开浏览器")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run(args.port, open_browser=not args.no_browser)
