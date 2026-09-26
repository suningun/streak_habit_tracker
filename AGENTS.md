# AGENTS.md

## Overview

OpenCode agents in this repo. No `opencode.json(c)` and no `.opencode/agents/` exist here (verified), so there are **no project-specific agents or permission overrides** — everything below is OpenCode's built-in default. Re-verify against the docs if config is ever added.

Built-in agents:

| Agent | Mode | Use for |
| --- | --- | --- |
| `build` | primary | Default. Implementing changes, fixing bugs, writing tests. |
| `plan` | primary | Read-only investigation and scoping. Denies edits except under `~/.opencode/plan`. |
| `general` | subagent | Research and multi-step execution with broad tool access. **Cannot launch other subagents**, and cannot ask you questions. |
| `explore` | subagent | Search and read code or web sources. Cannot edit files. |

A subagent runs in a fresh child session. A custom subagent uses **its own** permissions, not a subset of the parent's.

## Default System Settings

`build` and `plan` are the two primary agents — `shift+tab` cycles between them. `default_agent` in config changes the initial pick; the fallback order is `build`, then the first visible primary-capable agent.

## Permissions Summary

The real base policy applied to every agent, including custom ones:

| Action | Resource | Effect |
| --- | --- | --- |
| `*` | `*` | **allow** |
| `external_directory` | `*` | ask |
| `read` | `*.env` | ask |
| `read` | `*.env.*` | ask |
| `read` | `*.env.example` | allow |

Shipped agents append: `build` allows questions; `plan` allows questions and denies edits except `~/.opencode/plan`; `general` denies questions and subagent launching; `explore` denies everything except `read`/`glob`/`grep`/`webfetch`/`websearch`; `title` and `summary` deny all actions.

Two things worth internalizing:

- **There are no default limits on shell or edits.** Shell is not gated by default — the "ask before every bash command" behavior is a config choice, not the baseline. Same for VCS writes and destructive commands. If this repo ever wants that, it must be added explicitly:

  ```jsonc
  { "permissions": [
    { "action": "shell", "resource": "*", "effect": "ask" },
    { "action": "shell", "resource": "git status *", "effect": "allow" },
    { "action": "shell", "resource": "git push *", "effect": "deny" },
  ] }
  ```

- **V2 uses `shell`, not `bash`.** The action is `shell` (`bash` and `permission` are V1 names). Last matching rule wins, so broad rules go first. Unmatched actions fall back to `ask`.

## Developer Cheatsheet

Leader key is `ctrl+x` by default — press it, then the second key, within the leader timeout.

| Keys | Action |
| --- | --- |
| `shift+tab` | Next agent (cycles `build` ↔ `plan`) |
| `ctrl+x` `a` | List agents |
| `ctrl+p` | Command palette |
| `esc` | Interrupt current session |
| `ctrl+x` `b` | Toggle sidebar |
| `ctrl+x` `l` | List sessions · `ctrl+x` `n` new session |
| `ctrl+x` `c` | Compact session |
| `ctrl+x` `m` | List models · `ctrl+t` cycle model variants |
| `ctrl+x` `t` | Switch theme · `ctrl+x` `e` external editor |
| `ctrl+x` `g` | Session timeline |
| `ctrl+x` `q` | Quit |
| `ctrl+alt+k` | Which-key panel (shows remaining bindings) |

Unbound by default: `permission.mode` (auto-approve toggle), `help.show`, `docs.open`, `mcp.list`. Bind them in `cli.json` if wanted.

Note: `tab` is autocomplete-complete / worktree-name-generate, **not** a mode switch. `ctrl+b` backgrounds the session; the sidebar is `ctrl+x` `b`.
