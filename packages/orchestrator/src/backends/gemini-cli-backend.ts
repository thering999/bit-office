import { AIBackend, BuildArgsOpts } from "../ai-backend.js";

/**
 * GeminiCLIBackend: Uses the native Gemini CLI in headless mode.
 * Highly stable and supports full agent capabilities (MCP, tools).
 */
export class GeminiCLIBackend implements AIBackend {
  public id = "gemini-cli";
  public name = "Gemini CLI (Native)";
  public color = "#1A73E8"; // Google Blue

  public command = "gemini";

  buildArgs(prompt: string, opts: BuildArgsOpts): string[] {
    const args: string[] = ["-p", prompt, "-o", "stream-json", "--yolo", "--skip-trust"];
    
    if (opts.resumeSessionId) {
      args.push("-r", opts.resumeSessionId);
    } else if (opts.continue) {
      args.push("-r", "latest");
    }

    if (opts.model) {
      args.push("-m", opts.model);
    }

    return args;
  }

  getEnv(agentId?: string): Record<string, string> {
    return {
      "AI_AGENT_ID": agentId || "unknown",
      "GEMINI_QUIET": "true",
      "FORCE_COLOR": "1"
    };
  }

  supportsStdin = true;
}
