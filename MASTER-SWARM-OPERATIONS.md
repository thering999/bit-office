# Master Swarm Operations: Bit-Office

This document outlines the architecture, capabilities, and operational protocols for the **Master Swarm Gateway**. The system is designed to orchestrate complex development tasks across the entire `D:\www` workspace using a fleet of autonomous, coordinated agents.

## 1. Master Gateway Paradigm

The Bit-Office Gateway acts as a central nervous system for all projects located in `D:\www`. Unlike a standard local agent, this gateway:
- **Workspace-Agnostic:** Can be tasked to manage any project directory within the mapped volume (e.g., `HDC_Data_Exchange_Plus`, `n8n-local-tools`, `openclaw`).
- **Cross-Platform Stable:** Automatically resolves pathing conflicts between the Windows host (`D:\www`) and the Linux container (`/app/workspace`).
- **Multi-Agent Coordination:** Dynamically spawns and delegates tasks to specialized agents (Claude Code, Gemini, Aider) with established leadership and review loops.

## 2. Autonomous Cognitive Suite

The swarm is equipped with a persistent memory and reasoning system:

### Vector Memory (`VectorMemory`)
- **Long-Term Context:** Powered by Qdrant and Gemini Embeddings.
- **Experience Recording:** Every significant event, code change, and decision is recorded as a vector.
- **Smart Retrieval:** Agents can "remember" how similar problems were solved in previous sessions or other projects.

### Consolidation Loop (`Consolidator`)
- **Knowledge Synthesis:** Runs every 5 minutes to analyze recent experiences.
- **Insight Generation:** Converts raw logs into high-level "Learnings" and "Insights" stored back in Vector Memory.

### Swarm Briefing & God's Eye View
- **Real-Time Telemetry:** Broadcasts agent activity every 10 seconds.
- **Mission Visibility:** Captures `lastLogLine` from active agents and streams it to the UI as `[Mission Briefing]` events.
- **Thought Stream Tooltips:** Interactive glassmorphic tooltips in the `SwarmNodeGraph` provide real-time cognitive feedback on agent reasoning.
- **Data Packet Animations:** Visual representation of information flow between agents in the swarm topology.

### Dynamic Swarm Assembly (Meta-Agent)
- **Task-Aware Scaling:** The Meta-Agent analyzes task complexity (files, tech stack, context) and automatically assembles an elite team of 1 to 5 specialized agents.
- **Meta-Swarm Monitoring:** Continuously monitors swarm health and triggers re-assembly if progress stalls or critical errors occur.

### Cost-Aware & Task-Specialized Routing
- **Smart Model Switching:** Dynamically routes tasks to the most efficient provider:
    - **UI/QA/Analysis:** `gemini` (Fast, low-cost)
    - **Complex Coding/Logic:** `claude` (High-performance)
    - **Thai Content:** `typhoon` (Optimized local support)
- **Multi-Key Rotation:** Seamlessly rotates through API keys to handle quota limits and ensure zero-downtime execution.

### Project Knowledge Base (NotebookLM Integration)
- **Autonomous Documentation:** The swarm now features a `KnowledgeManager` that automatically extracts `MODULES:` and `FEATURES:` from agent outputs.
- **Long-term Memory:** Knowledge is persisted as clean Markdown in `~/.bit-office/knowledge/[project]/PROJECT_KNOWLEDGE.md`.
- **NotebookLM Ready:** This directory structure is designed for direct ingestion into Google NotebookLM for advanced query and reasoning over project history.
- **Context-Aware Retrieval:** Every new task starts with an automatic injection of established project knowledge, ensuring agents build upon existing work rather than recreating it.

## 3. Multi-Modal Perception (Vision)

The swarm can "see" the interfaces it builds:
- **`useVision: true`:** Enabled by default in the orchestrator.
- **Playwright Integration:** Agents use `VisualPerception` to take screenshots and analyze UI layout, accessibility, and visual bugs.
- **Hydration & Runtime Checks:** Detects client-side errors that simple HTTP requests miss.

## 4. Self-Healing Swarm & Autonomous QA

Autonomous failure recovery and quality assurance:
- **Autonomous QA Loop:** Workers use `rtk lint` and `rtk test` to verify their own code before reporting completion.
- **Error Interception:** Detects task failures, process hangs, and configuration errors.
- **Autonomous Fixing:** If a task fails, the `AutoHealer` can propose and apply fixes (e.g., adding missing dependencies, fixing syntax, or adjusting environment variables).
- **Graceful Retries:** Implements smart-retry logic with increasing backoff.

## 5. Technical Infrastructure

### Path Mapping
- **Host:** `D:\www`
- **Container:** `/app/workspace`
- **Environment:** `WORKSPACE=/app/workspace` must be set in the environment.
- **Resolution:** The Gateway logs a **CRITICAL ERROR** if it detects a Windows-style path in an environment that expects Linux-style paths, preventing "Ghost Path" silent failures.

### Swarm Telemetry
The UI receives `team:chat` events with `messageType: "briefing"`.
Format: `[Mission Briefing] [Agent Name] > Current Action`

### Delegation & Isolation
- **Worktrees:** Agents use `git worktree` for isolated development when multiple developers are working concurrently.
- **Conflict Detection:** Automatic merge-check before finishing a task to prevent overwriting other agents' work.
- **Phase Machine:** Ensures agents move through `Plan` -> `Execute` -> `Review` -> `Done` in a controlled manner.

## 6. Troubleshooting

- **Ghost Paths:** If an agent complains that a file doesn't exist but you see it on Windows, check the Gateway logs for `[Config] Path Mismatch`.
- **Briefing Silence:** If briefings stop, verify that agents are actually outputting logs (the loop relies on `lastLogLine`).
- **Qdrant Connection:** Ensure the `qdrant` container is healthy; otherwise, `VectorMemory` will fall back to local-only mode.

---
*Documentation generated by Antigravity — Master Swarm Orchestrator.*
