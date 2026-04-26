"""Run specialized agents with static Markdown context and SQLite memory."""

from __future__ import annotations

import argparse
import os
import sqlite3
from pathlib import Path
from typing import Any

import tiktoken
import yaml
from dotenv import load_dotenv

from db_setup import initialize_database


ROOT = Path(__file__).resolve().parent
CONFIG_PATH = ROOT / "agent_config.yaml"
CONTEXT_DIR = ROOT / "context"


def load_config(path: Path = CONFIG_PATH) -> dict[str, Any]:
    load_dotenv(ROOT / ".env")
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def database_path(config: dict[str, Any]) -> Path:
    return ROOT / (config.get("defaults", {}).get("database_path") or "context/context.db")


def session_id(conn: sqlite3.Connection, name: str) -> int:
    conn.execute("INSERT OR IGNORE INTO Sessions(session_name) VALUES (?);", (name,))
    return conn.execute("SELECT id FROM Sessions WHERE session_name = ?;", (name,)).fetchone()[0]


def count_tokens(text: str, model: str = "gpt-4o") -> int:
    enc = tokenizer(model)
    if enc is None:
        return max(1, len(text) // 4)
    return len(enc.encode(text))


def tokenizer(model: str) -> Any | None:
    try:
        return tiktoken.encoding_for_model(model)
    except Exception:
        try:
            return tiktoken.get_encoding("cl100k_base")
        except Exception:
            return None


def truncate_tokens(text: str, limit: int, model: str) -> str:
    if limit <= 0:
        return ""
    enc = tokenizer(model)
    if enc is None:
        return text[: limit * 4]
    return enc.decode(enc.encode(text)[:limit])


def xml_block(tag: str, content: str) -> str:
    return f"<{tag}>\n{content.strip()}\n</{tag}>"


def static_context(agent: dict[str, Any]) -> str:
    parts = []
    for file_name in agent.get("context_files") or []:
        path = CONTEXT_DIR / file_name
        if path.exists():
            parts.append(f"<file name=\"{file_name}\">\n{path.read_text(encoding='utf-8').strip()}\n</file>")
    return xml_block("static_context", "\n\n".join(parts))


def recent_history(conn: sqlite3.Connection, sid: int, limit: int) -> str:
    rows = conn.execute(
        """
        SELECT agent_role, role, content, timestamp FROM Messages
        WHERE session_id = ?
        ORDER BY timestamp DESC, id DESC
        LIMIT ?;
        """,
        (sid, limit),
    ).fetchall()
    items = [
        f"<message agent=\"{agent}\" role=\"{role}\" timestamp=\"{timestamp}\">\n{content}\n</message>"
        for agent, role, content, timestamp in reversed(rows)
    ]
    return xml_block("recent_history", "\n".join(items))


def retrieved_context(conn: sqlite3.Connection, keyword: str, limit: int = 8) -> str:
    if not keyword:
        return xml_block("retrieved_context", "")
    query = f'"{keyword.replace(chr(34), chr(34) * 2)}"'
    rows = conn.execute(
        """
        SELECT Messages.agent_role, Messages.role, Messages.content, Messages.timestamp
        FROM Messages_fts
        JOIN Messages ON Messages_fts.rowid = Messages.id
        WHERE Messages_fts MATCH ?
        ORDER BY rank
        LIMIT ?;
        """,
        (query, limit),
    ).fetchall()
    items = [
        f"<message agent=\"{agent}\" role=\"{role}\" timestamp=\"{timestamp}\">\n{content}\n</message>"
        for agent, role, content, timestamp in rows
    ]
    return xml_block("retrieved_context", "\n".join(items))



def detect_intent(user_prompt: str) -> str | None:
    triggers = [
        "what are your thoughts",
        "how should we approach",
        "can we plan",
        "what is the best way to",
        "architectural review",
        "think about",
        "what do you think"
    ]
    prompt_lower = user_prompt.lower()
    for trigger in triggers:
        if trigger in prompt_lower:
            return "planner_agent"
    return None

def build_prompt(
    conn: sqlite3.Connection,
    config: dict[str, Any],
    agent_name: str,
    session_name: str,
    user_prompt: str,
    keyword: str = "",
) -> tuple[str, dict[str, Any], int]:
    agent = config["agents"][agent_name]
    defaults = config.get("defaults", {})
    sid = session_id(conn, session_name)
    prompt = fit_prompt(
        static_context(agent),
        retrieved_context(conn, keyword),
        recent_history(conn, sid, int(defaults.get("memory_window") or 20)),
        user_prompt,
        agent["model"],
        int(defaults.get("max_prompt_tokens") or 120000),
    )
    return prompt, agent, sid


def fit_prompt(static: str, retrieved: str, history: str, user_prompt: str, model: str, max_tokens: int) -> str:
    user = xml_block("user_request", user_prompt)
    parts = [static, retrieved, history, user]
    total = count_tokens("\n\n".join(parts), model)
    if total <= max_tokens:
        return "\n\n".join(parts)

    static_user_tokens = count_tokens("\n\n".join([static, user]), model)
    budget = max(max_tokens - static_user_tokens, 0)
    retrieved_budget = budget // 3
    history_budget = budget - retrieved_budget
    retrieved = xml_block("retrieved_context", truncate_tokens(retrieved, retrieved_budget, model))
    history = xml_block("recent_history", truncate_tokens(history, history_budget, model))
    prompt = "\n\n".join([static, retrieved, history, user])
    if count_tokens(prompt, model) <= max_tokens:
        return prompt
    return "\n\n".join([static, xml_block("retrieved_context", ""), xml_block("recent_history", ""), user])


def log_message(conn: sqlite3.Connection, sid: int, agent: str, role: str, content: str, tokens: int) -> None:
    conn.execute(
        """
        INSERT INTO Messages(session_id, agent_role, role, content, token_count)
        VALUES (?, ?, ?, ?, ?);
        """,
        (sid, agent, role, content, tokens),
    )


def prune_session(conn: sqlite3.Connection, sid: int, threshold: int = 500) -> int:
    count = conn.execute("SELECT COUNT(*) FROM Messages WHERE session_id = ?;", (sid,)).fetchone()[0]
    excess = max(count - threshold, 0)
    if not excess:
        return 0
    rows = conn.execute(
        """
        SELECT id FROM Messages
        WHERE session_id = ? AND role != 'system'
        ORDER BY timestamp ASC, id ASC
        LIMIT ?;
        """,
        (sid, excess),
    ).fetchall()
    ids = [row[0] for row in rows]
    if not ids:
        return 0
    placeholders = ",".join("?" for _ in ids)
    conn.execute(
        f"""
        INSERT OR IGNORE INTO Archived_Messages(id, session_id, agent_role, role, content, timestamp, token_count)
        SELECT id, session_id, agent_role, role, content, timestamp, token_count
        FROM Messages WHERE id IN ({placeholders});
        """,
        ids,
    )
    conn.execute(f"DELETE FROM Messages WHERE id IN ({placeholders});", ids)
    return len(ids)


def call_anthropic(agent: dict[str, Any], prompt: str) -> tuple[str, int, int]:
    from anthropic import Anthropic

    client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    static_end = prompt.find("</static_context>") + len("</static_context>")
    static = prompt[:static_end]
    rest = prompt[static_end:].strip()
    response = client.messages.create(
        model=agent["model"],
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": static, "cache_control": {"type": "ephemeral"}},
                    {"type": "text", "text": rest},
                ],
            }
        ],
    )
    text = "".join(block.text for block in response.content if getattr(block, "type", "") == "text")
    return text, int(response.usage.input_tokens), int(response.usage.output_tokens)


