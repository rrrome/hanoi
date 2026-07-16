from __future__ import annotations

import json
import socket
import threading
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from hanoi_session import GameSession


ROOT = Path(__file__).resolve().parent
STATIC_DIR = ROOT / "static"


class HanoiRequestHandler(BaseHTTPRequestHandler):
    server_version = "HanoiHTTP/2.0"

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

            if path == "/api/home":
                self._send_json(session.go_home())
            elif path == "/api/play/start":
                self._send_json(
                    session.start_play(
                        int(payload["disk_count"]),
                        int(payload["initial_peg"]),
                        [int(peg) for peg in payload["target_pegs"]],
                    )
                )
            elif path == "/api/move":
                self._send_json(session.move(int(payload["source"]), int(payload["target"])))
            elif path == "/api/undo":
                self._send_json(session.undo())
            elif path == "/api/redo":
                self._send_json(session.redo())
            elif path == "/api/demo/start":
                self._send_json(
                    session.start_demo(
                        int(payload["disk_count"]),
                        int(payload["initial_peg"]),
                        int(payload["target_peg"]),
                    )
                )
            elif path == "/api/solver/setup":
                self._send_json(
                    session.start_solver_setup(
                        int(payload["disk_count"]),
                        int(payload["initial_peg"]),
                        int(payload["target_peg"]),
                    )
                )
            elif path == "/api/solver/move-disk":
                self._send_json(session.move_setup_disk(int(payload["disk"]), int(payload["target"])))
            elif path == "/api/solver/start":
                self._send_json(session.start_solver())
            elif path == "/api/guide/next":
                self._send_json(session.guide_next())
            elif path == "/api/guide/previous":
                self._send_json(session.guide_previous())
            elif path == "/api/guide/jump":
                self._send_json(session.guide_jump(int(payload["step"])))
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
            ".png": "image/png",
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
    print(f"堆栈塔已启动：{url}")
    print("按 Ctrl+C 停止服务器")

    if open_browser:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
    finally:
        server.server_close()
