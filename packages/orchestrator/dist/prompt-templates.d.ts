/** All known template names — compile-time safety for render() calls */
export type TemplateName = "leader-initial" | "leader-continue" | "leader-result" | "worker-initial" | "worker-reviewer-initial" | "worker-continue" | "worker-direct-fix" | "delegation-prefix" | "delegation-hint" | "leader-create" | "leader-create-continue" | "leader-design" | "leader-design-continue" | "leader-complete" | "leader-complete-continue";
export declare class PromptEngine {
    private templates;
    private promptsDir;
    constructor(promptsDir?: string);
    /**
     * Initialize prompt templates on startup.
     * Always writes built-in defaults to disk so new/updated templates take effect.
     * Users can still customize — edits are preserved until the next code update changes a template.
     */
    init(): void;
    /**
     * Re-read all templates from disk. Missing files fall back to built-in defaults.
     */
    reload(): void;
    /**
     * Render a named template with variable substitution.
     * {{variable}} placeholders are replaced with the provided values.
     */
    render(templateName: TemplateName, vars: Record<string, string | undefined>): string;
}
//# sourceMappingURL=prompt-templates.d.ts.map