def call_openai(agent: dict[str, Any], prompt: str) -> tuple[str, int, int]:
    from openai import OpenAI

    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    response = client.responses.create(model=agent["model"], input=prompt)
    usage = response.usage
    return response.output_text, int(usage.input_tokens), int(usage.output_tokens)


def run_agent(agent_name: str, user_prompt: str, keyword: str = "") -> str:
    config = load_config()
    db_path = initialize_database(database_path(config))
    session_name = config.get("defaults", {}).get("session_name") or "Main Project"
    
    # Fast Intent Routing Check
    routed_agent = detect_intent(user_prompt)
    if routed_agent and routed_agent in config.get("agents", {}):
        print(f"\n[Router] Intercepted planning intent. Routing away from '{agent_name}' to '{routed_agent}'.\n")
        agent_name = routed_agent

    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA foreign_keys=ON;")
        prompt, agent, sid = build_prompt(conn, config, agent_name, session_name, user_prompt, keyword)
        log_message(conn, sid, agent_name, "user", user_prompt, count_tokens(user_prompt, agent["model"]))
        if agent.get("provider") == "anthropic":
            text, input_tokens, output_tokens = call_anthropic(agent, prompt)
        else:
            text, input_tokens, output_tokens = call_openai(agent, prompt)
        log_message(conn, sid, agent_name, "assistant", text, input_tokens + output_tokens)
        prune_session(conn, sid, int(config.get("defaults", {}).get("prune_threshold") or 500))
        return text


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("agent")
    parser.add_argument("prompt")
    parser.add_argument("--keyword", default="")
    args = parser.parse_args()
    print(run_agent(args.agent, args.prompt, args.keyword))


if __name__ == "__main__":
    main()