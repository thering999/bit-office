// ---------------------------------------------------------------------------
// OutputParser — parses structured fields and summaries from agent CLI output.
//
// Agents produce output with structured fields (SUMMARY, FILES_CHANGED,
// ENTRY_FILE, etc.) and free-form text. This module extracts both into a
// typed result object.
// ---------------------------------------------------------------------------
import { CONFIG } from "./config.js";
/**
 * Parse agent stdout for structured result fields.
 * Falls back to a cleaned-up excerpt of the raw output for the summary.
 */
export function parseAgentOutput(raw, fallbackText) {
    const text = raw || fallbackText || "";
    const fullOutput = text;
    // Extract structured fields from worker output format
    const summaryMatch = text.match(/SUMMARY:\s*(.+)/i);
    const filesMatch = text.match(/FILES_CHANGED:\s*(.+)/i);
    const entryFileMatch = text.match(/ENTRY_FILE:\s*(.+)/i);
    const projectDirMatch = text.match(/PROJECT_DIR:\s*(.+)/i);
    const previewCmdMatch = text.match(/PREVIEW_CMD:\s*(.+)/i);
    const previewPortMatch = text.match(/PREVIEW_PORT:\s*[*`_]*(\d+)/i);
    const modulesMatch = text.match(/MODULES:\s*(.+)/i);
    const featuresMatch = text.match(/FEATURES:\s*(.+)/i);
    // Strip markdown formatting (bold, backticks, italic) that leaders copy from dev output
    const stripMarkdown = (v) => v.replace(/\*\*/g, "").replace(/`/g, "").replace(/^_+|_+$/g, "").trim();
    const changedFiles = [];
    if (filesMatch) {
        const fileList = filesMatch[1].trim();
        for (const f of fileList.split(/[,\n]+/)) {
            const cleaned = stripMarkdown(f.trim().replace(/^[-*]\s*/, ""));
            if (cleaned)
                changedFiles.push(cleaned);
        }
    }
    const modules = [];
    if (modulesMatch) {
        const list = modulesMatch[1].trim();
        for (const m of list.split(/[,\n]+/)) {
            const cleaned = stripMarkdown(m.trim().replace(/^[-*]\s*/, ""));
            if (cleaned)
                modules.push(cleaned);
        }
    }
    const features = [];
    if (featuresMatch) {
        const list = featuresMatch[1].trim();
        for (const f of list.split(/[,\n]+/)) {
            const cleaned = stripMarkdown(f.trim().replace(/^[-*]\s*/, ""));
            if (cleaned)
                features.push(cleaned);
        }
    }
    // Filter out placeholder values that agents hallucinate
    const isPlaceholder = (v) => !v || /^[\[(].*not provided.*[\])]$/i.test(v) || /^[\[(].*n\/?a.*[\])]$/i.test(v) || /^none$/i.test(v);
    const rawEntry = entryFileMatch?.[1]?.trim();
    const rawDir = projectDirMatch?.[1]?.trim();
    const rawCmd = previewCmdMatch?.[1]?.trim();
    const entryFile = isPlaceholder(rawEntry) ? undefined : stripMarkdown(rawEntry);
    const projectDir = isPlaceholder(rawDir) ? undefined : stripMarkdown(rawDir);
    const previewCmd = isPlaceholder(rawCmd) ? undefined : stripMarkdown(rawCmd);
    const previewPort = previewPortMatch ? parseInt(previewPortMatch[1], 10) : undefined;
    if (summaryMatch) {
        return { summary: summaryMatch[1].trim(), fullOutput, changedFiles, entryFile, projectDir, previewCmd, previewPort, modules, features };
    }
    // No structured SUMMARY — extract the most meaningful part
    const summary = extractFallbackSummary(text, changedFiles.length > 0, entryFile, projectDir);
    return { summary, fullOutput, changedFiles, entryFile, projectDir, previewCmd, previewPort, modules, features };
}
/**
 * Extract a human-readable summary from raw output when no SUMMARY field is present.
 * Filters out delegation lines, system noise, and returns the first meaningful content.
 */
function extractFallbackSummary(raw, _hasFiles, _entryFile, _projectDir) {
    const lines = raw.split("\n").filter(l => l.trim());
    const delegationRe = /^@(\w+):/;
    const noisePatterns = [
        /^STATUS:\s/i,
        /^FILES_CHANGED:\s/i,
        /^SUMMARY:\s/i,
        /^\[Assigned by /,
        /^mcp\s/i,
        /^╔|^║|^╚/,
        /^\s*[-*]{3,}\s*$/,
    ];
    const delegationTargets = [];
    const meaningful = [];
    for (const l of lines) {
        const trimmed = l.trim();
        const dm = trimmed.match(delegationRe);
        if (dm) {
            delegationTargets.push(dm[1]);
        }
        else if (!noisePatterns.some(p => p.test(trimmed))) {
            meaningful.push(l);
        }
    }
    // If output is primarily delegations (leader), summarize the delegation targets
    if (meaningful.length === 0 && delegationTargets.length > 0) {
        return `Delegated tasks to ${delegationTargets.join(", ")}`;
    }
    const firstChunk = meaningful.slice(0, CONFIG.limits.fallbackSummaryLines).join("\n").trim();
    return firstChunk.slice(0, CONFIG.limits.fallbackSummaryChars) || "Task completed";
}
//# sourceMappingURL=output-parser.js.map