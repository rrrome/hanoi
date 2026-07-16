import time
import unittest

from hanoi_game import (
    HanoiGame,
    MAX_DISKS,
    MIN_DISKS,
    build_minimum_solution,
    build_solution_from_state,
)
from hanoi_session import GameSession


class HanoiGameTest(unittest.TestCase):
    def test_reset_uses_requested_disk_count_and_initial_peg(self) -> None:
        game = HanoiGame(5, initial_peg=2, target_pegs=(0, 1))

        self.assertEqual(game.pegs, [[], [], [5, 4, 3, 2, 1]])
        self.assertEqual(game.move_count, 0)
        self.assertEqual(game.minimum_moves, 31)

    def test_minimum_disk_game_is_supported(self) -> None:
        game = HanoiGame(2, initial_peg=0, target_pegs=(2,))

        self.assertEqual(game.pegs, [[2, 1], [], []])
        self.assertEqual(game.minimum_moves, 3)
        self.assertEqual(build_minimum_solution(2), [(0, 1), (0, 2), (1, 2)])

    def test_rejects_disk_counts_outside_supported_range(self) -> None:
        for count in (MIN_DISKS - 1, MAX_DISKS + 1):
            with self.assertRaises(ValueError):
                HanoiGame(count)

    def test_rejects_initial_target_conflict(self) -> None:
        with self.assertRaises(ValueError):
            HanoiGame(3, initial_peg=1, target_pegs=(1, 2))

    def test_valid_move_increments_count_and_history(self) -> None:
        game = HanoiGame(3)

        self.assertTrue(game.move(0, 1))
        self.assertEqual(game.pegs, [[3, 2], [1], []])
        self.assertEqual(game.move_count, 1)

    def test_invalid_move_does_not_increment_count(self) -> None:
        game = HanoiGame(3)

        self.assertTrue(game.move(0, 1))
        self.assertFalse(game.move(0, 1))
        self.assertEqual(game.pegs, [[3, 2], [1], []])
        self.assertEqual(game.move_count, 1)

    def test_undo_reverts_last_move_and_removes_step(self) -> None:
        game = HanoiGame(3)
        game.move(0, 1)
        game.move(0, 2)

        self.assertTrue(game.undo())
        self.assertEqual(game.pegs, [[3, 2], [1], []])
        self.assertEqual(game.move_count, 1)

    def test_completion_accepts_configured_target_pegs(self) -> None:
        game = HanoiGame(2, initial_peg=0, target_pegs=(1,))

        self.assertTrue(game.move(0, 2))
        self.assertTrue(game.move(0, 1))
        self.assertFalse(game.is_complete)
        self.assertTrue(game.move(2, 1))
        self.assertTrue(game.is_complete)
        self.assertEqual(game.completion_peg, 1)

    def test_minimum_solution_has_expected_moves(self) -> None:
        self.assertEqual(build_minimum_solution(2), [(0, 1), (0, 2), (1, 2)])
        self.assertEqual(len(build_minimum_solution(4)), 15)

    def test_solution_from_arbitrary_state_is_minimal(self) -> None:
        self.assertEqual(build_solution_from_state([[2], [1], []], 2), [(0, 2), (1, 2)])


class GameSessionTest(unittest.TestCase):
    def test_session_starts_on_home(self) -> None:
        session = GameSession()

        state = session.state()

        self.assertEqual(state["mode"], "home")
        self.assertTrue(state["is_home"])
        self.assertEqual(state["disk_count"], 7)

    def test_start_play_uses_config_and_freezes_timer_on_completion(self) -> None:
        session = GameSession()
        state = session.start_play(2, 0, (1,))
        session.start_time = time.monotonic() - 42

        self.assertEqual(state["mode"], "play")
        self.assertEqual(state["target_pegs"], [1])
        session.move(0, 2)
        session.move(0, 1)
        complete = session.move(2, 1)
        frozen_elapsed = complete["elapsed_seconds"]

        time.sleep(0.02)
        self.assertTrue(complete["is_complete"])
        self.assertEqual(complete["completion_peg"], 1)
        self.assertEqual(complete["message_key"], "completeOnPeg")
        self.assertEqual(complete["message_args"], {"peg": 2})
        self.assertEqual(session.state()["elapsed_seconds"], frozen_elapsed)

    def test_start_play_rejects_initial_target_conflict(self) -> None:
        session = GameSession()

        with self.assertRaises(ValueError):
            session.start_play(3, 1, (1, 2))

    def test_demo_mode_can_jump_to_any_step(self) -> None:
        session = GameSession()
        session.start_demo(2, 0, 2)

        middle = session.guide_jump(2)
        self.assertEqual(middle["guide_step"], 2)
        self.assertEqual(middle["pegs"], [[], [1], [2]])

        final = session.guide_jump(3)
        self.assertTrue(final["is_complete"])
        self.assertEqual(final["guide_step"], 3)
        self.assertEqual(final["pegs"], [[], [], [2, 1]])

        start = session.guide_jump(0)
        self.assertFalse(start["is_complete"])
        self.assertEqual(start["guide_step"], 0)
        self.assertEqual(start["pegs"], [[2, 1], [], []])

        with self.assertRaises(ValueError):
            session.guide_jump(4)

    def test_solver_setup_inserts_disks_into_legal_stack_position(self) -> None:
        session = GameSession()
        session.start_solver_setup(3, 0, 2)

        moved = session.move_setup_disk(2, 2)
        self.assertEqual(moved["message_key"], "setupMoveSucceeded")
        self.assertEqual(moved["pegs"], [[3, 1], [], [2]])

        inserted = session.move_setup_disk(3, 2)
        self.assertEqual(inserted["message_key"], "setupMoveSucceeded")
        self.assertEqual(inserted["pegs"], [[1], [], [3, 2]])

    def test_solver_starts_from_custom_state(self) -> None:
        session = GameSession()
        session.start_solver_setup(2, 0, 2)
        session.move_setup_disk(1, 1)

        state = session.start_solver()

        self.assertEqual(state["mode"], "solver")
        self.assertEqual(state["guide_total_steps"], 2)
        self.assertEqual(state["pegs"], [[2], [1], []])
        final = session.guide_jump(2)
        self.assertTrue(final["is_complete"])
        self.assertEqual(final["pegs"], [[], [], [2, 1]])


if __name__ == "__main__":
    unittest.main()
