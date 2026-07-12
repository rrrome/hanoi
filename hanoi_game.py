from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Tuple


MIN_DISKS = 2
MAX_DISKS = 16
PEG_COUNT = 3


Move = Tuple[int, int, int]
SolutionMove = Tuple[int, int]


def build_minimum_solution(
    disk_count: int,
    source: int = 0,
    target: int = 2,
    auxiliary: int = 1,
) -> List[SolutionMove]:
    HanoiGame._validate_disk_count(disk_count)
    HanoiGame._validate_peg(source)
    HanoiGame._validate_peg(target)
    HanoiGame._validate_peg(auxiliary)

    if len({source, target, auxiliary}) != PEG_COUNT:
        raise ValueError("Source, target, and auxiliary pegs must be different.")

    moves: List[SolutionMove] = []

    def solve(count: int, start: int, end: int, spare: int) -> None:
        if count == 0:
            return
        solve(count - 1, start, spare, end)
        moves.append((start, end))
        solve(count - 1, spare, end, start)

    solve(disk_count, source, target, auxiliary)
    return moves


@dataclass
class HanoiGame:
    disk_count: int = 3
    pegs: List[List[int]] = field(default_factory=list)
    move_count: int = 0
    history: List[Move] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.reset(self.disk_count)

    def reset(self, disk_count: Optional[int] = None) -> None:
        if disk_count is not None:
            self._validate_disk_count(disk_count)
            self.disk_count = disk_count

        self.pegs = [list(range(self.disk_count, 0, -1)), [], []]
        self.move_count = 0
        self.history = []

    def move(self, source: int, target: int) -> bool:
        self._validate_peg(source)
        self._validate_peg(target)

        if source == target or not self.pegs[source]:
            return False

        disk = self.pegs[source][-1]
        if self.pegs[target] and self.pegs[target][-1] < disk:
            return False

        self.pegs[source].pop()
        self.pegs[target].append(disk)
        self.history.append((source, target, disk))
        self.move_count += 1
        return True

    def undo(self) -> bool:
        if not self.history:
            return False

        source, target, disk = self.history.pop()
        if not self.pegs[target] or self.pegs[target][-1] != disk:
            raise RuntimeError("Game history is inconsistent with the current board.")

        self.pegs[target].pop()
        self.pegs[source].append(disk)
        self.move_count = max(0, self.move_count - 1)
        return True

    @property
    def is_complete(self) -> bool:
        return any(len(self.pegs[peg]) == self.disk_count for peg in (1, 2))

    @property
    def completion_peg(self) -> Optional[int]:
        for peg in (1, 2):
            if len(self.pegs[peg]) == self.disk_count:
                return peg
        return None

    @property
    def minimum_moves(self) -> int:
        return (1 << self.disk_count) - 1

    @staticmethod
    def _validate_disk_count(disk_count: int) -> None:
        if disk_count < MIN_DISKS or disk_count > MAX_DISKS:
            raise ValueError(f"Disk count must be between {MIN_DISKS} and {MAX_DISKS}.")

    @staticmethod
    def _validate_peg(peg: int) -> None:
        if peg < 0 or peg >= PEG_COUNT:
            raise ValueError(f"Peg index must be between 0 and {PEG_COUNT - 1}.")
