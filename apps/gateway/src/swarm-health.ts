import { keyManager } from "./key-manager.js";
import { publishEvent } from "./transport.js";
import { config } from "./config.js";
import type { Orchestrator } from "@bit-office/orchestrator";

export class SwarmHealthMonitor {
  private timer: NodeJS.Timeout | null = null;
  private orc: Orchestrator;

  constructor(orc: Orchestrator) {
    this.orc = orc;
  }

  start(intervalMs = 30000) {
    this.stop();
    this.timer = setInterval(() => this.checkHealth(), intervalMs);
    // Run initial check
    this.checkHealth();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async checkHealth() {
    const diagnostics: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // 1. Check AI Key Status
    const keySummary = keyManager.getSummary();
    const criticalProviders = ["gemini"]; // Core providers
    
    for (const info of keySummary) {
      if (info.isBlacklisted) {
        diagnostics.push(`Provider Issue: Key starting with ${info.keyPrefix} is blacklisted`);
        score -= 5;
      }
    }

    // Check overall availability per provider type
    const providers: Array<"gemini" | "claude" | "openai" | "typhoon"> = ["gemini", "claude", "openai", "typhoon"];
    for (const p of providers) {
      if (!keyManager.hasAvailableKeys(p)) {
        diagnostics.push(`Provider Fail: ${p} has no available API keys`);
        if (criticalProviders.includes(p)) {
          score -= 40;
          recommendations.push(`CRITICAL: Please update ${p} API keys in config.json`);
        } else {
          score -= 10;
          recommendations.push(`Warning: ${p} capabilities are limited. Check keys.`);
        }
      }
    }

    // 2. Check Service Connectivity
    const services = [
      { name: "Qdrant", url: `http://${process.env.QDRANT_HOST || "qdrant"}:6333/healthz` },
      { name: "Ollama", url: `http://${process.env.OLLAMA_HOST || "ollama"}:11434/` },
    ];

    for (const service of services) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const resp = await fetch(service.url, { signal: controller.signal }).catch(() => null);
        clearTimeout(timeoutId);

        if (!resp || !resp.ok) {
          diagnostics.push(`Connectivity: ${service.name} service is unreachable`);
          score -= 15;
          recommendations.push(`Restart the ${service.name.toLowerCase()} container`);
        }
      } catch (e) {
        diagnostics.push(`Connectivity: ${service.name} check failed (${(e as Error).message})`);
        score -= 5;
      }
    }

    // 3. Team Status
    const agents = this.orc.getAllAgents?.() || [];
    if (agents.length === 0) {
      diagnostics.push("Swarm: No agents active in team");
      score -= 5;
    }

    const finalScore = Math.max(0, score);
    const status = finalScore > 80 ? "optimal" : finalScore > 40 ? "stressed" : "failing";

    publishEvent({
      type: "SWARM_HEALTH",
      teamId: "global",
      score: finalScore,
      status: status as any,
      diagnostics: diagnostics.length > 0 ? diagnostics : ["All systems synchronized", "Telemetry batching active"],
      recommendations: recommendations.length > 0 ? recommendations : ["Maintain current mission pace"],
    });
  }
}
