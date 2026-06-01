import { defineConfig } from "tsup";
import { builtinModules } from "node:module";

const bundleAll = !!process.env.BUNDLE_ALL;

// Inject createRequire so CJS deps (ws, ably) can require() Node builtins in ESM bundle
const requireShim = 'import { createRequire as __cr } from "node:module"; const require = __cr(import.meta.url);';

export default defineConfig({
  entry: ["src/index.ts", "src/generic-api.js", "src/mock-ai.js"],
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  clean: true,
  splitting: false,
  sourcemap: true,
  noExternal: ["@office/shared", "@bit-office/orchestrator", "ws", "ably", "dotenv", "nanoid", "node-telegram-bot-api", "uuid", "@qdrant/js-client-rest"],
  external: bundleAll 
    ? builtinModules.flatMap((m) => [m, `node:${m}`]) 
    : ["playwright", "playwright-core"],
  banner: {
    js: `#!/usr/bin/env node\n${requireShim}`,
  },
});
