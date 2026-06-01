import { OrchestratorEvent } from "./orchestrator-types";
import { GatewayEvent } from "./events";

/**
 * Maps an internal OrchestratorEvent to a wire-protocol GatewayEvent.
 * This is used by the Gateway to broadcast events to the UI.
 */
export function mapOrchestratorEvent(e: OrchestratorEvent): GatewayEvent | null {
  switch (e.type) {
    case "task:started":
      return { type: "TASK_STARTED", agentId: e.agentId, taskId: e.taskId, prompt: e.prompt };
    case "task:done":
      return { type: "TASK_DONE", agentId: e.agentId, taskId: e.taskId, result: e.result as any, isFinalResult: e.isFinalResult };
    case "task:failed":
      return { type: "TASK_FAILED", agentId: e.agentId, taskId: e.taskId, error: e.error };
    case "task:delegated":
      return { type: "TASK_DELEGATED", fromAgentId: e.fromAgentId, toAgentId: e.toAgentId, taskId: e.taskId, prompt: e.prompt };
    case "agent:status":
      return { type: "AGENT_STATUS", agentId: e.agentId, status: e.status as any, details: e.details, isFailover: e.isFailover };
    case "approval:needed":
      return { type: "APPROVAL_NEEDED", approvalId: e.approvalId, agentId: e.agentId, taskId: e.taskId, title: e.title, summary: e.summary, riskLevel: e.riskLevel as any };
    case "log:append":
      return { type: "LOG_APPEND", agentId: e.agentId, taskId: e.taskId, stream: e.stream, chunk: e.chunk };
    case "team:chat":
      return { type: "TEAM_CHAT", fromAgentId: e.fromAgentId, toAgentId: e.toAgentId, message: e.message, messageType: e.messageType as any, taskId: e.taskId, timestamp: e.timestamp };
    case "task:queued":
      return { type: "TASK_QUEUED", agentId: e.agentId, taskId: e.taskId, prompt: e.prompt, position: e.position };
    case "agent:created":
      return { type: "AGENT_CREATED", agentId: e.agentId, name: e.name, role: e.role, palette: e.palette, personality: e.personality, backend: e.backend, isTeamLead: e.isTeamLead, teamId: e.teamId };
    case "agent:fired":
      return { type: "AGENT_FIRED", agentId: e.agentId };
    case "task:result-returned":
      return { type: "TASK_RESULT_RETURNED", fromAgentId: e.fromAgentId, toAgentId: e.toAgentId, taskId: e.taskId, summary: e.summary, success: e.success };
    case "meta:thought":
      return { type: "META_THOUGHT", agentId: e.agentId, thought: e.thought, timestamp: e.timestamp };
    case "team:phase":
      return { type: "TEAM_PHASE", teamId: e.teamId, phase: e.phase as any, leadAgentId: e.leadAgentId };
    case "token:update":
      return { type: "TOKEN_UPDATE", agentId: e.agentId, inputTokens: e.inputTokens, outputTokens: e.outputTokens };
    case "swarm:health":
      return { type: "SWARM_HEALTH", teamId: e.teamId, score: e.score, status: e.status as any, diagnostics: e.diagnostics, recommendations: e.recommendations };
    case "swarm:re-assembly":
      return { type: "SWARM_REASSEMBLY", teamId: e.teamId, newTeamName: e.teamName };
    default:
      return null;
  }
}
