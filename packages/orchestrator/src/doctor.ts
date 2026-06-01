import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export interface DiagnosticResult {
  category: string;
  status: "ok" | "warn" | "error";
  message: string;
  fix?: string;
}

/**
 * Swarm Doctor: Diagnoses common AI agent and infrastructure issues.
 */
export class SwarmDoctor {
  constructor(private workspace: string) {}

  async diagnose(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // 1. Check for Workspace Locks
    results.push(this.checkGitLock());

    // 2. Check for Zombie AI Processes
    results.push(this.checkZombieProcesses());

    // 3. Check for AI Tool Accessibility
    results.push(this.checkToolAccessibility("claude"));
    results.push(this.checkToolAccessibility("gemini"));
    results.push(this.checkToolAccessibility("opencode"));

    // 4. Check for Docker (if applicable)
    results.push(this.checkDockerHealth());

    // 5. Check for MCP (Claude Code)
    results.push(this.checkMcpHealth());

    // 6. Check for Backend Scripts (generic-api, mock-ai)
    results.push(this.checkBackendScripts());

    // 7. Check AI Backend Connectivity
    const connectivityResults = await this.checkAIConnectivity();
    results.push(...connectivityResults);

    return results;
  }

  private checkBackendScripts(): DiagnosticResult {
    const distDir = path.resolve(__dirname, "../dist");
    const scripts = ["generic-api.js", "mock-ai.js"];
    const missing = scripts.filter(s => !fs.existsSync(path.join(distDir, s)));

    if (missing.length > 0) {
      return {
        category: "Backends",
        status: "error",
        message: `Missing required backend scripts in dist: ${missing.join(", ")}`,
        fix: "Run 'pnpm --filter bit-office build' to regenerate build artifacts."
      };
    }

    return {
      category: "Backends",
      status: "ok",
      message: "All backend scripts are present in dist."
    };
  }

  private checkMcpHealth(): DiagnosticResult {
    try {
      const isWin = process.platform === "win32";
      // Check if claude is installed first
      try {
        const whichCmd = isWin ? 'where claude' : 'which claude';
        execSync(whichCmd, { stdio: "ignore" });
      } catch {
        return {
          category: "MCP",
          status: "ok",
          message: "Claude Code not installed, skipping MCP check."
        };
      }

      // Check MCP status via claude CLI
      // On Windows/Docker we might need to be careful with paths
      const cmd = "claude mcp list";
      const output = execSync(cmd, { encoding: "utf-8", timeout: 5000 });
      
      if (output.includes("No MCP servers configured")) {
        return {
          category: "MCP",
          status: "ok",
          message: "MCP is active but no external servers are configured."
        };
      }

      return {
        category: "MCP",
        status: "ok",
        message: "MCP servers are responsive.",
      };
    } catch (err) {
      return {
        category: "MCP",
        status: "error",
        message: `MCP health check failed: ${err instanceof Error ? err.message : String(err)}`,
        fix: "Check your Claude Code configuration and ensure all MCP servers are reachable."
      };
    }
  }

  private checkGitLock(): DiagnosticResult {
    const lockPath = path.join(this.workspace, ".git", "index.lock");
    if (fs.existsSync(lockPath)) {
      return {
        category: "Workspace",
        status: "error",
        message: "Git lock detected. This prevents agents from committing changes.",
        fix: `Remove the lock file at ${lockPath}`
      };
    }
    return {
      category: "Workspace",
      status: "ok",
      message: "No stale git locks found."
    };
  }

  private checkZombieProcesses(): DiagnosticResult {
    try {
      const isWin = process.platform === "win32";
      let cmd = "";
      if (isWin) {
        cmd = 'tasklist /FI "IMAGENAME eq claude.exe" /FI "IMAGENAME eq gemini.exe"';
      } else {
        cmd = 'ps aux | grep -E "claude|gemini|aider" | grep -v grep';
      }

      const output = execSync(cmd, { encoding: "utf-8" });
      const lineCount = output.trim().split("\n").length;

      if (lineCount > 1) { // 1 is header on Windows, or 0 on Linux
        return {
          category: "Processes",
          status: "warn",
          message: `Detected ${lineCount} potential background AI processes.`,
          fix: "Restart the gateway or use 'taskkill' to clear zombie processes."
        };
      }
    } catch {
      // Error usually means no processes found
    }

    return {
      category: "Processes",
      status: "ok",
      message: "No zombie AI processes detected."
    };
  }

