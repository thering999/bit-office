import "dotenv/config";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPaths = [
  resolve(__dirname, "../.env"),
  resolve(__dirname, ".env"),
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "apps/gateway/.env")
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const providerArg = process.argv[2];
const prompt = process.argv[3];
let provider = providerArg;

// Smart Router: Balanced queue of high-performance free/cheap providers
const SMART_QUEUE = [
  "freellmapi",      // Local Aggregator (Priority)
  "groq-reasoner",   // DeepSeek R1 via Groq
  "cerebras",        // Ultra-fast Llama 3.1
  "sambanova",       // DeepSeek R1 Distill
  "groq",            // Llama 3.3
  "deepseek",        // Direct R1
  "openrouter",      // Multi-provider
  "gemini",          // Flash 2.0
  "typhoon",         // Thai-optimized
  "mistral",         // Large 3
  "cohere",          // Command R+
  "openai",          // GPT-4o-mini
  "ollama"           // Local fallback
];

if (provider === 'smart' || provider === 'aider' || provider === 'opencode' || provider === 'claude-code') {
  provider = 'smart';
}

/** @param {string} p @returns {string[]} */
const getKeysForProvider = (p) => {
  if (p === 'ollama') return ['local-ollama'];
  if (p === 'freellmapi') return [process.env.FREELLMAPI_KEY || 'freellmapi-default-token'];
  
  let envVal = '';
  const pUpper = p.toUpperCase().replace('-', '_');
  envVal = process.env[`${pUpper}_API_KEYS`] || process.env[`${pUpper}_API_KEY`] || '';
  
  // Specific fallbacks for legacy/common names
  if (!envVal) {
    if (p === 'gemini') envVal = process.env.GOOGLE_API_KEY || '';
    else if (p === 'claude') envVal = process.env.ANTHROPIC_API_KEY || '';
    else if (p === 'groq-reasoner') envVal = process.env.GROQ_API_KEY || '';
  }

  if (!envVal) return [];
  return envVal.split(',').map(k => k.trim()).filter(Boolean);
};

const CONFIGS = {
  freellmapi: {
    url: 'http://host.docker.internal:3001/v1/chat/completions',
    model: 'smart'
  },
  cerebras: {
    url: 'https://api.cerebras.ai/v1/chat/completions',
    model: 'llama3.3-70b'
  },
  sambanova: {
    url: 'https://api.sambanova.ai/v1/chat/completions',
    model: 'DeepSeek-R1-Distill-Llama-70B'
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
  },
  'groq-reasoner': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
  },
  ollama: {
    url: 'http://host.docker.internal:11434/v1/chat/completions',
    model: 'deepseek-r1:8b'
  },
  cohere: {
    url: 'https://api.cohere.ai/v1/chat',
    model: 'command-r-plus'
  },
  mistral: {
    url: 'https://api.mistral.ai/v1/chat/completions',
    model: 'open-mistral-7b'
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'google/gemini-2.0-flash-001'
  },
  deepseek: {
    url: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-reasoner'
  },
  typhoon: {
    url: 'https://api.opentyphoon.ai/v1/chat/completions',
    model: 'typhoon-v2.5-30b-a3b-instruct'
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini'
  },
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-sonnet-20241022'
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    model: 'gemini-2.0-flash'
  }
};

/**
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} [timeout]
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options, timeout = 90000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

/** @param {number} ms @returns {Promise<void>} */
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const queue = provider === 'smart' ? SMART_QUEUE : [provider];
  const errors = [];

  for (const p of queue) {
    const cfg = CONFIGS[p];
    if (!cfg) continue;

    const keys = getKeysForProvider(p);
    if (keys.length === 0) continue;

    for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
      const currentKey = keys[keyIdx];
      
      for (let attempt = 1; attempt <= 2; attempt++) {
        process.stderr.write(`[Smart Router] Trying ${p} (Key ${keyIdx}, Attempt ${attempt})...\n`);

        try {
          let response;
          const timeoutMs = 60000; 

          if (p === 'claude') {
            response = await fetchWithTimeout(cfg.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': currentKey,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: cfg.model,
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }]
              })
            }, timeoutMs);
          } else if (p === 'gemini') {
            const urlWithKey = `${cfg.url}?key=${currentKey}`;
            response = await fetchWithTimeout(urlWithKey, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 4096, temperature: 0.7 }
              })
            }, timeoutMs);
          } else if (p === 'cohere') {
            response = await fetchWithTimeout(cfg.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentKey}`
              },
              body: JSON.stringify({
                model: cfg.model,
                message: prompt,
                connectors: [{ id: 'web-search' }]
              })
            }, timeoutMs);
          } else {
            // OpenAI-compatible
            const headers = { 'Content-Type': 'application/json' };
            if (p !== 'ollama') {
              headers['Authorization'] = `Bearer ${currentKey}`;
            }

            response = await fetchWithTimeout(cfg.url, {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                model: cfg.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 4096,
                stream: false
              })
            }, timeoutMs);
          }

          if (!response.ok) {
            const errText = await response.text();
            const status = response.status;
            process.stderr.write(`[Smart Router] Provider ${p} returned ${status}: ${errText}\n`);
            
            if (status === 402 || status === 401) break; // Permanent fail for this key
            if (status === 503 || status === 429) {
               await sleep(2000 * attempt);
               continue;
            }
            throw new Error(`HTTP ${status}: ${errText}`);
          }

          const data = await response.json();
          let text = '';

          if (p === 'claude') text = data.content?.[0]?.text;
          else if (p === 'gemini') text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          else if (p === 'cohere') text = data.text;
          else text = data.choices?.[0]?.message?.content;

          if (!text) throw new Error("Empty response");

          process.stdout.write(text);
          process.exit(0);

        } catch (err) {
          process.stderr.write(`[Smart Router] ${p} Error: ${err.message}\n`);
          errors.push({ provider: p, error: err.message });
          if (attempt === 1) await sleep(1000);
          else break;
        }
      }
    }
  }

  process.stderr.write(`\n[Smart Router] CRITICAL: Swarm exhausted all providers.\n`);
  process.exit(1);
}

run();
