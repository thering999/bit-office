import { existsSync, readdirSync, statSync, openSync, readSync, closeSync } from "fs";
import path from "path";
import os from "os";
import type { GatewayEvent } from "@office/shared";

const OPENCLAW_ROOT = path.join(os.homedir(), ".openclaw", "agents");
const ACTIVE_WINDOW_MS = 2 * 60 * 1000;
const POLL_MS = 5000;
const MAX_TAIL_BYTES = 96 * 1024;
const MAX_SUMMARY_LEN = 220;

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
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\{[\s\S]*?\}/g, (m) => (m.length > 180 ? " " : m))
    .replace(/\s+/g, " ")
    .trim();
}

function clip(text: string, max = MAX_SUMMARY_LEN) {
  const cleaned = cleanText(text);
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

function isUsefulText(text: string) {
  const cleaned = cleanText(text);
  if (!cleaned) return false;
  if (cleaned.length < 6) return false;
  if (/^[{}\[\](),.:;`'"\-_=+/*\\|<>\s]+$/.test(cleaned)) return false;
  if (/(^import\s+.+from\s+['"]|^export\s+(const|function|class|type|interface)\s|^function\s+\w+\(|^const\s+\w+\s*=)/i.test(cleaned)) return false;
  if (/^(warning:|note: compacted|truncated:|toolresult|tool call)/i.test(cleaned)) return false;
  return true;
}

function tryParseLine(line: string) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function getMessageTextParts(msg: any) {
  const content = Array.isArray(msg?.content) ? msg.content : [];
  return content
    .filter((item: any) => item?.type === "text" && typeof item.text === "string")
    .map((item: any) => clip(String(item.text)))
    .filter(isUsefulText);
}

function formatToolCall(item: any) {
  if (!item?.name) return "";
  const command = typeof item.arguments?.command === "string" ? clip(item.arguments.command, 140) : "";
  if (command) return `Using ${String(item.name)}: ${command}`;
  const targetPath = typeof item.arguments?.file_path === "string" ? path.basename(item.arguments.file_path) : "";
  if (targetPath) return `Using ${String(item.name)} on ${targetPath}`;
  return `Using ${String(item.name)}`;
}

function inferIntent(text: string) {
  const cleaned = cleanText(text);
  if (!cleaned) return "";
  if (/\b(check|inspect|investigate|debug|diagnos|validate|verify|review)\b/i.test(cleaned)) return `Checking: ${clip(cleaned, 140)}`;
  if (/\b(implement|fix|improve|update|edit|patch|refactor|wire|stabilize)\b/i.test(cleaned)) return `Working on: ${clip(cleaned, 140)}`;
  return `Task: ${clip(cleaned, 140)}`;
}

function extractSummaryFromTail(tail: string) {
  const lines = tail.split(/\r?\n/).filter(Boolean);
  let latestUser = "";
  let latestAssistant = "";
  let latestTool = "";
  let latestCommentary = "";

  for (let i = lines.length - 1; i >= 0; i--) {
    const obj = tryParseLine(lines[i]);
    if (obj?.type !== "message") continue;
    const msg = obj.message;
    if (!msg?.role) continue;

    if (msg.role === "assistant") {
      const textParts = getMessageTextParts(msg);
      const toolParts = (Array.isArray(msg.content) ? msg.content : [])
        .filter((item: any) => item?.type === "toolCall" && item.name)
        .map(formatToolCall)
        .filter(Boolean);

      if (!latestCommentary && textParts.length > 0) latestCommentary = textParts[0];
      if (!latestTool && toolParts.length > 0) latestTool = toolParts[0];

      const commentary = textParts.find((t: string) => /\b(i('| a)?m|I will|I’m|checking|working|next|now)\b/i.test(t)) ?? textParts[0];
      if (commentary && !latestAssistant) latestAssistant = commentary;
    }

    if (msg.role === "user") {
      const text = typeof msg.content?.[0]?.text === "string" ? clip(String(msg.content[0].text), 160) : "";
      if (text && !latestUser) latestUser = text;
    }
  }

  if (latestAssistant && latestTool) return clip(`${latestAssistant} • ${latestTool}`);
  if (latestAssistant) return clip(latestAssistant);
  if (latestCommentary) return clip(`Progress: ${latestCommentary}`);
  if (latestTool) return clip(latestTool);
  if (latestUser) return inferIntent(latestUser);
  return "Standing by";
}

function getSnapshot(agentId: string): Snapshot {
  const latest = pickLatestSession(agentId);
  if (!latest) {
    return { agentId, updatedAt: 0, status: "idle", summary: "No session yet" };
  }
  let summary = "Standing by";
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
    this.sync(true);
    this.timer = setInterval(() => this.sync(false), POLL_MS);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  getAgentIds() {
    return Array.from(this.seen.keys());
  }

  syncNow(force = false) {
    this.sync(force);
  }

  private sync(force = false) {
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

      if (force || !prev || prev.status !== snapshot.status || prev.summary !== snapshot.summary) {
        this.publishEvent({
          type: "AGENT_STATUS",
          agentId,
          status: snapshot.status,
          details: snapshot.summary,
        });
      }

      if (force || !prev || prev.summary !== snapshot.summary) {
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