  private checkToolAccessibility(tool: string): DiagnosticResult {
    try {
      const isWin = process.platform === "win32";
      const cmd = isWin ? `where ${tool}` : `which ${tool}`;
      const path = execSync(cmd, { encoding: "utf-8" }).split("\n")[0].trim();
      
      return {
        category: "Tools",
        status: "ok",
        message: `${tool} found at ${path}`
      };
    } catch {
      return {
        category: "Tools",
        status: "error",
        message: `${tool} binary not found in PATH.`,
        fix: `Install ${tool} globally: npm install -g ${tool === 'claude' ? '@anthropic-ai/claude-code' : '@google/gemini-cli'}`
      };
    }
  }

  private checkDockerHealth(): DiagnosticResult {
    try {
      execSync("docker ps", { stdio: "ignore" });
      return {
        category: "Infrastructure",
        status: "ok",
        message: "Docker daemon is responsive."
      };
    } catch {
      return {
        category: "Infrastructure",
        status: "warn",
        message: "Docker daemon is not responsive or not installed.",
        fix: "If you are using Docker, please ensure Docker Desktop is running."
      };
    }
  }

  private async checkAIConnectivity(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];
    const configPath = path.join(process.env.HOME || process.env.USERPROFILE || "", ".bit-office", "config.json");
    
    if (!fs.existsSync(configPath)) {
      return [{
        category: "AI Connectivity",
        status: "error",
        message: "Config file not found. Cannot verify AI connectivity.",
        fix: "Ensure ~/.bit-office/config.json exists."
      }];
    }

    try {
      const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      
      // Check Groq
      if (configData.groqApiKeys?.length > 0) {
        results.push({
          category: "AI Connectivity",
          status: "ok",
          message: "Groq: API key configured."
        });
      } else {
        results.push({
          category: "AI Connectivity",
          status: "warn",
          message: "Groq: No keys configured."
        });
      }

      // Check Gemini
      if (configData.geminiApiKeys?.length > 0) {
        results.push({
          category: "AI Connectivity",
          status: "ok",
          message: `Gemini: ${configData.geminiApiKeys.length} keys configured.`
        });
      } else {
        results.push({
          category: "AI Connectivity",
          status: "warn",
          message: "Gemini: No keys configured. Gemini-based agents will fail.",
          fix: "Add geminiApiKeys to config.json"
        });
      }

      // Check Claude
      if (configData.claudeApiKeys?.length > 0) {
        results.push({
          category: "AI Connectivity",
          status: "ok",
          message: "Claude: API key configured."
        });
      } else {
        results.push({
          category: "AI Connectivity",
          status: "warn",
          message: "Claude: No keys configured. Claude-based agents will fail."
        });
      }

      // Check OpenAI
      if (configData.openaiApiKey || configData.openaiApiKeys?.length > 0) {
        results.push({
          category: "AI Connectivity",
          status: "ok",
          message: "OpenAI: API key configured."
        });
      } else {
        results.push({
          category: "AI Connectivity",
          status: "warn",
          message: "OpenAI: No key configured. OpenAI-based agents will fail."
        });
      }

      // Check OpenRouter
      if (configData.openRouterApiKey || configData.openRouterApiKeys?.length > 0) {
        results.push({
          category: "AI Connectivity",
          status: "ok",
          message: "OpenRouter: API key configured."
        });
      } else {
        results.push({
          category: "AI Connectivity",
          status: "warn",
          message: "OpenRouter: No keys configured."
        });
      }

      // Check DeepSeek
      if (configData.deepSeekApiKey || configData.deepSeekApiKeys?.length > 0) {
        results.push({
          category: "AI Connectivity",
          status: "ok",
          message: "DeepSeek: API key configured."
        });
      } else {
        results.push({
          category: "AI Connectivity",
          status: "warn",
          message: "DeepSeek: No keys configured."
        });
      }

      // Check Typhoon
      if (configData.typhoonApiKey || configData.typhoonApiKeys?.length > 0) {
        results.push({
          category: "AI Connectivity",
          status: "ok",
          message: "Typhoon: API key configured."
        });
      } else {
        results.push({
          category: "AI Connectivity",
          status: "warn",
          message: "Typhoon: No keys configured."
        });
      }

    } catch (err) {
      results.push({
        category: "AI Connectivity",
        status: "error",
        message: `Failed to parse config for connectivity check: ${(err as Error).message}`
      });
    }

    return results;
  }
}
