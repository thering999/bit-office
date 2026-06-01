import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuidv4 } from "uuid";
export class VectorMemory {
    client;
    collectionName = "agent_memory";
    apiKey;
    geminiKey;
    constructor() {
        this.apiKey = process.env.QDRANT_API_KEY || "";
        this.geminiKey = process.env.GEMINI_API_KEY || "";
        const rawHost = process.env.QDRANT_HOST || "localhost";
        const rawPort = process.env.QDRANT_PORT || "6333";
        // Sanitize: strip any non-ASCII characters that might have been accidentally injected
        const sanitize = (s) => s.replace(/[^\x00-\x7F]/g, "").trim();
        const host = sanitize(rawHost) || "localhost";
        const port = sanitize(rawPort) || "6333";
        let url = process.env.QDRANT_URL || `http://${host}:${port}`;
        try {
            // Final validation
            new URL(url);
        }
        catch (e) {
            console.error(`[VectorMemory] Invalid QDRANT_URL detected: "${url}". Falling back to http://localhost:6333`);
            url = "http://localhost:6333";
        }
        this.client = new QdrantClient({
            url,
            apiKey: this.apiKey,
            checkCompatibility: false,
        });
        console.log(`[VectorMemory] Instance created. Host: ${host}, Port: ${port}`);
    }
    async init() {
        console.log("[VectorMemory] Initialization started...");
        console.log("[VectorMemory] Connecting to Qdrant...");
        try {
            const collections = await this.client.getCollections();
            console.log(`[VectorMemory] Current collections:`, collections.collections.map((c) => c.name));
            const exists = collections.collections.some((c) => c.name === this.collectionName);
            if (!exists) {
                console.log(`[VectorMemory] Creating collection: ${this.collectionName}`);
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: 768, // Gemini embedding size (text-embedding-004)
                        distance: "Cosine",
                    },
                });
            }
        }
        catch (err) {
            console.error("[VectorMemory] Failed to init Qdrant:", err);
        }
    }
    async addEntry(text, metadata) {
        if (!this.geminiKey)
            return;
        try {
            const embedding = await this.getEmbedding(text);
            if (!embedding)
                return;
            await this.client.upsert(this.collectionName, {
                wait: true,
                points: [
                    {
                        id: uuidv4(),
                        vector: embedding,
                        payload: {
                            text,
                            projectId: process.env.BIT_OFFICE_PROJECT_ID || "default",
                            consolidated: false,
                            ...metadata,
                            timestamp: Date.now(),
                        },
                    },
                ],
            });
        }
        catch (err) {
            if (err.status === 404) {
                console.warn("[VectorMemory] Collection missing, re-initializing...");
                await this.init();
                // Retry once
                return this.addEntry(text, metadata);
            }
            console.error("[VectorMemory] Failed to add entry:", err);
        }
    }
    async search(query, limit = 5, filter, crossProject = false) {
        if (!this.geminiKey)
            return [];
        try {
            const embedding = await this.getEmbedding(query);
            if (!embedding)
                return [];
            // If not cross-project, filter by current project
            const finalFilter = filter || {};
            if (!crossProject) {
                const projectId = process.env.BIT_OFFICE_PROJECT_ID || "default";
                if (!finalFilter.must)
                    finalFilter.must = [];
                finalFilter.must.push({ key: "projectId", match: { value: projectId } });
            }
            const results = await this.client.search(this.collectionName, {
                vector: embedding,
                limit,
                filter: finalFilter,
                with_payload: true,
            });
            return results.map((r) => ({
                text: r.payload.text,
                metadata: r.payload,
                score: r.score,
            }));
        }
        catch (err) {
            if (err.status === 404) {
                console.warn("[VectorMemory] Collection missing during search, re-initializing...");
                await this.init();
                return []; // Skip search this time to avoid infinite loop, or retry if safe
            }
            console.error("[VectorMemory] Search failed:", err);
            return [];
        }
    }
    async getEmbedding(text) {
        if (!this.geminiKey)
            return null;
        // Simple fetch to Gemini embedding API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${this.geminiKey}`;
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "models/gemini-embedding-001",
                    content: { parts: [{ text }] },
                    outputDimensionality: 768,
                }),
            });
            const data = await resp.json();
            if (resp.status === 429) {
                console.error("[VectorMemory] Gemini Embedding Quota Exceeded (429)");
                return null;
            }
            if (!data.embedding || !data.embedding.values) {
                console.warn("[VectorMemory] Embedding response missing values:", data);
                return null;
            }
            return data.embedding.values;
        }
        catch (err) {
            console.error("[VectorMemory] Embedding network error:", err);
            return null;
        }
    }
    async getRecallContext(query, limit = 3) {
        const results = await this.search(query, limit);
        if (results.length === 0)
            return "";
        return `\n### COGNITIVE RECALL: Similar Past Tasks (Project Specific)\n` +
            results.map((r, i) => {
                const meta = r.metadata;
                return `[RECALL ${i + 1}]
- TASK: ${r.text.slice(0, 300)}...
- OUTCOME: ${meta?.outcome || "unknown"}
- SUMMARY: ${meta?.summary?.slice(0, 300) || "none"}...`;
            }).join("\n\n") + "\n";
    }
    async getOmniContext(query, limit = 2) {
        // Search specifically for 'insight' types across ALL projects
        const results = await this.search(query, limit, {
            must: [{ key: "type", match: { value: "insight" } }]
        }, true);
        if (results.length === 0)
            return "";
        return `\n### OMNI-RECALL: Cross-Project Insights\n` +
            results.map((r, i) => {
                const meta = r.metadata;
                return `[INSIGHT ${i + 1}]
- TOPIC: ${meta?.title || "Collective Intelligence"}
- CONTENT: ${r.text}
- TAGS: ${meta?.tags?.join(", ") || "none"}`;
            }).join("\n\n") + "\n";
    }
    /**
     * Provides a combined memory context for injection into agent prompts.
     * Merges project-local recalls, cross-project Omni-Insights, and successful swarm experiences.
     */
    async getEnhancedMemoryContext(query) {
        const [localContext, omniContext, swarmExperience] = await Promise.all([
            this.getRecallContext(query, 3),
            this.getOmniContext(query, 2),
            this.getSwarmExperienceContext(query, 2),
        ]);
        if (!localContext && !omniContext && !swarmExperience)
            return "";
        return "\n=== SWARM MEMORY CONTEXT ===" + localContext + omniContext + swarmExperience + "===========================\n";
    }
    async getSwarmExperienceContext(query, limit = 2) {
        // Search for successful experiences across ALL projects
        const results = await this.search(query, limit, {
            must: [
                { key: "type", match: { value: "experience" } },
                { key: "success", match: { value: true } }
            ]
        }, true);
        if (results.length === 0)
            return "";
        return `\n### SWARM EXPERIENCE: Successful patterns from other agents\n` +
            results.map((r, i) => {
                const meta = r.metadata;
                return `[EXPERIENCE ${i + 1}]
- TASK: ${meta?.prompt || "unknown"}
- SOLUTION: ${r.text.slice(0, 500)}...
- AGENT: ${meta?.agentId || "unknown"}`;
            }).join("\n\n") + "\n";
    }
    /**
     * Prune consolidated entries older than a given threshold (ms).
     * Keeps the vector DB lean and relevant for future queries.
     */
    async pruneOldEntries(maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
        const cutoff = Date.now() - maxAgeMs;
        try {
            const results = await this.client.scroll(this.collectionName, {
                filter: { must: [{ key: "consolidated", match: { value: true } }] },
                limit: 100,
                with_payload: true,
            });
            const oldIds = results.points
                .filter(p => p.payload?.timestamp < cutoff)
                .map(p => p.id);
            if (oldIds.length > 0) {
                await this.client.delete(this.collectionName, { points: oldIds });
                console.log(`[VectorMemory] Pruned ${oldIds.length} old entries.`);
            }
            return oldIds.length;
        }
        catch (err) {
            console.error("[VectorMemory] Pruning failed:", err);
            return 0;
        }
    }
    async getUnconsolidatedEntries(limit = 10) {
        try {
            const results = await this.client.scroll(this.collectionName, {
                filter: {
                    must: [{ key: "consolidated", match: { value: false } }],
                },
                limit,
                with_payload: true,
            });
            return results.points.map((p) => ({
                id: p.id,
                text: p.payload.text,
                metadata: p.payload,
            }));
        }
        catch (err) {
            console.error("[VectorMemory] Failed to get unconsolidated entries:", err);
            return [];
        }
    }
    async markAsConsolidated(ids) {
        const validIds = ids.filter(id => id !== undefined && id !== null);
        if (validIds.length === 0)
            return;
        try {
            await this.client.setPayload(this.collectionName, {
                payload: { consolidated: true },
                points: validIds,
            });
        }
        catch (err) {
            console.error("[VectorMemory] Failed to mark as consolidated:", err);
        }
    }
    async summarize(text, systemPrompt) {
        if (!this.geminiKey)
            return "";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiKey}`;
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ parts: [{ text }] }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 500,
                    },
                }),
            });
            const data = await resp.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
        catch (err) {
            console.error("[VectorMemory] Summarization failed:", err);
            return "";
        }
    }
    async addExperience(agentId, taskId, prompt, output, success) {
        await this.addEntry(output, {
            agentId,
            taskId,
            prompt,
            success,
            type: "experience"
        });
    }
    async consolidate() {
        const entries = await this.getUnconsolidatedEntries(5);
        if (entries.length === 0)
            return [];
        const insights = [];
        // Group entries by topic/prompt similarity would be ideal, 
        // but for now we'll process them in a batch to synthesize a "lesson learned".
        const textToConsolidate = entries.map(e => `Prompt: ${e.metadata?.prompt ?? "unknown"}\nOutput: ${e.text}`).join("\n\n---\n\n");
        const systemPrompt = `You are the Swarm Historian. 
