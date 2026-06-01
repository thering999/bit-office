import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { config, CONFIG_DIR } from "./config.js";

const BLACKLIST_FILE = resolve(CONFIG_DIR, "key-blacklist.json");

interface KeyState {
  key: string;
  exhaustedUntil: number;
  useCount: number;
  failCount: number;
  lastUsedAt: number;
}

class KeyManager {
  private states: Map<string, KeyState> = new Map();
  private lastIssued: Map<string, string> = new Map();

  constructor() {
    this.refresh();
    this.load();
  }

  private load() {
    if (existsSync(BLACKLIST_FILE)) {
      try {
        const data = JSON.parse(readFileSync(BLACKLIST_FILE, "utf-8"));
        for (const [key, info] of Object.entries(data)) {
          const val = info as any;
          const state = this.states.get(key) || { 
            key, 
            exhaustedUntil: 0, 
            useCount: 0, 
            failCount: 0, 
            lastUsedAt: 0 
          };
          
          if (typeof val === "number") {
            state.exhaustedUntil = val;
          } else {
            state.exhaustedUntil = val.exhaustedUntil ?? 0;
            state.useCount = val.useCount ?? 0;
            state.failCount = val.failCount ?? 0;
            state.lastUsedAt = val.lastUsedAt ?? 0;
          }
          this.states.set(key, state);
        }
        console.log(`[KeyManager] Loaded persistent state for ${Object.keys(data).length} keys`);
      } catch (err) {
        console.error(`[KeyManager] Failed to load persistent state:`, err);
      }
    }
  }

