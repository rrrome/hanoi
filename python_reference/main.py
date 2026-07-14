from __future__ import annotations

import argparse

from hanoi_server import run


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="运行汉诺塔 Web 游戏")
    parser.add_argument("--port", type=int, default=8000, help="本地服务器端口，默认 8000")
    parser.add_argument("--no-browser", action="store_true", help="启动后不自动打开浏览器")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    run(args.port, open_browser=not args.no_browser)
