import { existsSync, readdirSync, readFileSync, statSync, openSync, readSync, closeSync } from "fs";
import path from "path";
import os from "os";
import type { GatewayEvent } from "@office/shared";

const OPENCLAW_ROOT = path.join(os.homedir(), ".openclaw", "agents");
const ACTIVE_WINDOW_MS = 2 * 60 * 1000;
const POLL_MS = 5000;
const MAX_TAIL_BYTES = 64 * 1024;

const AGENT_META: Record<string, { name: string; role: string; isTeamLead?: boolean; teamId?: string; palette?: number }> = {
  main: { name: "Main", role: "Mission Control", isTeamLead: true, teamId: "openclaw-team", palette: 5 },
  lumi: { name: "Lumi", role: "Engineer", teamId: "openclaw-team", palette: 1 },
  pixel: { name: "Pixel", role: "Design", teamId: "openclaw-team", palette: 0 },
  craft: { name: "Craft", role: "Content", teamId: "openclaw-team", palette: 3 },
  ori: { name: "Ori", role: "Research", teamId: "openclaw-team", palette: 2 },
  lala: { name: "Lala", role: "Strategy", teamId: "openclaw-team", palette: 4 },
  sales: { name: "Sales", role: "Sales", teamId: "openclaw-team", palette: 6 },
};

type Snapshot = {
  agentId: string,
  sessionPath?: string,
  updatedAt: number,
  status: "idle" | "working",
  summary: string,
};

function safeReadTail(filePath: string, maxBytes = MAX_TAIL_BYTES) {
  const stats = statSync(filePath);
  const size = stats.size;
  const start = Math.max(0, size - maxBytes);
  const length = size - start;
  const fd = openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(length);
    readSync(fd, buffer, 0, length, start);
    return buffer.toString("utf-8");
  } finally {
    closeSync(fd);
  }
}

function listAgentIds() {
  if (!existsSync(OPENCLAW_ROOT)) return [];
  return readdirSync(OPENCLAW_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => AGENT_META[name]);
}

function pickLatestSession(agentId: string) {
  const sessionsDir = path.join(OPENCLAW_ROOT, agentId, "sessions");
  if (!existsSync(sessionsDir)) return null;
  const candidates = readdirSync(sessionsDir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => name.endsWith(".jsonl"))
    .filter((name) => !name.includes(".stale."))
    .filter((name) => !name.includes(".stale-subagent-"))
    .filter((name) => !name.includes(".reset."))
    .filter((name) => !name.includes(".bak."))
    .filter((name) => !name.endsWith(".lock"))
    .map((name) => ({
      name,
      filePath: path.join(sessionsDir, name),
      mtimeMs: statSync(path.join(sessionsDir, name)).mtimeMs,
    }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0] ?? null;
}

function cleanText(text: string) {
  return text
    .replace(/<relevant-memories>[\s\S]*?<\/relevant-memories>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSummaryFromTail(tail: string) {
  const lines = tail.split(/\r?\n/).filter(Boolean);
  let fallbackUser = "";
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const obj = JSON.parse(lines[i]);
      if (obj.type !== "message") continue;
      const msg = obj.message;
      if (!msg || !msg.role) continue;
      if (msg.role === "assistant") {
        const content = Array.isArray(msg.content) ? msg.content : [];
        for (let j = content.length - 1; j >= 0; j--) {
          const item = content[j];
          if (item?.type === "text" && item.text) {
            const text = cleanText(String(item.text)).slice(0, 220);
            if (text) return `Done: ${text}`;
          }
          if (item?.type === "thinking" && item.thinking) {
            const text = cleanText(String(item.thinking)).slice(0, 180);
            if (text) return `Thinking: ${text}`;
          }
          if (item?.type === "toolCall" && item.name) {
            const maybeCmd = item.arguments?.command ? cleanText(String(item.arguments.command)).slice(0, 120) : "";
            return maybeCmd ? `Using ${String(item.name)}: ${maybeCmd}` : `Using tool: ${String(item.name)}`;
          }
        }
      }
      if (msg.role === "toolResult") {
        const text = msg.content?.[0]?.text;
        if (text) {
          const cleaned = cleanText(String(text)).slice(0, 200);
          if (cleaned) return `Tool result: ${cleaned}`;
        }
      }
      if (msg.role === "user") {
        const text = msg.content?.[0]?.text;
        if (text && !fallbackUser) fallbackUser = cleanText(String(text)).slice(0, 180);
      }
    } catch {
      continue;
    }
  }
  return fallbackUser ? `Task: ${fallbackUser}` : "Idle";
}

function getSnapshot(agentId: string): Snapshot {
  const latest = pickLatestSession(agentId);
  if (!latest) {
    return { agentId, updatedAt: 0, status: "idle", summary: "No session yet" };
  }
  let summary = "Idle";
  try {
    summary = extractSummaryFromTail(safeReadTail(latest.filePath));
  } catch {
    summary = "Session detected";
  }
  const active = Date.now() - latest.mtimeMs < ACTIVE_WINDOW_MS;
  return {
    agentId,
    sessionPath: latest.filePath,
    updatedAt: latest.mtimeMs,
    status: active ? "working" : "idle",
    summary,
  };
}

export class OpenClawAdapter {
  private timer: NodeJS.Timeout | null = null;
  private seen = new Map<string, Snapshot>();

  constructor(private publishEvent: (event: GatewayEvent) => void) {}

  start() {
    if (this.timer) return;
    this.sync();
    this.timer = setInterval(() => this.sync(), POLL_MS);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  getAgentIds() {
    return Array.from(this.seen.keys());
  }

  syncNow() {
    this.sync();
  }

  private sync() {
    const agentIds = listAgentIds();
    const activeIds = new Set<string>();

    for (const rawAgentId of agentIds) {
      const meta = AGENT_META[rawAgentId] ?? { name: rawAgentId, role: rawAgentId };
      const snapshot = getSnapshot(rawAgentId);
      const agentId = `openclaw:${rawAgentId}`;
      activeIds.add(agentId);
      const prev = this.seen.get(agentId);

      this.publishEvent({
        type: "AGENT_CREATED",
        agentId,
        name: meta.name,
        role: meta.role,
        palette: meta.palette,
        backend: "openclaw",
        isTeamLead: meta.isTeamLead,
        teamId: meta.teamId,
        isExternal: true,
        cwd: snapshot.sessionPath,
        startedAt: snapshot.updatedAt || undefined,
      });

      if (!prev || prev.status !== snapshot.status || prev.summary !== snapshot.summary) {
        this.publishEvent({
          type: "AGENT_STATUS",
          agentId,
          status: snapshot.status,
          details: snapshot.summary,
        });
      }

      if (!prev || prev.summary !== snapshot.summary) {
        if (snapshot.status === "working") {
          this.publishEvent({
            type: "TASK_STARTED",
            agentId,
            taskId: "openclaw-sync",
            prompt: snapshot.summary,
          });
        }
        this.publishEvent({
          type: "LOG_APPEND",
          agentId,
          taskId: "openclaw-sync",
          stream: "stdout",
          chunk: snapshot.summary,
        });
      }

      this.seen.set(agentId, snapshot);
    }

    for (const agentId of Array.from(this.seen.keys())) {
      if (!activeIds.has(agentId)) {
        this.seen.delete(agentId);
        this.publishEvent({ type: "AGENT_FIRED", agentId });
      }
    }
  }
}
