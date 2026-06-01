import { EventEmitter } from "events";
export class MetaSwarm extends EventEmitter {
    agentManager;
    metaAgent;
    teamId;
    healthInterval;
    isEvaluating = false;
    constructor(agentManager, metaAgent, teamId) {
        super();
        this.agentManager = agentManager;
        this.metaAgent = metaAgent;
        this.teamId = teamId;
    }
    startMonitoring() {
        if (this.healthInterval)
            return;
        this.healthInterval = setInterval(() => this.checkHealth(), 60000); // Every minute
        this.checkHealth();
    }
    stopMonitoring() {
        if (this.healthInterval) {
            clearInterval(this.healthInterval);
            this.healthInterval = null;
        }
    }
    async checkHealth() {
        if (this.isEvaluating)
            return;
        const members = this.agentManager.getTeamMembers();
        if (members.length === 0)
            return;
        const errorCount = members.filter(m => m.status === "error").length;
        const workingCount = members.filter(m => m.status === "working").length;
        const total = members.length;
        let score = 1.0;
        if (errorCount > 0)
            score -= (errorCount / total) * 0.5;
        const status = score > 0.8 ? "optimal" : score > 0.4 ? "stressed" : "failing";
        const diagnostics = [];
        if (errorCount > 0)
            diagnostics.push(`${errorCount} agents are in error state.`);
        if (workingCount === 0 && total > 0)
            diagnostics.push("Swarm is idle but mission is not complete.");
        this.emit("swarm:health", {
            type: "swarm:health",
            teamId: this.teamId,
            score,
            status,
            diagnostics,
            recommendations: score < 0.8 ? ["Consider swarm re-evaluation"] : []
        });
        if (score < 0.5) {
            await this.triggerAutoReassembly();
        }
    }
    async triggerAutoReassembly() {
        if (this.isEvaluating)
            return;
        this.isEvaluating = true;
        try {
            console.log(`[MetaSwarm] Team ${this.teamId} health is critical. Triggering autonomous re-assembly...`);
            const missionPrompt = "Autonomous Swarm Optimization"; // Ideally we store the original mission prompt
            const status = `Current health score: ${0.5}. Critical issues detected.`;
            const agents = this.agentManager.getTeamMembers();
            const newSpec = await this.metaAgent.reevaluateSwarm(missionPrompt, status, agents);
            if (newSpec) {
                console.log(`[MetaSwarm] New strategic configuration proposed: ${newSpec.teamName}`);
                this.emit("swarm:re-assembly", newSpec);
            }
        }
        catch (err) {
            console.error("[MetaSwarm] Auto-reassembly failed:", err);
        }
        finally {
            this.isEvaluating = false;
        }
    }
}
//# sourceMappingURL=meta-swarm.js.map