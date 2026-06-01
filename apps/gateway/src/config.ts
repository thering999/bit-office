import "dotenv/config";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { randomBytes } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const CONFIG_DIR = resolve(homedir(), ".bit-office");
const CONFIG_FILE = resolve(CONFIG_DIR, "config.json");

interface SavedConfig {
  ablyApiKey?: string;
  telegramBotTokens?: (string | null)[];
  detectedBackends?: string[];
  defaultBackend?: string;
  sandboxMode?: "full" | "safe";
  customBackends?: { id: string; name: string; command: string; color?: string }[];
  geminiApiKeys?: string[];
  claudeApiKeys?: string[];
  openaiApiKeys?: string[];
  openRouterApiKeys?: string[];
  openaiApiKey?: string;
  openRouterApiKey?: string;
  deepSeekApiKeys?: string[];
  typhoonApiKeys?: string[];
  groqApiKeys?: string[];
  mistralApiKeys?: string[];
  deepSeekApiKey?: string;
  serpApiKey?: string;
  pineconeApiKey?: string;
  zepApiKey?: string;
  typhoonApiKey?: string;
  groqApiKey?: string;
  mistralApiKey?: string;
  qdrantApiKey?: string;
  postmanApiKey?: string;
  ollamaUrl?: string;
  qdrantUrl?: string;
}

function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function loadSavedConfig(): SavedConfig {
  if (!existsSync(CONFIG_FILE)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function saveConfig(updates: Partial<SavedConfig>) {
  ensureConfigDir();
  const current = loadSavedConfig();
  const merged = { ...current, ...updates };
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), "utf-8");
}

export function hasSetupRun(): boolean {
  return existsSync(CONFIG_FILE);
}

function getOrCreateMachineId(): string {
  ensureConfigDir();
  const idFile = resolve(CONFIG_DIR, "machine-id");

  if (existsSync(idFile)) {
    return readFileSync(idFile, "utf-8").trim();
  }

  const id = `mac-${randomBytes(4).toString("hex")}`;
  writeFileSync(idFile, id, "utf-8");
  console.log(`[Config] Generated machine ID: ${id}`);
  return id;
}

function resolveWebDir(): string {
  if (process.env.WEB_DIR) return process.env.WEB_DIR;
  // Bundled mode: dist/web (next to dist/index.js)
  const bundled = resolve(__dirname, "web");
  if (existsSync(resolve(bundled, "index.html"))) return bundled;
  // Dev mode: apps/web/out (relative to apps/gateway/src/)
  return resolve(__dirname, "../../web/out");
}

function resolveDefaultWorkspace(): string {
  const isDev = process.env.NODE_ENV === "development";
  if (isDev) {
    // Dev mode (pnpm dev:gateway): use .workspace dir to avoid working in source tree
    const ws = resolve(__dirname, "../.workspace");
    if (!existsSync(ws)) {
      mkdirSync(ws, { recursive: true });
      console.log(`[Config] Created default workspace: ${ws}`);
    }
    return ws;
  }
  // Published mode (npx bit-office): use the directory where the user ran the command
  // Tauri sidecar runs with cwd="/", fall back to home directory
  const cwd = process.cwd();
  if (cwd === "/" || cwd === "C:\\") {
    return process.env.HOME || homedir();
  }
  return cwd;
}

