from __future__ import annotations

import threading
import time
from typing import Any, Iterable, Sequence

from hanoi_game import (
    HanoiGame,
    build_minimum_solution,
    build_solution_from_state,
    validate_disk_count,
    validate_peg,
    validate_target_pegs,
)


HOME_MODE = "home"
PLAY_MODE = "play"
DEMO_MODE = "demo"
SETUP_MODE = "setup"
SOLVER_MODE = "solver"
GUIDE_MODES = {DEMO_MODE, SOLVER_MODE}


class GameSession:
    def __init__(self) -> None:
        self.game = HanoiGame()
        self.mode = HOME_MODE
        self.start_time = time.monotonic()
        self.finished = False
        self.finished_elapsed_seconds: int | None = None
        self.guide_moves: list[tuple[int, int]] = []
        self.guide_step = 0
        self.guide_start_pegs: list[list[int]] = []
        self.guide_target_peg = 2
        self.lock = threading.Lock()

    def state(
        self,
        message: str = "",
        message_key: str = "",
        message_args: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        is_guide = self.mode in GUIDE_MODES
        return {
            "mode": self.mode,
            "is_home": self.mode == HOME_MODE,
            "is_play": self.mode == PLAY_MODE,
            "is_setup": self.mode == SETUP_MODE,
            "is_guide": is_guide,
            "is_demo": self.mode == DEMO_MODE,
            "is_solver": self.mode == SOLVER_MODE,
            "disk_count": self.game.disk_count,
            "initial_peg": self.game.initial_peg,
            "target_pegs": list(self.game.target_pegs),
            "target_peg": self.guide_target_peg if self.mode in {DEMO_MODE, SETUP_MODE, SOLVER_MODE} else None,
            "pegs": self.game.snapshot(),
            "move_count": self.game.move_count,
            "can_undo": bool(self.game.history),
            "can_redo": bool(self.game.redo_history),
            "minimum_moves": self.game.minimum_moves,
            "elapsed_seconds": self._elapsed_seconds(),
            "is_complete": self.game.is_complete,
            "completion_peg": self.game.completion_peg,
            "guide_step": self.guide_step if is_guide else 0,
            "guide_total_steps": len(self.guide_moves) if is_guide else 0,
            "message": message,
            "message_key": message_key,
            "message_args": message_args or {},
        }

    def go_home(self) -> dict[str, Any]:
        with self.lock:
            self.mode = HOME_MODE
            self._clear_guide()
            self.finished = False
            self.finished_elapsed_seconds = None
            return self.state("已返回主页", "homeOpened")

    def start_play(self, disk_count: int, initial_peg: int, target_pegs: Iterable[int]) -> dict[str, Any]:
        with self.lock:
            targets = validate_target_pegs(target_pegs)
            self._validate_start_config(disk_count, initial_peg, targets)
            self.game.reset(disk_count, initial_peg, targets)
            self.mode = PLAY_MODE
            self.start_time = time.monotonic()
            self.finished = False
            self.finished_elapsed_seconds = None
            self._clear_guide()
            return self.state("新游戏已开始", "newGameStarted")

    def move(self, source: int, target: int) -> dict[str, Any]:
        with self.lock:
            if self.mode != PLAY_MODE:
                return self.state("当前模式不能手动移动盘子", "manualMoveBlocked")

            if self.finished:
                return self.state("本局已完成，请开始新游戏", "gameAlreadyComplete")

            if not self.game.move(source, target):
                return self.state("无效移动：大盘子不能放在小盘子上", "invalidMove")

            if self.game.is_complete:
                self.finished = True
                self.finished_elapsed_seconds = int(time.monotonic() - self.start_time)
                peg_number = (self.game.completion_peg or 0) + 1
                return self.state(
                    f"完成！已移到第 {peg_number} 根柱子",
                    "completeOnPeg",
                    {"peg": peg_number},
                )

            return self.state("移动成功", "moveSucceeded")

    def undo(self) -> dict[str, Any]:
        with self.lock:
            if self.mode != PLAY_MODE:
                return self.state("当前模式不能撤回手动移动", "undoBlocked")

            if not self.game.undo():
                return self.state("没有可撤回的步骤", "nothingToUndo")

            if self.finished_elapsed_seconds is not None:
                self.start_time = time.monotonic() - self.finished_elapsed_seconds

            self.finished = False
            self.finished_elapsed_seconds = None
            return self.state("已撤回上一步", "undoSucceeded")

    def redo(self) -> dict[str, Any]:
        with self.lock:
            if self.mode != PLAY_MODE:
                return self.state("当前模式不能返回下一步", "redoBlocked")

            if not self.game.redo():
                return self.state("没有可返回的步骤", "nothingToRedo")

            if self.game.is_complete:
                self.finished = True
                self.finished_elapsed_seconds = self._elapsed_seconds()
                peg_number = (self.game.completion_peg or 0) + 1
                return self.state(
                    f"完成！已移到第 {peg_number} 根柱子",
                    "completeOnPeg",
                    {"peg": peg_number},
                )

            return self.state("已返回下一步", "redoSucceeded")

    def start_demo(self, disk_count: int, initial_peg: int, target_peg: int) -> dict[str, Any]:
        with self.lock:
            self._validate_start_config(disk_count, initial_peg, (target_peg,))
            spare = self._spare_peg(initial_peg, target_peg)
            self.game.reset(disk_count, initial_peg, (target_peg,))
            self.mode = DEMO_MODE
            self.guide_target_peg = target_peg
            self.guide_start_pegs = self.game.snapshot()
            self.guide_moves = build_minimum_solution(disk_count, initial_peg, target_peg, spare)
            self.guide_step = 0
            self.finished = False
            self.finished_elapsed_seconds = None
            return self.state(
                f"教学演示已开启，共 {len(self.guide_moves)} 步",
                "demoStarted",
                {"total": len(self.guide_moves)},
            )

    def start_solver_setup(self, disk_count: int, initial_peg: int, target_peg: int) -> dict[str, Any]:
        with self.lock:
            self._validate_start_config(disk_count, initial_peg, (target_peg,))
            self.game.reset(disk_count, initial_peg, (target_peg,))
            self.mode = SETUP_MODE
            self.guide_target_peg = target_peg
            self._clear_guide(keep_target=True)
            self.finished = False
            self.finished_elapsed_seconds = None
            return self.state("请拖动盘子设置残局", "setupStarted")

    def move_setup_disk(self, disk: int, target: int) -> dict[str, Any]:
        with self.lock:
            if self.mode != SETUP_MODE:
                return self.state("当前不在残局设置模式", "notInSetup")

            validate_peg(target)
            source = self.game.disk_location(disk)
            if source == target:
                return self.state("盘子位置未改变", "setupMoveUnchanged")

            if not self.game.move_any_disk(disk, target):
                return self.state("盘子位置未改变", "setupMoveUnchanged")

            return self.state("盘子位置已更新", "setupMoveSucceeded")

    def start_solver(self) -> dict[str, Any]:
        with self.lock:
            if self.mode != SETUP_MODE:
                return self.state("当前不在残局设置模式", "notInSetup")

            self.guide_start_pegs = self.game.snapshot()
            self.guide_moves = build_solution_from_state(self.guide_start_pegs, self.guide_target_peg)
            self.guide_step = 0
            self.mode = SOLVER_MODE
            self.game.load_state(self.guide_start_pegs, (self.guide_target_peg,))
            return self.state(
                f"残局破解已开始，共 {len(self.guide_moves)} 步",
                "solverStarted",
                {"total": len(self.guide_moves)},
            )

    def guide_next(self) -> dict[str, Any]:
        with self.lock:
            if self.mode not in GUIDE_MODES:
                return self.state("当前不在步骤演示模式", "notInGuide")
            if self.guide_step >= len(self.guide_moves):
                return self.state("已经是最后一步", "alreadyLastStep")

            source, target = self.guide_moves[self.guide_step]
            if not self.game.move(source, target):
                raise RuntimeError("Generated guide move is invalid.")

            self.guide_step += 1
            return self.state(
                f"第 {self.guide_step} 步：将盘子从第 {source + 1} 根移到第 {target + 1} 根",
                "guideNextStep",
                {"step": self.guide_step, "source": source + 1, "target": target + 1},
            )

    def guide_previous(self) -> dict[str, Any]:
        with self.lock:
            if self.mode not in GUIDE_MODES:
                return self.state("当前不在步骤演示模式", "notInGuide")
            if self.guide_step == 0:
                return self.state("已经是第一步", "alreadyFirstStep")

            if not self.game.undo():
                raise RuntimeError("Cannot undo generated guide move.")

            self.guide_step -= 1
            if self.guide_step == 0:
                return self.state("已回到起始状态", "guideBackToStart")

            source, target = self.guide_moves[self.guide_step - 1]
            return self.state(
                f"已回到第 {self.guide_step} 步：盘子在第 {target + 1} 根柱子",
                "guidePreviousStep",
                {"step": self.guide_step, "source": source + 1, "target": target + 1},
            )

    def guide_jump(self, step: int) -> dict[str, Any]:
        with self.lock:
            if self.mode not in GUIDE_MODES:
                return self.state("当前不在步骤演示模式", "notInGuide")
            if step < 0 or step > len(self.guide_moves):
                raise ValueError(f"Step must be between 0 and {len(self.guide_moves)}.")

            self.game.load_state(self.guide_start_pegs, (self.guide_target_peg,))
            for source, target in self.guide_moves[:step]:
                if not self.game.move(source, target):
                    raise RuntimeError("Generated guide move is invalid.")
            self.guide_step = step
            return self.state(
                f"已跳转到第 {self.guide_step} / {len(self.guide_moves)} 步",
                "guideJumped",
                {"step": self.guide_step, "total": len(self.guide_moves)},
            )

    def _elapsed_seconds(self) -> int:
        if self.mode != PLAY_MODE:
            return 0
        if self.finished_elapsed_seconds is not None:
            return self.finished_elapsed_seconds
        return int(time.monotonic() - self.start_time)

    def _clear_guide(self, keep_target: bool = False) -> None:
        self.guide_moves = []
        self.guide_step = 0
        self.guide_start_pegs = []
        if not keep_target:
            self.guide_target_peg = 2

    @staticmethod
    def _validate_start_config(disk_count: int, initial_peg: int, target_pegs: Iterable[int]) -> None:
        validate_disk_count(disk_count)
        validate_peg(initial_peg)
        targets = validate_target_pegs(target_pegs)
        if initial_peg in targets:
            raise ValueError("Initial peg cannot also be a target peg.")

    @staticmethod
    def _spare_peg(source: int, target: int) -> int:
        validate_peg(source)
        validate_peg(target)
        if source == target:
            raise ValueError("Source and target pegs must be different.")
        return next(peg for peg in range(3) if peg not in (source, target))
