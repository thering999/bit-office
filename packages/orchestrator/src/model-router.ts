import { AIBackend } from "./ai-backend";

export type TaskType = "UI_DESIGN" | "FRONTEND" | "BACKEND" | "DEVOPS" | "QA" | "ANALYSIS" | "COORDINATION" | "THAI_CONTENT";

export interface ModelRouting {
  taskType: TaskType;
  preferredBackend: string;
  fallbackBackends: string[];
  costWeight: "low" | "medium" | "high";
}

export class ModelRouterService {
  private routings: ModelRouting[] = [
    {
      taskType: "UI_DESIGN",
      preferredBackend: "gemini-api", 
      fallbackBackends: ["groq", "mistral", "typhoon"],
      costWeight: "low"
    },
    {
      taskType: "FRONTEND",
      preferredBackend: "claude", 
      fallbackBackends: ["openai-api", "deepseek", "groq", "gemini-api"],
      costWeight: "high"
    },
    {
      taskType: "BACKEND",
      preferredBackend: "deepseek",
      fallbackBackends: ["openai-api", "claude", "groq", "gemini-api"],
      costWeight: "high"
    },
    {
      taskType: "DEVOPS",
      preferredBackend: "groq",
      fallbackBackends: ["deepseek", "gemini-api", "openai-api"],
      costWeight: "low"
    },
    {
      taskType: "QA",
      preferredBackend: "gemini-api", 
      fallbackBackends: ["deepseek", "groq", "openai-api"],
      costWeight: "low"
    },
    {
      taskType: "ANALYSIS",
      preferredBackend: "deepseek",
      fallbackBackends: ["claude", "openai-api", "gemini-api"],
      costWeight: "medium"
    },
    {
      taskType: "COORDINATION",
      preferredBackend: "gemini-api",
      fallbackBackends: ["groq", "mistral", "typhoon"],
      costWeight: "low"
    },
    {
      taskType: "THAI_CONTENT",
      preferredBackend: "typhoon",
      fallbackBackends: ["gemini-api", "groq", "mistral"],
      costWeight: "medium"
    }
  ];

  constructor(customRoutings?: ModelRouting[]) {
    if (customRoutings) {
      this.routings = [...this.routings, ...customRoutings];
    }
  }

  route(taskDescription: string, availableBackends: string[]): string {
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

    // Default fallback prioritizing working backends
    if (availableBackends.includes("groq")) return "groq";
    if (availableBackends.includes("gemini-api")) return "gemini-api";
    return availableBackends.includes("gemini") ? "gemini" : availableBackends[0];
  }

  private detectTaskType(description: string): TaskType {
    const desc = description.toLowerCase();
    if (desc.includes("ui") || desc.includes("css") || desc.includes("style") || desc.includes("visual")) return "UI_DESIGN";
    if (desc.includes("frontend") || desc.includes("react") || desc.includes("component")) return "FRONTEND";
    if (desc.includes("backend") || desc.includes("api") || desc.includes("database") || desc.includes("server")) return "BACKEND";
    if (desc.includes("docker") || desc.includes("ci") || desc.includes("deploy") || desc.includes("setup")) return "DEVOPS";
    if (desc.includes("test") || desc.includes("lint") || desc.includes("verify") || desc.includes("fix")) return "QA";
    if (desc.includes("analyze") || desc.includes("research") || desc.includes("plan")) return "ANALYSIS";
    return "COORDINATION";
  }
}

export const modelRouter = new ModelRouterService();
