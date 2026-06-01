import { z } from "zod";

export const AgentStatusEnum = z.enum([
  "idle", "thinking", "coding", "working", "waiting_approval", "done", "error", "searching", "testing", "documenting", "debugging", "walking_to_server", "collaborating", "analyzing",
]);
export type AgentStatus = z.infer<typeof AgentStatusEnum>;

export const RiskLevelEnum = z.enum(["low", "med", "high"]);
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

export const DecisionEnum = z.enum(["yes", "no"]);
export type Decision = z.infer<typeof DecisionEnum>;

export const TeamPhaseEnum = z.enum(["create", "design", "execute", "complete"]);
export type TeamPhase = z.infer<typeof TeamPhaseEnum>;

export const UserRoleEnum = z.enum(["owner", "collaborator", "spectator"]);
export type UserRole = z.infer<typeof UserRoleEnum>;

export interface ChatMessage {
  id: string;
  role: "user" | "agent" | "thought" | "system";
  text: string;
  timestamp: number;
  result?: any;
  _accumulatedText?: string;
  isFinalResult?: boolean;
  durationMs?: number;
}

export interface TeamChatMessage {
  id: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId?: string;
  toAgentName?: string;
  message: string;
  messageType: "delegation" | "result" | "status" | "briefing" | "thought" | "error";
  timestamp: number;
}

export interface AgentState {
  agentId: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentTaskId: string | null;
  currentPrompt: string | null;
  pendingApproval: any | null;
  messages: ChatMessage[];
  lastLogLine: string | null;
  statusDetails: string | null;
  tokenUsage: { inputTokens: number; outputTokens: number };
  workDir?: string;
  isExternal?: boolean;
  palette?: number;
  personality?: string;
  backend?: string;
  isTeamLead?: boolean;
  teamId?: string;
  pid?: number;
  cwd?: string;
  startedAt?: number;
  isFailover?: boolean;
  _tokenBaseline?: { inputTokens: number; outputTokens: number };
}

export interface TeamPhaseState {
  phase: TeamPhase;
  leadAgentId: string;
}

export interface DataPacket {
  id: string;
  from: string;
  to: string;
  type: string;
  timestamp?: number;
}
