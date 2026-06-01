import { z } from "zod";
export const AgentStatusEnum = z.enum([
    "idle", "thinking", "coding", "working", "waiting_approval", "done", "error", "searching", "testing", "documenting", "debugging", "walking_to_server",
]);
export const RiskLevelEnum = z.enum(["low", "med", "high"]);
export const DecisionEnum = z.enum(["yes", "no"]);
export const TeamPhaseEnum = z.enum(["create", "design", "execute", "complete"]);
export const UserRoleEnum = z.enum(["owner", "collaborator", "spectator"]);
//# sourceMappingURL=types.js.map