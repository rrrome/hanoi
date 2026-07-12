import unittest
import time

from hanoi_game import HanoiGame, MAX_DISKS, MIN_DISKS, build_minimum_solution
from main import GameSession


class HanoiGameTest(unittest.TestCase):
    def test_reset_uses_requested_disk_count(self) -> None:
        game = HanoiGame(5)

        self.assertEqual(game.pegs, [[5, 4, 3, 2, 1], [], []])
        self.assertEqual(game.move_count, 0)
        self.assertEqual(game.minimum_moves, 31)

    def test_rejects_disk_counts_outside_supported_range(self) -> None:
        for count in (MIN_DISKS - 1, MAX_DISKS + 1):
            with self.assertRaises(ValueError):
                HanoiGame(count)

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

    def test_completion_accepts_all_disks_on_second_peg(self) -> None:
        game = HanoiGame(2)

        self.assertTrue(game.move(0, 2))
        self.assertTrue(game.move(0, 1))
        self.assertFalse(game.is_complete)
        self.assertTrue(game.move(2, 1))
        self.assertTrue(game.is_complete)
        self.assertEqual(game.completion_peg, 1)

    def test_completion_accepts_all_disks_on_third_peg(self) -> None:
        game = HanoiGame(2)

        self.assertTrue(game.move(0, 1))
        self.assertTrue(game.move(0, 2))
        self.assertFalse(game.is_complete)
        self.assertTrue(game.move(1, 2))
        self.assertTrue(game.is_complete)
        self.assertEqual(game.completion_peg, 2)

    def test_session_timer_freezes_after_completion(self) -> None:
        session = GameSession(2)
        session.start_time = time.monotonic() - 42

        session.move(0, 2)
        session.move(0, 1)
        state = session.move(2, 1)
        frozen_elapsed = state["elapsed_seconds"]

        time.sleep(0.02)
        self.assertTrue(state["is_complete"])
        self.assertEqual(state["completion_peg"], 1)
        self.assertEqual(state["message_key"], "completeOnPeg")
        self.assertEqual(state["message_args"], {"peg": 2})
        self.assertEqual(session.state()["elapsed_seconds"], frozen_elapsed)

    def test_minimum_solution_has_expected_moves(self) -> None:
        self.assertEqual(build_minimum_solution(2), [(0, 1), (0, 2), (1, 2)])
        self.assertEqual(len(build_minimum_solution(4)), 15)

    def test_demo_mode_steps_block_manual_moves_and_restore_play_state(self) -> None:
        session = GameSession(3)
        self.assertTrue(session.move(0, 1))
        original_pegs = [peg.copy() for peg in session.game.pegs]

        state = session.start_demo(2)
        self.assertTrue(state["is_demo"])
        self.assertEqual(state["demo_total_steps"], 3)
        self.assertEqual(state["elapsed_seconds"], 0)
        self.assertEqual(state["message_key"], "demoStarted")
        self.assertEqual(state["message_args"], {"total": 3})

        blocked = session.move(0, 1)
        self.assertTrue(blocked["is_demo"])
        self.assertEqual(blocked["move_count"], 0)
        self.assertEqual(blocked["pegs"], [[2, 1], [], []])

        first_step = session.demo_next()
        self.assertEqual(first_step["demo_step"], 1)
        self.assertEqual(first_step["pegs"], [[2], [1], []])

        second_step = session.demo_next()
        self.assertEqual(second_step["demo_step"], 2)
        self.assertEqual(second_step["pegs"], [[], [1], [2]])

        previous_step = session.demo_previous()
        self.assertEqual(previous_step["demo_step"], 1)
        self.assertEqual(previous_step["pegs"], [[2], [1], []])

        restored = session.exit_demo()
        self.assertFalse(restored["is_demo"])
        self.assertEqual(restored["move_count"], 1)
        self.assertEqual(restored["pegs"], original_pegs)

    def test_demo_mode_can_reach_final_step(self) -> None:
        session = GameSession(2)
        session.start_demo(2)

        session.demo_next()
        session.demo_next()
        state = session.demo_next()

        self.assertTrue(state["is_demo"])
        self.assertTrue(state["is_complete"])
        self.assertEqual(state["completion_peg"], 2)
        self.assertEqual(state["demo_step"], state["demo_total_steps"])

    def test_demo_mode_can_jump_to_any_step(self) -> None:
        session = GameSession(2)
        session.start_demo(2)

        middle = session.demo_jump(2)
        self.assertEqual(middle["demo_step"], 2)
        self.assertEqual(middle["pegs"], [[], [1], [2]])

        final = session.demo_jump(3)
        self.assertTrue(final["is_complete"])
        self.assertEqual(final["demo_step"], 3)
        self.assertEqual(final["pegs"], [[], [], [2, 1]])

        start = session.demo_jump(0)
        self.assertFalse(start["is_complete"])
        self.assertEqual(start["demo_step"], 0)
        self.assertEqual(start["pegs"], [[2, 1], [], []])

        with self.assertRaises(ValueError):
            session.demo_jump(4)


if __name__ == "__main__":
    unittest.main()
