/**
 * Cloud AI Client
 * Used in GitHub Pages / static mode (no local gateway available).
 * API keys are injected at build time via NEXT_PUBLIC_* env vars.
 * Keys are baked into the static bundle — do NOT use in production for sensitive apps.
 */

// ---- Baked-in keys from GitHub Actions Secrets ----
const BAKED_KEYS = {
  gemini:     process.env.NEXT_PUBLIC_GEMINI_API_KEY     ?? "",
  openrouter: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ?? "",
  deepseek:   process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY   ?? "",
  groq:       process.env.NEXT_PUBLIC_GROQ_API_KEY       ?? "",
  typhoon:    process.env.NEXT_PUBLIC_TYPHOON_API_KEY     ?? "",
  claude:     process.env.NEXT_PUBLIC_CLAUDE_API_KEY      ?? "",
  openai:     process.env.NEXT_PUBLIC_OPENAI_API_KEY      ?? "",
};

/** Get API key (prefers localStorage user key, falls back to baked-in secret) */
function getApiKey(provider: CloudProvider): string {
  if (typeof window === "undefined") return BAKED_KEYS[provider];
  const userKey = localStorage.getItem(`cloud_key_${provider}`);
  return userKey || BAKED_KEYS[provider];
}

export type CloudProvider = keyof typeof BAKED_KEYS;

export interface CloudAIRequest {
  prompt: string;
  provider?: CloudProvider;
  systemPrompt?: string;
}

export interface CloudAIResponse {
  text: string;
  provider: string;
  model: string;
}

const PROVIDER_CONFIGS: Record<string, { url: string; model: string }> = {
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    model: "gemini-2.0-flash",
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
  },
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: "google/gemini-2.0-flash-001",
  },
  deepseek: {
    url: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
  },
  typhoon: {
    url: "https://api.opentyphoon.ai/v1/chat/completions",
    model: "typhoon-v2.5-30b-a3b-instruct",
  },
  claude: {
    url: "https://api.anthropic.com/v1/messages",
    model: "claude-3-5-haiku-20241022",
  },
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
  },
};

/** Smart priority queue — best free/cheap providers first */
const SMART_QUEUE: CloudProvider[] = ["gemini", "groq", "openrouter", "typhoon", "deepseek", "openai", "claude"];

async function callProvider(provider: CloudProvider, prompt: string, systemPrompt?: string): Promise<string> {
  const key = getApiKey(provider);
  if (!key) throw new Error(`No API key for ${provider}`);

  const cfg = PROVIDER_CONFIGS[provider];
  if (!cfg) throw new Error(`Unknown provider ${provider}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    let response: Response;
    const messages = [
      ...(systemPrompt ? [{ role: "system" as const, content: systemPrompt }] : []),
      { role: "user" as const, content: prompt },
    ];

    if (provider === "gemini") {
      const urlWithKey = `${cfg.url}?key=${key}`;
      const parts = systemPrompt
        ? [{ text: `${systemPrompt}\n\n${prompt}` }]
        : [{ text: prompt }];
      response = await fetch(urlWithKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { maxOutputTokens: 4096, temperature: 0.7 },
        }),
        signal: controller.signal,
      });
    } else if (provider === "claude") {
      response = await fetch(cfg.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: 4096,
          messages: messages.filter((m) => m.role !== "system"),
          ...(systemPrompt && { system: systemPrompt }),
        }),
        signal: controller.signal,
      });
    } else {
      // OpenAI-compatible (groq, openrouter, deepseek, typhoon, openai)
      response = await fetch(cfg.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: cfg.model,
          max_tokens: 4096,
          messages,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText.slice(0, 300)}`);
    }

    const data = await response.json();

    if (provider === "gemini") {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Gemini: empty response");
      return text;
    } else if (provider === "claude") {
      const text = data.content?.[0]?.text;
      if (!text) throw new Error("Claude: empty response");
      return text;
    } else {
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error(`${provider}: empty response`);
      return text;
    }
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Smart AI call — tries providers in priority order until one succeeds.
 * If `provider` is specified, tries that first then falls back.
 */
export async function cloudAI(req: CloudAIRequest): Promise<CloudAIResponse> {
  const preferredProvider = req.provider;
  const queue = preferredProvider
    ? [preferredProvider, ...SMART_QUEUE.filter((p) => p !== preferredProvider)]
    : SMART_QUEUE;

  const errors: string[] = [];

  for (const provider of queue) {
    if (!BAKED_KEYS[provider]) continue; // no key, skip
    try {
      const text = await callProvider(provider, req.prompt, req.systemPrompt);
      return { text, provider, model: PROVIDER_CONFIGS[provider]?.model ?? provider };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[cloud-ai] ${provider} failed:`, msg);
      errors.push(`${provider}: ${msg}`);
    }
  }

  throw new Error(`All AI providers failed:\n${errors.join("\n")}`);
}

/** Returns true when running in GitHub Pages / cloud mode (no local gateway) */
export function isCloudMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    process.env.NEXT_PUBLIC_CLOUD_MODE === "true" ||
    window.location.hostname === "thering999.github.io" ||
    window.location.hostname.endsWith(".github.io")
  );
}

/** Check which providers have baked-in keys */
export function getAvailableProviders(): CloudProvider[] {
  return (Object.keys(BAKED_KEYS) as CloudProvider[]).filter(
    (p) => BAKED_KEYS[p].length > 0
  );
}
