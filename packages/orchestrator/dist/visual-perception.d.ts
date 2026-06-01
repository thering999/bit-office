export declare class VisualPerception {
    private browser;
    constructor();
    private getBrowser;
    captureScreenshot(url: string, options?: {
        width?: number;
        height?: number;
    }): Promise<string>;
    captureState(agentId?: string, prompt?: string): Promise<{
        path: string;
        context: string;
    } | null>;
    dispose(): Promise<void>;
}
export declare const visualPerception: VisualPerception;
//# sourceMappingURL=visual-perception.d.ts.map