"""Initialize the SQLite context database idempotently."""

from __future__ import annotations

import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "context" / "context.db"


SCHEMA = """
CREATE TABLE IF NOT EXISTS Sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    agent_role TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    token_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (session_id) REFERENCES Sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Archived_Messages (
    id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL,
    agent_role TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    token_count INTEGER NOT NULL DEFAULT 0,
    archived_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,
    status TEXT NOT NULL,
    payload_yaml TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(domain, payload_yaml)
);

CREATE INDEX IF NOT EXISTS idx_messages_session_time ON Messages(session_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_tasks_domain_status ON Tasks(domain, status);

CREATE VIRTUAL TABLE IF NOT EXISTS Messages_fts USING fts5(
    content,
    content='Messages',
    content_rowid='id',
    tokenize='porter'
);

CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON Messages BEGIN
    INSERT INTO Messages_fts(rowid, content) VALUES (new.id, new.content);
END;

CREATE TRIGGER IF NOT EXISTS messages_ad AFTER DELETE ON Messages BEGIN
    INSERT INTO Messages_fts(Messages_fts, rowid, content) VALUES ('delete', old.id, old.content);
END;

CREATE TRIGGER IF NOT EXISTS messages_au AFTER UPDATE ON Messages BEGIN
    INSERT INTO Messages_fts(Messages_fts, rowid, content) VALUES ('delete', old.id, old.content);
    INSERT INTO Messages_fts(rowid, content) VALUES (new.id, new.content);
END;
"""


def initialize_database(db_path: Path = DB_PATH) -> Path:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA cache_size=-64000;")
        conn.execute("PRAGMA foreign_keys=ON;")
        conn.executescript(SCHEMA)
        conn.execute("INSERT INTO Messages_fts(Messages_fts) VALUES ('rebuild');")
    return db_path


def main() -> None:
    print(f"initialized {initialize_database().relative_to(ROOT)}")


if __name__ == "__main__":
    main()