  private save() {
    try {
      const data: Record<string, any> = {};
      for (const state of this.states.values()) {
        // Save if it's blacklisted OR has been used
        if (state.exhaustedUntil > Date.now() || state.useCount > 0) {
          data[state.key] = {
            exhaustedUntil: state.exhaustedUntil,
            useCount: state.useCount,
            failCount: state.failCount,
            lastUsedAt: state.lastUsedAt
          };
        }
      }
      writeFileSync(BLACKLIST_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error(`[KeyManager] Failed to save persistent state:`, err);
    }
  }

  refresh() {
    const providers = [
      { name: "gemini", keys: config.geminiApiKeys },
      { name: "claude", keys: config.claudeApiKeys },
      { name: "openai", keys: config.openaiApiKeys },
      { name: "openrouter", keys: config.openRouterApiKeys },
      { name: "deepseek", keys: config.deepSeekApiKeys },
      { name: "typhoon", keys: config.typhoonApiKeys },
      { name: "groq", keys: config.groqApiKeys },
      { name: "mistral", keys: config.mistralApiKeys }
    ];

    const allKeys = new Set<string>();
    for (const provider of providers) {
      for (const key of provider.keys) {
        allKeys.add(key);
        if (!this.states.has(key)) {
          this.states.set(key, { 
            key, 
            exhaustedUntil: 0, 
            useCount: 0, 
            failCount: 0, 
            lastUsedAt: 0 
          });
        }
      }
    }

    // Prune keys that are no longer in config
    for (const key of this.states.keys()) {
      if (!allKeys.has(key)) {
        this.states.delete(key);
      }
    }
  }

  getNextKey(provider: "gemini" | "openai" | "claude" | "openrouter" | "deepseek" | "typhoon" | "groq" | "mistral", agentId?: string): string | null {
    this.refresh();
    const now = Date.now();
    
    let keyList: string[] = [];
    if (provider === "gemini") keyList = config.geminiApiKeys;
    else if (provider === "claude") keyList = config.claudeApiKeys;
    else if (provider === "openai") keyList = config.openaiApiKeys;
    else if (provider === "openrouter") keyList = config.openRouterApiKeys;
    else if (provider === "deepseek") keyList = config.deepSeekApiKeys;
    else if (provider === "typhoon") keyList = config.typhoonApiKeys;
    else if (provider === "groq") keyList = config.groqApiKeys;
    else if (provider === "mistral") keyList = config.mistralApiKeys;

    if (keyList.length === 0) return null;

    const available = keyList
      .map(k => this.states.get(k)!)
      .filter(s => s && s.exhaustedUntil < now);

    if (available.length === 0) return null;

    // Load balancing: pick the one that was used longest ago (lastUsedAt)
    available.sort((a, b) => a.lastUsedAt - b.lastUsedAt);
    const picked = available[0];
    
    picked.useCount++;
    picked.lastUsedAt = now;
    
    if (agentId) {
      this.lastIssued.set(agentId, picked.key);
    }
    
    // Save every 10 uses to avoid too much disk I/O, or if it's the first use
    if (picked.useCount % 10 === 0 || picked.useCount === 1) {
      this.save();
    }
    
    return picked.key;
  }
  
  getAvailableKey(provider: "gemini" | "openai" | "claude" | "openrouter" | "deepseek" | "typhoon" | "groq" | "mistral"): string | null {
    this.refresh();
    const now = Date.now();
    
    let keyList: string[] = [];
    if (provider === "gemini") keyList = config.geminiApiKeys;
    else if (provider === "claude") keyList = config.claudeApiKeys;
    else if (provider === "openai") keyList = config.openaiApiKeys;
    else if (provider === "openrouter") keyList = config.openRouterApiKeys;
    else if (provider === "deepseek") keyList = config.deepSeekApiKeys;
    else if (provider === "typhoon") keyList = config.typhoonApiKeys;
    else if (provider === "groq") keyList = config.groqApiKeys;
    else if (provider === "mistral") keyList = config.mistralApiKeys;

    if (keyList.length === 0) return null;

    const available = keyList
      .map(k => this.states.get(k)!)
      .filter(s => s && s.exhaustedUntil < now);

    if (available.length === 0) return null;
    return available[0].key;
  }

  hasAvailableKeys(provider: "gemini" | "openai" | "claude" | "openrouter" | "deepseek" | "typhoon" | "groq" | "mistral"): boolean {
    this.refresh();
    const now = Date.now();
    
    let keyList: string[] = [];
    if (provider === "gemini") keyList = config.geminiApiKeys;
    else if (provider === "claude") keyList = config.claudeApiKeys;
    else if (provider === "openai") keyList = config.openaiApiKeys;
    else if (provider === "openrouter") keyList = config.openRouterApiKeys;
    else if (provider === "deepseek") keyList = config.deepSeekApiKeys;
    else if (provider === "typhoon") keyList = config.typhoonApiKeys;
    else if (provider === "groq") keyList = config.groqApiKeys;
    else if (provider === "mistral") keyList = config.mistralApiKeys;

    return keyList.some(k => {
      const s = this.states.get(k);
      return !s || s.exhaustedUntil < now;
    });
  }

  reportFailure(agentId: string) {
    const key = this.lastIssued.get(agentId);
    if (key) {
      this.markExhausted(key);
      this.lastIssued.delete(agentId);
    }
  }

  markExhausted(key: string, durationMs: number = 1000 * 60 * 60) { // Default 1 hour
    const state = this.states.get(key);
    if (state) {
      console.warn(`[KeyManager] Marking key as exhausted for ${durationMs / 1000}s: ${key.slice(0, 10)}...`);
      state.exhaustedUntil = Date.now() + durationMs;
      state.failCount++;
      this.save();
    }
  }

  resetAll() {
    for (const state of this.states.values()) {
      state.exhaustedUntil = 0;
    }
    this.save();
  }

  getSummary() {
    this.refresh();
    const now = Date.now();
    return Array.from(this.states.values()).map(s => {
      let provider = "unknown";
      if (config.geminiApiKeys.includes(s.key)) provider = "gemini";
      else if (config.claudeApiKeys.includes(s.key)) provider = "claude";
      else if (config.openaiApiKeys.includes(s.key)) provider = "openai";
      else if (config.openRouterApiKeys.includes(s.key)) provider = "openrouter";
      else if (config.deepSeekApiKeys.includes(s.key)) provider = "deepseek";
      else if (config.typhoonApiKeys.includes(s.key)) provider = "typhoon";
      else if (config.groqApiKeys.includes(s.key)) provider = "groq";
      else if (config.mistralApiKeys.includes(s.key)) provider = "mistral";

      return {
        key: s.key,
        keyPrefix: s.key.slice(0, 10) + "...",
        provider,
        isBlacklisted: s.exhaustedUntil > now,
        exhaustedUntil: s.exhaustedUntil,
        remainingMs: Math.max(0, s.exhaustedUntil - now),
        useCount: s.useCount,
        failCount: s.failCount,
        lastUsedAt: s.lastUsedAt
      };
    });
  }
}

export const keyManager = new KeyManager();
