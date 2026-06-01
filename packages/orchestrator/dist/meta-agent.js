import { spawn } from "child_process";
import { modelRouter } from "./model-router.js";
export class MetaAgent {
    backends;
    defaultBackendId;
    onThought;
    constructor(backends, defaultBackendId, onThought) {
        this.backends = backends;
        this.defaultBackendId = defaultBackendId;
        this.onThought = onThought;
    }
    async analyzeAndAssemble(prompt, context) {
        this.onThought?.("Analyzing task complexity and context...");
        const backend = this.backends.get(this.defaultBackendId);
        if (!backend)
            return null;
        const isThai = /[\u0E00-\u0E7F]/.test(prompt);
        if (isThai) {
            this.onThought?.("Detected Thai language input. Optimizing team for multi-lingual support...");
        }
        const availableBackends = Array.from(this.backends.keys());
        const systemPrompt = `You are the Omni-Architect (The Swarm Architect).
Your job is to analyze the user's task and assemble a ELITE team of AI agents to solve it.
You MUST return ONLY valid JSON.

Available Backends: ${availableBackends.join(", ")}
Routing Recommendations:
- UI/CSS/QA/Analysis: gemini (Fast, Cost-Effective)
- Frontend/Backend/Architecture: claude (High-Performance Sonnet)
- Thai Support: typhoon (if available) or gemini

JSON Schema:
{
  "teamName": "Creative name for the task force",
  "leadPresetIndex": 0,
  "members": [
    {
      "name": "Cool Agent Name",
      "role": "Specific Role (e.g., Senior TypeScript Architect, Tailwind CSS Guru, QA Engineer)",
      "personality": "Detailed personality traits and communication style",
      "backendId": "Preferred backend from available list",
      "palette": 0 // Numeric index 0-9 representing a color theme
    }
  ]
}

Guidelines:
1. Micro tasks (single file/typo): 1 agent (Specialist).
2. Small tasks (small module/refactor): 2 agents (Specialist + QA).
3. Medium tasks (new feature/epic): 3 agents (Architect + Specialist + QA).
4. Large tasks (new system/migration): 4-5 agents (Architect + Frontend + Backend + QA + DevOps).
5. Data/Research heavy: Add a 'Researcher' agent.
6. Multi-lingual/Thai: Ensure at least one agent is role-played as a Thai Specialist.

Dynamic Scaling:
- If context shows > 10 files, increase team size by 1.
- If task involves 'infrastructure', 'docker', or 'database', add a 'DevOps/Infra' specialist.
- Assign palettes (0-9) to visually distinguish roles (e.g., Lead=0, Dev=1, QA=2, Designer=3, Researcher=4).
- For Thai tasks, assign 'typhoon' (if available) or 'gemini' to agents handling local content.
- Personalities should be distinct and helpful.

Task: ${prompt}${context ? `\n\nTask Context (Memory/Insights):\n${context}` : ""}`;
        return this.callArchitect(backend, systemPrompt);
    }
    /**
     * Dynamically re-evaluates the swarm during a mission if progress is stalled or errors occur.
     */
    async reevaluateSwarm(missionPrompt, status, agents) {
        this.onThought?.("Mission progress re-evaluation in progress...");
        const backend = this.backends.get(this.defaultBackendId);
        if (!backend)
            return null;
        const agentStatus = agents.map(a => `${a.name} (${a.role}): ${a.status}`).join("\n");
        const reevalPrompt = `You are the Omni-Architect. A swarm is currently executing a mission but facing difficulties or requires optimization.
Mission: ${missionPrompt}
Current Swarm Status:
${status}
${agentStatus}

Your goal:
1. Decide if the current team is sufficient.
2. If NOT, propose an UPDATED team (Add/Replace agents).
3. If yes, return the current team spec.

Return ONLY valid JSON following the same schema as swarm assembly.`;
        return this.callArchitect(backend, reevalPrompt);
    }
    async callArchitect(backend, prompt) {
        const availableBackends = Array.from(this.backends.keys());
        return new Promise((resolve) => {
            try {
                const args = backend.buildArgs(prompt, { noTools: true, skipResume: true });
                const child = spawn(backend.command, args, { stdio: ["ignore", "pipe", "pipe"] });
                this.onThought?.("Architecting strategic swarm configuration...");
                let output = "";
                child.stdout.on("data", (d) => output += d.toString());
                child.on("close", () => {
                    try {
                        const jsonStr = output.match(/\{[\s\S]*\}/)?.[0];
                        if (jsonStr) {
                            const spec = JSON.parse(jsonStr);
                            spec.members.forEach(m => {
                                if (!m.backendId || !this.backends.has(m.backendId)) {
                                    m.backendId = modelRouter.route(`${m.role} ${m.personality}`, availableBackends);
                                }
                            });
                            resolve(spec);
                        }
                        else {
                            resolve(null);
                        }
                    }
                    catch (e) {
                        console.error("[MetaAgent] Failed to parse output:", e);
                        resolve(null);
                    }
                });
                child.on("error", (e) => {
                    console.error("[MetaAgent] Spawn error:", e);
                    resolve(null);
                });
            }
            catch (e) {
                console.error("[MetaAgent] Failed to spawn:", e);
                resolve(null);
            }
        });
    }
}
//# sourceMappingURL=meta-agent.js.map