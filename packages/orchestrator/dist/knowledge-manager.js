import { existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from "fs";
import path from "path";
import { homedir } from "os";
export class KnowledgeManager {
    baseDir;
    constructor() {
        this.baseDir = path.join(homedir(), ".bit-office", "knowledge");
        if (!existsSync(this.baseDir)) {
            mkdirSync(this.baseDir, { recursive: true });
        }
    }
    /**
     * Saves a structured summary of an agent's work for the project knowledge base.
     * This is designed to be consumed by NotebookLM or used as context for future tasks.
     */
    async documentWork(entry) {
        const projectPath = path.join(this.baseDir, entry.projectDir || "default");
        if (!existsSync(projectPath)) {
            mkdirSync(projectPath, { recursive: true });
        }
        const fileName = `${entry.agentName.toLowerCase()}-${entry.taskId}.md`;
        const filePath = path.join(projectPath, fileName);
        const content = `
# Project Knowledge: ${entry.projectDir}
**Agent:** ${entry.agentName} (${entry.role})
**Task ID:** ${entry.taskId}
**Date:** ${new Date(entry.timestamp).toLocaleString("th-TH")}
**Resilience Mode:** Autonomous Self-Healing Active

## 🎯 Mission Summary / สรุปภารกิจ
${entry.summary}

## 🏗️ Modules Developed / โมดูลที่พัฒนา
${entry.modules.length > 0 ? entry.modules.map(m => `- ${m}`).join("\n") : "None specified."}

## ✨ Features Implemented / ฟีเจอร์ที่ติดตั้ง
${entry.features.length > 0 ? entry.features.map(f => `- ${f}`).join("\n") : "None specified."}

---
**AI Context Metadata:**
- AgentID: ${entry.agentName}
- Project: ${entry.projectDir}
- Schema: NotebookLM-Compatible-v2
- Status: Verified

*Context for future agents: Use this to understand the existing modules and features of this project. / ข้อมูลสำหรับ AI Agent ในอนาคต: ใช้ข้อมูลนี้เพื่อทำความเข้าใจโมดูลและฟีเจอร์ที่มีอยู่แล้วในโปรเจกต์นี้*
`;
        writeFileSync(filePath, content, "utf-8");
        // Also append to a master project file for easier NotebookLM ingestion
        const masterPath = path.join(projectPath, "PROJECT_KNOWLEDGE.md");
        const masterEntry = `\n---\n## Entry: ${entry.agentName} - ${entry.taskId}\n${content}\n`;
        if (!existsSync(masterPath)) {
            writeFileSync(masterPath, "# Master Project Knowledge Base\n", "utf-8");
        }
        appendFileSync(masterPath, masterEntry, "utf-8");
        return filePath;
    }
    /**
     * Retrieves all knowledge entries for a project to be used as context.
     */
    getProjectContext(projectDir) {
        const projectPath = path.join(this.baseDir, projectDir);
        const masterPath = path.join(projectPath, "PROJECT_KNOWLEDGE.md");
        if (existsSync(masterPath)) {
            return readFileSync(masterPath, "utf-8");
        }
        return "";
    }
}
export const knowledgeManager = new KnowledgeManager();
//# sourceMappingURL=knowledge-manager.js.map