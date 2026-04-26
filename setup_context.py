"""Scaffold the multi-agent context system without overwriting user files."""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parent
CONTEXT_DIR = ROOT / "context"
DOMAIN_FILES = {
    "global_rules.md": "# Global Rules\n\n- Add shared operating rules here.\n",
    "design_system.md": "# Design System\n\n- Add design tokens, layout rules, and accessibility standards here.\n",
    "frontend_guidelines.md": "# Frontend Guidelines\n\n- Add UI engineering conventions here.\n",
    "backend_architecture.md": "# Backend Architecture\n\n- Add service, data, and reliability conventions here.\n",
    "security_policies.md": "# Security Policies\n\n- Add security, privacy, and key-handling policies here.\n",
}
AGENT_CONFIG = """agents:
  design_agent:
    provider: anthropic
    model: claude-sonnet-4-20250514
    context_files:
      - global_rules.md
      - design_system.md
  frontend_agent:
    provider: openai
    model: gpt-5.1-codex
    context_files:
      - global_rules.md
      - frontend_guidelines.md
  backend_agent:
    provider: openai
    model: gpt-5.1-codex
    context_files:
      - global_rules.md
      - backend_architecture.md
  security_agent:
    provider: anthropic
    model: claude-sonnet-4-20250514
    context_files:
      - global_rules.md
      - security_policies.md
defaults:
  database_path: context/context.db
  session_name: Main Project
  max_prompt_tokens: 120000
  memory_window: 20
  prune_threshold: 500
"""
PROJECT_SEED = """project:
  name: Main Project
  summary: Add the high-level project summary here.
initial_tasks:
  - domain: design
    status: pending
    payload:
      title: Define design direction
      details: Add design task details here.
  - domain: frontend
    status: pending
    payload:
      title: Build frontend shell
      details: Add frontend task details here.
  - domain: backend
    status: pending
    payload:
      title: Initialize backend context
      details: Add backend task details here.
  - domain: security
    status: pending
    payload:
      title: Review security posture
      details: Add security task details here.
"""
ENV_TEMPLATE = "ANTHROPIC_API_KEY=\nOPENAI_API_KEY=\n"
REQUIREMENTS = "pyyaml\npython-dotenv\nanthropic\nopenai\ntiktoken\n"


def write_missing(path: Path, content: str) -> str:
    if path.exists():
        return f"preserved {path.relative_to(ROOT)}"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"created {path.relative_to(ROOT)}"


def ensure_gitignore_entry(path: Path, entry: str) -> str:
    text = path.read_text(encoding="utf-8") if path.exists() else ""
    lines = {line.strip() for line in text.splitlines()}
    if entry in lines:
        return f"preserved {path.relative_to(ROOT)}"
    suffix = "" if not text or text.endswith("\n") else "\n"
    path.write_text(f"{text}{suffix}{entry}\n", encoding="utf-8")
    return f"updated {path.relative_to(ROOT)}"


def scaffold(root: Path = ROOT) -> list[str]:
    global ROOT, CONTEXT_DIR
    ROOT = root.resolve()
    CONTEXT_DIR = ROOT / "context"
    results = [write_missing(CONTEXT_DIR / name, content) for name, content in DOMAIN_FILES.items()]
    results.extend(
        [
            write_missing(ROOT / "agent_config.yaml", AGENT_CONFIG),
            write_missing(ROOT / "project_seed.yaml", PROJECT_SEED),
            write_missing(ROOT / ".env", ENV_TEMPLATE),
            write_missing(ROOT / "requirements.txt", REQUIREMENTS),
            ensure_gitignore_entry(ROOT / ".gitignore", ".env"),
        ]
    )
    return results


def main() -> None:
    for line in scaffold():
        print(line)


if __name__ == "__main__":
    main()
