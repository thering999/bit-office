export type TaskType = "UI_DESIGN" | "FRONTEND" | "BACKEND" | "DEVOPS" | "QA" | "ANALYSIS" | "COORDINATION" | "THAI_CONTENT";
export interface ModelRouting {
    taskType: TaskType;
    preferredBackend: string;
    fallbackBackends: string[];
    costWeight: "low" | "medium" | "high";
}
export declare class ModelRouterService {
    private routings;
    constructor(customRoutings?: ModelRouting[]);
    route(taskDescription: string, availableBackends: string[]): string;
    private detectTaskType;
}
export declare const modelRouter: ModelRouterService;
//# sourceMappingURL=model-router.d.ts.map