Your task is to synthesize multiple recent task experiences into a single, high-level "Knowledge Insight".
Focus on:
1. Technical patterns that worked or failed.
2. Best practices identified.
3. Architecture decisions that should be remembered.

Output JSON:
{
  "title": "Short descriptive title of the insight",
  "content": "Detailed explanation of the lesson learned or pattern identified",
  "tags": ["tag1", "tag2"]
}`;
        const summaryJson = await this.summarize(textToConsolidate, systemPrompt);
        try {
            const parsed = JSON.parse(summaryJson.match(/\{[\s\S]*\}/)?.[0] || "{}");
            if (parsed.title && parsed.content) {
                const insight = {
                    id: uuidv4(),
                    title: parsed.title,
                    content: parsed.content,
                    tags: parsed.tags || []
                };
                insights.push(insight);
                // Mark these entries as consolidated so we don't process them again
                await this.markAsConsolidated(entries.map(e => e.id));
                // Also save the insight itself back to the memory (as a high-level entry)
                await this.addEntry(insight.content, {
                    type: "insight",
                    title: insight.title,
                    tags: insight.tags,
                    consolidated: true // Insights are already consolidated
                });
            }
        }
        catch (e) {
            console.error("[VectorMemory] Consolidation parsing failed:", e);
        }
        return insights;
    }
}
export const vectorMemory = new VectorMemory();
//# sourceMappingURL=vector-memory.js.map