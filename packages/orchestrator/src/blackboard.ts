import { EventEmitter } from "events";

export interface BlackboardEntry {
  id: string;
  type: "task" | "insight" | "blocker" | "plan";
  content: string;
  author: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  timestamp: number;
}

/**
 * MissionBlackboard provides a shared, real-time "Team Awareness" system.
 * Agents can post their current goals, findings, and blockers here.
 */
export class MissionBlackboard extends EventEmitter {
  private entries: BlackboardEntry[] = [];
  private missionTitle: string = "Dynamic Mission";

  setMissionTitle(title: string) {
    this.missionTitle = title;
    this.emit("blackboard:updated", this.getStateSummary());
  }

  post(entry: Omit<BlackboardEntry, "timestamp" | "id">): string {
    const id = Math.random().toString(36).substring(2, 9);
    const fullEntry: BlackboardEntry = { ...entry, id, timestamp: Date.now() };
    this.entries.push(fullEntry);
    this.emit("blackboard:updated", this.getStateSummary());
    return id;
  }

  updateStatus(id: string, status: BlackboardEntry["status"], content?: string) {
    const entry = this.entries.find(e => e.id === id);
    if (entry) {
      entry.status = status;
      if (content) entry.content = content;
      this.emit("blackboard:updated", this.getStateSummary());
    }
  }

  getEntries(): BlackboardEntry[] {
    return this.entries;
  }

  getStateSummary(): string {
    if (this.entries.length === 0) return "Blackboard is empty. Mission just started.";

    const lines: string[] = [`MISSION: ${this.missionTitle}`, "--- SHARED TEAM BLACKBOARD ---"];
    
    const tasks = this.entries.filter(e => e.type === "task");
    if (tasks.length > 0) {
      lines.push("TASKS:");
      tasks.forEach(t => lines.push(`- [${t.status.toUpperCase()}] ${t.content} (by ${t.author})`));
    }

    const insights = this.entries.filter(e => e.type === "insight");
    if (insights.length > 0) {
      lines.push("INSIGHTS/FINDINGS:");
      insights.forEach(i => lines.push(`- ${i.content} (found by ${i.author})`));
    }

    const blockers = this.entries.filter(e => e.type === "blocker" && e.status !== "completed");
    if (blockers.length > 0) {
      lines.push("🚨 BLOCKERS:");
      blockers.forEach(b => lines.push(`- ${b.content} (reported by ${b.author})`));
    }

    return lines.join("\n");
  }

  clear() {
    this.entries = [];
    this.emit("blackboard:updated", "");
  }
}

export const blackboard = new MissionBlackboard();
