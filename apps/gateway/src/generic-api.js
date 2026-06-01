import "dotenv/config";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// Using built-in fetch from Node 18+

const providerArg = process.argv[2];
const prompt = process.argv[3];

let provider = providerArg;

// Smart Router: Automatic selection based on health and priority
const SMART_QUEUE = ["gemini", "groq", "typhoon", "mistral", "claude", "openai"];

// Dynamic mapping for coder CLI tools or generic providers
if (provider === 'smart' || provider === 'aider' || provider === 'opencode' || provider === 'claude-code') {
  provider = 'smart';
}

function getKeysForProvider(p) {
  let envVal = '';
  if (p === 'gemini') envVal = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  else if (p === 'claude') envVal = process.env.CLAUDE_API_KEYS || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || '';
  else if (p === 'openai') envVal = process.env.OPENAI_API_KEYS || process.env.OPENAI_API_KEY || '';
  else if (p === 'openrouter') envVal = process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || '';
  else if (p === 'deepseek') envVal = process.env.DEEPSEEK_API_KEYS || process.env.DEEPSEEK_API_KEY || '';
  else if (p === 'typhoon') envVal = process.env.TYPHOON_API_KEYS || process.env.TYPHOON_API_KEY || '';
  else if (p === 'groq' || p === 'groq-reasoner') envVal = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
  else if (p === 'mistral') envVal = process.env.MISTRAL_API_KEYS || process.env.MISTRAL_API_KEY || '';

  if (!envVal) return [];
  return envVal.split(',').map(k => k.trim()).filter(Boolean);
}

const CONFIGS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile'
  },
  'groq-reasoner': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'deepseek-r1-distill-llama-70b'
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
    model: 'deepseek-chat'
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
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    model: 'gemini-2.5-flash'
  }
};

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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  // Build the fallback queue
  const queue = provider === 'smart' ? SMART_QUEUE : [provider];
  const candidates = SMART_QUEUE;
  for (const c of candidates) {
    if (!queue.includes(c)) {
      queue.push(c);
    }
  }
  const errors = [];

  for (const p of queue) {
    const cfg = CONFIGS[p];
    if (!cfg) continue;

    const keys = getKeysForProvider(p);
    if (keys.length === 0) continue;

    let providerSucceeded = false;

    for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
      const currentKey = keys[keyIdx];
      const maskedKey = currentKey.slice(0, 10) + '...' + currentKey.slice(-5);
      
      // Attempt up to 2 times per key for transient errors (503/429)
      for (let attempt = 1; attempt <= 2; attempt++) {
        console.error(`[Smart Router] ${p} (Attempt ${attempt}) with key [${keyIdx}]: ${maskedKey}`);

        try {
          let response;
          const timeoutMs = 120000; 

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
                max_tokens: 8192,
                messages: [{ role: 'user', content: prompt }]
              })
            }, timeoutMs);
          } else if (p === 'gemini') {
            const urlWithKey = `${cfg.url}?key=${currentKey}`;
            response = await fetchWithTimeout(urlWithKey, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  maxOutputTokens: 8192,
                  temperature: 0.7
                }
              })
            }, timeoutMs);
          } else {
            // OpenAI-compatible
            response = await fetchWithTimeout(cfg.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentKey}`
              },
              body: JSON.stringify({
                model: cfg.model,
                max_tokens: 8192,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
              })
            }, timeoutMs);
          }

          if (!response.ok) {
            const errText = await response.text();
            const errDesc = `HTTP ${response.status}: ${errText.slice(0, 500)}`;
            
            // If it's a 402 (balance) or 401 (auth), don't retry this key
            if (response.status === 402 || response.status === 401) {
               console.error(`[Smart Router] Permanent failure for key: ${errDesc}`);
               break; 
            }
            
            // If it's a 503 or 429, wait and retry once
            if (response.status === 503 || response.status === 429) {
               console.error(`[Smart Router] Transient error: ${errDesc}. Sleeping...`);
               await sleep(2000 * attempt);
               continue;
            }

            console.error(`[Smart Router] Key [${keyIdx}] failed: ${errDesc}`);
            errors.push({ provider: p, keyIndex: keyIdx, error: errDesc });
            break; 
          }

          const data = await response.json();

          if (p === 'claude') {
            if (data.content && data.content[0] && data.content[0].text) {
              process.stdout.write(data.content[0].text);
              providerSucceeded = true;
              break;
            }
          } else if (p === 'gemini') {
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
              process.stdout.write(data.candidates[0].content.parts[0].text);
              providerSucceeded = true;
              break;
            }
          } else {
            if (data.choices && data.choices[0]?.message?.content) {
              process.stdout.write(data.choices[0].message.content);
              providerSucceeded = true;
              break;
            }
          }
          
          const errDesc = "Malformed response";
          console.error(`[Smart Router] Malformed response for ${p}`);
          errors.push({ provider: p, keyIndex: keyIdx, error: errDesc });
          break;

        } catch (err) {
          const errDesc = `Error: ${err.message}`;
          console.error(`[Smart Router] Crash: ${errDesc}`);
          if (attempt === 1) await sleep(1000);
          else {
            errors.push({ provider: p, keyIndex: keyIdx, error: errDesc });
            break;
          }
        }
      }
      if (providerSucceeded) break;
    }

    if (providerSucceeded) return;
  }

  console.error("[Failover Engine] CRITICAL: All API providers failed.");
  process.stdout.write(`CRITICAL: All API providers failed. Errors: ${errors.map(e => `${e.provider}: ${e.error}`).join(' | ')}`);
  process.exit(1);
}


run();