function buildConfig() {
  const saved = loadSavedConfig();
  const baseConfig = {
    machineId: getOrCreateMachineId(),
    defaultWorkspace: (() => {
      const envWs = process.env.WORKSPACE;
      if (envWs && existsSync(envWs)) {
        console.log(`[Config] Using WORKSPACE from environment: ${envWs}`);
        return envWs;
      }
      if (envWs) {
        console.error(`[Config] CRITICAL ERROR: WORKSPACE="${envWs}" does not exist in this environment (likely a Windows vs Docker path mismatch).`);
      }
      const defaultWs = resolveDefaultWorkspace();
      console.log(`[Config] Falling back to default workspace: ${defaultWs}`);
      return defaultWs;
    })(),
    wsPort: Number(process.env.WS_PORT) || 9090,
    ablyApiKey: process.env.ABLY_API_KEY || saved.ablyApiKey || undefined,
    webDir: resolveWebDir(),
    telegramBotTokens: (
      process.env.TELEGRAM_BOT_TOKENS
        ? process.env.TELEGRAM_BOT_TOKENS.split(",").map((t) => t.trim() || undefined)
        : (saved.telegramBotTokens ?? []).map((t) => t || undefined)
    ) as (string | undefined)[],
    detectedBackends: saved.detectedBackends ?? [],
    defaultBackend: saved.defaultBackend ?? "claude",
    sandboxMode: (saved.sandboxMode ?? "full") as "full" | "safe",
    geminiApiKeys: (() => {
      const env = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
      if (env) return env.split(",").map(k => k.trim()).filter(Boolean);
      return saved.geminiApiKeys ?? [];
    })(),
    claudeApiKeys: (() => {
      const env = process.env.CLAUDE_API_KEYS || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "";
      if (env) return env.split(",").map(k => k.trim()).filter(Boolean);
      return saved.claudeApiKeys ?? [];
    })(),
    openaiApiKeys: (() => {
      const env = process.env.OPENAI_API_KEYS || process.env.OPENAI_API_KEY || "";
      if (env) return env.split(",").map(k => k.trim()).filter(Boolean);
      return saved.openaiApiKeys ?? (saved.openaiApiKey ? [saved.openaiApiKey] : []);
    })(),
    openRouterApiKeys: (() => {
      const env = process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || "";
      if (env) return env.split(",").map(k => k.trim()).filter(Boolean);
      return saved.openRouterApiKeys ?? (saved.openRouterApiKey ? [saved.openRouterApiKey] : []);
    })(),
    openaiApiKey: process.env.OPENAI_API_KEY || saved.openaiApiKey || undefined,
    openRouterApiKey: process.env.OPENROUTER_API_KEY || saved.openRouterApiKey || undefined,
    deepSeekApiKeys: (() => {
      const env = process.env.DEEPSEEK_API_KEYS || process.env.DEEPSEEK_API_KEY || "";
      if (env) return env.split(",").map(k => k.trim()).filter(Boolean);
      return saved.deepSeekApiKeys ?? (saved.deepSeekApiKey ? [saved.deepSeekApiKey] : []);
    })(),
    typhoonApiKeys: (() => {
      const env = process.env.TYPHOON_API_KEYS || process.env.TYPHOON_API_KEY || "";
      if (env) return env.split(",").map(k => k.trim()).filter(Boolean);
      return saved.typhoonApiKeys ?? (saved.typhoonApiKey ? [saved.typhoonApiKey] : []);
    })(),
    groqApiKeys: (() => {
      const env = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
      if (env) return env.split(",").map(k => k.trim()).filter(Boolean);
      return saved.groqApiKeys ?? (saved.groqApiKey ? [saved.groqApiKey] : []);
    })(),
    mistralApiKeys: (() => {
      const env = process.env.MISTRAL_API_KEYS || process.env.MISTRAL_API_KEY || "";
      if (env) return env.split(",").map(k => k.trim()).filter(Boolean);
      return saved.mistralApiKeys ?? (saved.mistralApiKey ? [saved.mistralApiKey] : []);
    })(),
    deepSeekApiKey: process.env.DEEPSEEK_API_KEY || saved.deepSeekApiKey || undefined,
    serpApiKey: process.env.SERPAPI_API_KEY || saved.serpApiKey || undefined,
    pineconeApiKey: process.env.PINECONE_API_KEY || saved.pineconeApiKey || undefined,
    zepApiKey: process.env.ZEP_API_KEY || saved.zepApiKey || undefined,
    typhoonApiKey: process.env.TYPHOON_API_KEY || saved.typhoonApiKey || undefined,
    groqApiKey: process.env.GROQ_API_KEY || saved.groqApiKey || undefined,
    mistralApiKey: process.env.MISTRAL_API_KEY || saved.mistralApiKey || undefined,
    qdrantApiKey: process.env.QDRANT_API_KEY || saved.qdrantApiKey || undefined,
    postmanApiKey: process.env.POSTMAN_API_KEY || saved.postmanApiKey || undefined,
  };

  // Sanitize QDRANT_HOST to prevent crashes from corrupted env vars
  const rawHost = process.env.QDRANT_HOST || "localhost";
  const sanitize = (s: string) => s.replace(/[^\x00-\x7F]/g, "").trim();
  const host = sanitize(rawHost) || "localhost";
  const port = process.env.QDRANT_PORT || "6333";
  const qdrantUrl = process.env.QDRANT_URL || `http://${host}:${port}`;

  // Inject loaded keys into process.env to ensure they are available for all spawned agent child processes
  if (baseConfig.geminiApiKeys.length > 0) {
    process.env.GEMINI_API_KEYS = baseConfig.geminiApiKeys.join(",");
    if (!process.env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = baseConfig.geminiApiKeys[0];
  }
  if (baseConfig.claudeApiKeys.length > 0) {
    process.env.CLAUDE_API_KEYS = baseConfig.claudeApiKeys.join(",");
    if (!process.env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = baseConfig.claudeApiKeys[0];
  }
  if (baseConfig.openaiApiKeys.length > 0) {
    process.env.OPENAI_API_KEYS = baseConfig.openaiApiKeys.join(",");
    if (!process.env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = baseConfig.openaiApiKeys[0];
  }
  if (baseConfig.openRouterApiKeys.length > 0) {
    process.env.OPENROUTER_API_KEYS = baseConfig.openRouterApiKeys.join(",");
    if (!process.env.OPENROUTER_API_KEY) process.env.OPENROUTER_API_KEY = baseConfig.openRouterApiKeys[0];
  }
  if (baseConfig.deepSeekApiKeys.length > 0) {
    process.env.DEEPSEEK_API_KEYS = baseConfig.deepSeekApiKeys.join(",");
    if (!process.env.DEEPSEEK_API_KEY) process.env.DEEPSEEK_API_KEY = baseConfig.deepSeekApiKeys[0];
  }
  if (baseConfig.typhoonApiKeys.length > 0) {
    process.env.TYPHOON_API_KEYS = baseConfig.typhoonApiKeys.join(",");
    if (!process.env.TYPHOON_API_KEY) process.env.TYPHOON_API_KEY = baseConfig.typhoonApiKeys[0];
  }
  if (baseConfig.groqApiKeys.length > 0) {
    process.env.GROQ_API_KEYS = baseConfig.groqApiKeys.join(",");
    if (!process.env.GROQ_API_KEY) process.env.GROQ_API_KEY = baseConfig.groqApiKeys[0];
  }
  if (baseConfig.mistralApiKeys.length > 0) {
    process.env.MISTRAL_API_KEYS = baseConfig.mistralApiKeys.join(",");
    if (!process.env.MISTRAL_API_KEY) process.env.MISTRAL_API_KEY = baseConfig.mistralApiKeys[0];
  }

  return {
    ...baseConfig,
    ollamaUrl: process.env.OLLAMA_URL || (process.env.OLLAMA_HOST ? `http://${process.env.OLLAMA_HOST}:${process.env.OLLAMA_PORT || 11434}` : saved.ollamaUrl) || "http://localhost:11434",
    qdrantUrl,
    customBackends: (() => {
      const envBackends = process.env.CUSTOM_BACKENDS;
      if (envBackends) {
        // format: id:name:cmd:color,id:name:cmd:color
        const backendsStr = envBackends as string;
        return backendsStr.split(",").map(s => {
          const [id, name, command, color] = s.split(":");
          return { id, name, command, color: color || "#6366f1" };
        });
      }
      return saved.customBackends ?? [];
    })(),
  };
}

export const config = buildConfig();

/** Reload config from saved file (after setup wizard) */
export function reloadConfig() {
  const fresh = buildConfig();
  Object.assign(config, fresh);
}
