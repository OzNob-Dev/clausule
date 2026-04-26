from __future__ import annotations

import sqlite3
import sys
import unittest
import json
from pathlib import Path
from tempfile import TemporaryDirectory

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from agent_runner import fit_prompt, prune_session
from db_setup import initialize_database
from seed_db import seed_database
from setup_context import scaffold


class ContextSystemTest(unittest.TestCase):
    def test_scaffold_preserves_existing_files_and_gitignore(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / ".env").write_text("KEEP=1\n", encoding="utf-8")
            (root / ".gitignore").write_text("node_modules/\n", encoding="utf-8")
            scaffold(root)
            scaffold(root)
            self.assertEqual((root / ".env").read_text(encoding="utf-8"), "KEEP=1\n")
            self.assertEqual((root / ".gitignore").read_text(encoding="utf-8").splitlines().count(".env"), 1)
            self.assertTrue((root / "context" / "global_rules.md").exists())

    def test_database_is_idempotent_and_fts_tracks_messages(self) -> None:
        with TemporaryDirectory() as tmp:
            db = Path(tmp) / "context.db"
            initialize_database(db)
            initialize_database(db)
            with sqlite3.connect(db) as conn:
                conn.execute("INSERT INTO Sessions(session_name) VALUES ('Main Project');")
                sid = conn.execute("SELECT id FROM Sessions WHERE session_name = 'Main Project';").fetchone()[0]
                conn.execute(
                    "INSERT INTO Messages(session_id, agent_role, role, content) VALUES (?, 'backend_agent', 'user', 'secure sqlite context');",
                    (sid,),
                )
                row = conn.execute("SELECT content FROM Messages_fts WHERE Messages_fts MATCH 'secur';").fetchone()
                self.assertEqual(row[0], "secure sqlite context")

    def test_seed_database_avoids_duplicate_summary_and_tasks(self) -> None:
        with TemporaryDirectory() as tmp:
            root = Path(tmp)
            db = root / "context.db"
            seed = root / "project_seed.yaml"
            seed.write_text(
                yaml.safe_dump(
                    {
                        "project": {"name": "Main Project", "summary": "A compact agent system."},
                        "initial_tasks": [{"domain": "backend", "status": "pending", "payload": {"title": "Init"}}],
                    }
                ),
                encoding="utf-8",
            )
            seed_database(seed, db)
            seed_database(seed, db)
            with sqlite3.connect(db) as conn:
                self.assertEqual(conn.execute("SELECT COUNT(*) FROM Messages;").fetchone()[0], 1)
                self.assertEqual(conn.execute("SELECT COUNT(*) FROM Tasks;").fetchone()[0], 1)

    def test_prompt_fit_preserves_static_context(self) -> None:
        prompt = fit_prompt(
            "<static_context>must stay intact</static_context>",
            "<retrieved_context>" + "x " * 1000 + "</retrieved_context>",
            "<recent_history>" + "y " * 1000 + "</recent_history>",
            "finish",
            "gpt-4o",
            40,
        )
        self.assertIn("<static_context>must stay intact</static_context>", prompt)
        self.assertIn("<user_request>", prompt)

    def test_prune_archives_oldest_non_system_messages(self) -> None:
        with TemporaryDirectory() as tmp:
            db = Path(tmp) / "context.db"
            initialize_database(db)
            with sqlite3.connect(db) as conn:
                conn.execute("INSERT INTO Sessions(session_name) VALUES ('Main Project');")
                sid = conn.execute("SELECT id FROM Sessions WHERE session_name = 'Main Project';").fetchone()[0]
                conn.execute("INSERT INTO Messages(session_id, agent_role, role, content) VALUES (?, 'system', 'system', 'keep');", (sid,))
                for i in range(4):
                    conn.execute(
                        "INSERT INTO Messages(session_id, agent_role, role, content) VALUES (?, 'frontend_agent', 'user', ?);",
                        (sid, f"message {i}"),
                    )
                self.assertEqual(prune_session(conn, sid, 3), 2)
                self.assertEqual(conn.execute("SELECT COUNT(*) FROM Archived_Messages;").fetchone()[0], 2)
                self.assertEqual(conn.execute("SELECT COUNT(*) FROM Messages WHERE role = 'system';").fetchone()[0], 1)

    def test_vscode_runs_database_seed_on_folder_open(self) -> None:
        settings = json.loads((Path(__file__).resolve().parents[1] / ".vscode" / "settings.json").read_text(encoding="utf-8"))
        tasks = json.loads((Path(__file__).resolve().parents[1] / ".vscode" / "tasks.json").read_text(encoding="utf-8"))
        task = tasks["tasks"][0]
        self.assertEqual(settings["task.allowAutomaticTasks"], "on")
        self.assertEqual(task["runOptions"]["runOn"], "folderOpen")
        self.assertIn("db_setup.py", task["command"])
        self.assertIn("seed_db.py", task["command"])


if __name__ == "__main__":
    unittest.main()
