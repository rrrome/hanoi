from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable, List, Optional, Sequence, Tuple


MIN_DISKS = 2
MAX_DISKS = 10
DEFAULT_DISKS = 7
PEG_COUNT = 3


Move = Tuple[int, int, int]
SolutionMove = Tuple[int, int]


def validate_disk_count(disk_count: int) -> None:
    if disk_count < MIN_DISKS or disk_count > MAX_DISKS:
        raise ValueError(f"Disk count must be between {MIN_DISKS} and {MAX_DISKS}.")


def validate_peg(peg: int) -> None:
    if peg < 0 or peg >= PEG_COUNT:
        raise ValueError(f"Peg index must be between 0 and {PEG_COUNT - 1}.")


def validate_target_pegs(target_pegs: Iterable[int]) -> Tuple[int, ...]:
    normalized = tuple(sorted(set(target_pegs)))
    if not normalized:
        raise ValueError("At least one target peg is required.")
    for peg in normalized:
        validate_peg(peg)
    return normalized


def validate_pegs(pegs: Sequence[Sequence[int]], disk_count: int) -> List[List[int]]:
    validate_disk_count(disk_count)
    if len(pegs) != PEG_COUNT:
        raise ValueError(f"Expected {PEG_COUNT} pegs.")

    seen: list[int] = []
    normalized: List[List[int]] = []
    for peg in pegs:
        peg_disks = [int(disk) for disk in peg]
        for lower, upper in zip(peg_disks, peg_disks[1:]):
            if lower < upper:
                raise ValueError("Each peg must be ordered from larger disks to smaller disks.")
        seen.extend(peg_disks)
        normalized.append(peg_disks)

    expected = list(range(1, disk_count + 1))
    if sorted(seen) != expected:
        raise ValueError(f"Board must contain every disk from 1 to {disk_count} exactly once.")

    return normalized


def build_minimum_solution(
    disk_count: int,
    source: int = 0,
    target: int = 2,
    auxiliary: int = 1,
) -> List[SolutionMove]:
    validate_disk_count(disk_count)
    validate_peg(source)
    validate_peg(target)
    validate_peg(auxiliary)

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


def build_solution_from_state(pegs: Sequence[Sequence[int]], target: int) -> List[SolutionMove]:
    validate_peg(target)
    disk_count = sum(len(peg) for peg in pegs)
    validate_disk_count(disk_count)
    board = validate_pegs(pegs, disk_count)
    positions = _disk_positions(board, disk_count)
    moves: List[SolutionMove] = []

    def solve(max_disk: int, destination: int) -> None:
        if max_disk == 0:
            return

        source = positions[max_disk]
        if source == destination:
            solve(max_disk - 1, destination)
            return

        spare = _other_peg(source, destination)
        solve(max_disk - 1, spare)
        moves.append((source, destination))
        positions[max_disk] = destination
        solve(max_disk - 1, destination)

    solve(disk_count, target)
    return moves


def _disk_positions(pegs: Sequence[Sequence[int]], disk_count: int) -> dict[int, int]:
    positions: dict[int, int] = {}
    for peg_index, peg in enumerate(pegs):
        for disk in peg:
            positions[disk] = peg_index
    if len(positions) != disk_count:
        raise ValueError("Board has duplicate or missing disks.")
    return positions


def _other_peg(first: int, second: int) -> int:
    return next(peg for peg in range(PEG_COUNT) if peg not in (first, second))


@dataclass
class HanoiGame:
    disk_count: int = DEFAULT_DISKS
    initial_peg: int = 0
    target_pegs: Tuple[int, ...] = (1, 2)
    pegs: List[List[int]] = field(default_factory=list)
    move_count: int = 0
    history: List[Move] = field(default_factory=list)

    def __post_init__(self) -> None:
        self.reset(self.disk_count, self.initial_peg, self.target_pegs)

    def reset(
        self,
        disk_count: Optional[int] = None,
        initial_peg: Optional[int] = None,
        target_pegs: Optional[Iterable[int]] = None,
    ) -> None:
        if disk_count is not None:
            validate_disk_count(disk_count)
            self.disk_count = disk_count
        if initial_peg is not None:
            validate_peg(initial_peg)
            self.initial_peg = initial_peg
        if target_pegs is not None:
            self.target_pegs = validate_target_pegs(target_pegs)

        if self.initial_peg in self.target_pegs:
            raise ValueError("Initial peg cannot also be a target peg.")

        self.pegs = [[] for _ in range(PEG_COUNT)]
        self.pegs[self.initial_peg] = list(range(self.disk_count, 0, -1))
        self.move_count = 0
        self.history = []

    def load_state(self, pegs: Sequence[Sequence[int]], target_pegs: Iterable[int]) -> None:
        disk_count = sum(len(peg) for peg in pegs)
        self.disk_count = disk_count
        self.pegs = validate_pegs(pegs, disk_count)
        self.target_pegs = validate_target_pegs(target_pegs)
        self.initial_peg = self._infer_initial_peg()
        self.move_count = 0
        self.history = []

    def move(self, source: int, target: int) -> bool:
        validate_peg(source)
        validate_peg(target)

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

    def move_any_disk(self, disk: int, target: int) -> bool:
        validate_peg(target)
        if disk < 1 or disk > self.disk_count:
            raise ValueError(f"Disk must be between 1 and {self.disk_count}.")

        source = self.disk_location(disk)
        if source == target:
            return False

        source_stack = self.pegs[source]
        source_stack.remove(disk)
        target_stack = self.pegs[target]
        insert_at = next(
            (index for index, target_disk in enumerate(target_stack) if target_disk < disk),
            len(target_stack),
        )
        target_stack.insert(insert_at, disk)
        return True

    def disk_location(self, disk: int) -> int:
        for peg_index, peg in enumerate(self.pegs):
            if disk in peg:
                return peg_index
        raise ValueError(f"Disk {disk} is not on the board.")

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
        return any(len(self.pegs[peg]) == self.disk_count for peg in self.target_pegs)

    @property
    def completion_peg(self) -> Optional[int]:
        for peg in self.target_pegs:
            if len(self.pegs[peg]) == self.disk_count:
                return peg
        return None

    @property
    def minimum_moves(self) -> int:
        return (1 << self.disk_count) - 1

    def snapshot(self) -> List[List[int]]:
        return [peg.copy() for peg in self.pegs]

    def _infer_initial_peg(self) -> int:
        for peg_index, peg in enumerate(self.pegs):
            if len(peg) == self.disk_count:
                return peg_index
        return 0
