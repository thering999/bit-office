export class ModelRouterService {
    routings = [
        {
            taskType: "UI_DESIGN",
            preferredBackend: "gemini",
            fallbackBackends: ["claude"],
            costWeight: "low"
        },
        {
            taskType: "FRONTEND",
            preferredBackend: "claude",
            fallbackBackends: ["gemini"],
            costWeight: "high"
        },
        {
            taskType: "BACKEND",
            preferredBackend: "claude",
            fallbackBackends: ["gemini", "deepseek"],
            costWeight: "high"
        },
        {
            taskType: "DEVOPS",
            preferredBackend: "gemini",
            fallbackBackends: ["claude"],
            costWeight: "low"
        },
        {
            taskType: "QA",
            preferredBackend: "gemini",
            fallbackBackends: ["claude"],
            costWeight: "low"
        },
        {
            taskType: "ANALYSIS",
            preferredBackend: "gemini",
            fallbackBackends: ["claude"],
            costWeight: "medium"
        },
        {
            taskType: "COORDINATION",
            preferredBackend: "gemini",
            fallbackBackends: ["claude"],
            costWeight: "low"
        },
        {
            taskType: "THAI_CONTENT",
            preferredBackend: "typhoon",
            fallbackBackends: ["gemini", "claude"],
            costWeight: "medium"
        }
    ];
    constructor(customRoutings) {
        if (customRoutings) {
            this.routings = [...this.routings, ...customRoutings];
        }
    }
    route(taskDescription, availableBackends) {
        const isThai = /[\u0E00-\u0E7F]/.test(taskDescription);
        const taskType = isThai ? "THAI_CONTENT" : this.detectTaskType(taskDescription);
        const routing = this.routings.find(r => r.taskType === taskType);
        if (routing) {
            if (availableBackends.includes(routing.preferredBackend)) {
                return routing.preferredBackend;
            }
            for (const fallback of routing.fallbackBackends) {
                if (availableBackends.includes(fallback)) {
                    return fallback;
                }
            }
        }
        // Default fallback
        return availableBackends.includes("gemini") ? "gemini" : availableBackends[0];
    }
    detectTaskType(description) {
        const desc = description.toLowerCase();
        if (desc.includes("ui") || desc.includes("css") || desc.includes("style") || desc.includes("visual"))
            return "UI_DESIGN";
        if (desc.includes("frontend") || desc.includes("react") || desc.includes("component"))
            return "FRONTEND";
        if (desc.includes("backend") || desc.includes("api") || desc.includes("database") || desc.includes("server"))
            return "BACKEND";
        if (desc.includes("docker") || desc.includes("ci") || desc.includes("deploy") || desc.includes("setup"))
            return "DEVOPS";
        if (desc.includes("test") || desc.includes("lint") || desc.includes("verify") || desc.includes("fix"))
            return "QA";
        if (desc.includes("analyze") || desc.includes("research") || desc.includes("plan"))
            return "ANALYSIS";
        return "COORDINATION";
    }
}
export const modelRouter = new ModelRouterService();
//# sourceMappingURL=model-router.js.map