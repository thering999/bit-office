# 🐝 SWARM-PROTOCOL.md

## Overview
This document defines the communication and coordination protocol for the Bit-Office AI Swarm. All agents must adhere to these rules to ensure consistency and prevent conflicts.

## 📋 Mission Blackboard (Real-time Sync)
Every agent MUST update the Blackboard to keep the team aligned. Use these markers at the beginning of your lines:
- **TASK: <description>** -> Use when starting a new sub-task.
- **INSIGHT: <finding>** -> Use to share an answer, a file path, or a completed step.
- **BLOCKER: <issue>** -> Use if you are stuck or encountered an error.

[Thai: ใช้ TASK:, INSIGHT:, BLOCKER: เพื่ออัปเดตกระดานภารกิจให้เพื่อนร่วมทีมเห็นสถานะงานแบบเรียลไทม์]

## 🤖 Roles & Hierarchy
...
| Role | Responsibility |
|---|---|
| Architect (Lead) | Owns product direction, breaks work down, coordinates delegation. |
| Developer (Worker) | Writes and updates code, runs builds/tests, integrates fixes. |
| QA (Reviewer) | Checks quality and requirement alignment, issues PASS/FAIL. |

## 🛠 Operational Rules (Strict)
1. **Inter-Agent Communication**: Agents MUST talk to each other to solve complex problems.
   - Use `@AgentName: <instruction>` to assign a task or ask for help.
   - Use `@Team: <message>` to share status updates or broadcast questions.
   - [Thai: เอเจนท์ต้องคุยกันเองเพื่อแก้ปัญหา! ใช้ @ชื่อเอเจนท์: เพื่อสั่งงาน และ @Team: เพื่อแจ้งสถานะหรือถามคำถามทีม]
2. **Hard Isolation**: Every sub-task MUST be performed in a separate `git worktree`.
3. **Autonomous Teamwork**: If you are stuck, ask another agent! Do not wait for the user.
   - [Thai: ถ้าติดปัญหา ให้ถามเอเจนท์ตัวอื่นทันที! ไม่ต้องรอผู้ใช้สั่ง]
4. **Self-Healing**: If a task fails, analyze logs and attempt a fix autonomously.
5. **Direct Implementation**: Focus on code changes. Minimal explanation, maximum action.

## 🔄 Automation & Coordination
1. **Layer 1: Task Delegation**: The Team Lead or any agent can delegate tasks.
2. **Layer 2: Real-time Sync**: Agents see each other's status and messages.
3. **Layer 3: Conflict Resolution**: Automated merge and conflict checks.

## 📡 JSON Message Schema (Delegation)
```json
{
  "task": "string",
  "files": ["string"],
  "context": "string",
  "constraints": ["string"]
}
```

## 💬 Example Communication
- **Architect to Dev**: `@Alex: Please implement the login component using the designs in docs/`
- **Dev to Researcher**: `@Rachel: Can you find the latest API documentation for Groq?`
- **Researcher to Dev**: `@Alex: Found it! Here is the endpoint: https://api.groq.com/openai/v1/chat/completions`
- **Dev to Team**: `@Team: I've finished the component. @Sophie please review.`
