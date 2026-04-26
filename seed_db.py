"""Load project_seed.yaml into the context database safely."""

from __future__ import annotations

import sqlite3
from pathlib import Path

import yaml

from db_setup import DB_PATH, initialize_database


ROOT = Path(__file__).resolve().parent
SEED_PATH = ROOT / "project_seed.yaml"


def dump_yaml(value: object) -> str:
    return yaml.safe_dump(value, sort_keys=True, allow_unicode=False)


def seed_database(seed_path: Path = SEED_PATH, db_path: Path = DB_PATH) -> None:
    initialize_database(db_path)
    seed = yaml.safe_load(seed_path.read_text(encoding="utf-8")) or {}
    project = seed.get("project") or {}
    session_name = project.get("name") or "Main Project"
    summary = project.get("summary") or ""

    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA foreign_keys=ON;")
        conn.execute("INSERT OR IGNORE INTO Sessions(session_name) VALUES (?);", (session_name,))
        session_id = conn.execute("SELECT id FROM Sessions WHERE session_name = ?;", (session_name,)).fetchone()[0]
        exists = conn.execute(
            """
            SELECT 1 FROM Messages
            WHERE session_id = ? AND agent_role = 'system' AND role = 'system' AND content = ?
            LIMIT 1;
            """,
            (session_id, summary),
        ).fetchone()
        if summary and not exists:
            conn.execute(
                """
                INSERT INTO Messages(session_id, agent_role, role, content, token_count)
                VALUES (?, 'system', 'system', ?, 0);
                """,
                (session_id, summary),
            )
        for task in seed.get("initial_tasks") or []:
            domain = str(task.get("domain") or "").strip()
            status = str(task.get("status") or "pending").strip()
            payload_yaml = dump_yaml(task.get("payload") or {})
            if domain and payload_yaml.strip():
                conn.execute(
                    "INSERT OR IGNORE INTO Tasks(domain, status, payload_yaml) VALUES (?, ?, ?);",
                    (domain, status, payload_yaml),
                )


def main() -> None:
    seed_database()
    print("seeded context/context.db")


if __name__ == "__main__":
    main()
