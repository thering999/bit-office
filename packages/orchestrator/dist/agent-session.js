import { spawn, execSync } from "child_process";
import path from "path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { CONFIG } from "./config.js";
import { resolvePreview } from "./preview-resolver.js";
import { parseAgentOutput } from "./output-parser.js";
import { nanoid } from "nanoid";
import { getMemoryContext } from "./memory.js";
import { vectorMemory } from "./vector-memory.js";
import { knowledgeManager } from "./knowledge-manager.js";
import { AgentErrorHandler } from "./error-handler.js";
import { SnapshotManager } from "./snapshot-manager.js";
/* ── Persist session IDs across restarts ────────────────────────── */
const SESSION_FILE = path.join(homedir(), ".bit-office", "agent-sessions.json");
export function loadSessionMap() {
    try {
        if (existsSync(SESSION_FILE))
            return JSON.parse(readFileSync(SESSION_FILE, "utf-8"));
    }
    catch { /* corrupt file, start fresh */ }
    return {};
}
export function clearAllSessionIds() {
    try {
        writeFileSync(SESSION_FILE, "{}", "utf-8");
    }
    catch { /* ignore */ }
}
export function clearSessionId(agentId) {
    saveSessionId(agentId, null);
}
function saveSessionId(agentId, sessionId) {
    const dir = path.dirname(SESSION_FILE);
    if (!existsSync(dir))
        mkdirSync(dir, { recursive: true });
    const map = loadSessionMap();
    if (sessionId) {
        map[agentId] = sessionId;
    }
    else {
        delete map[agentId];
    }
    writeFileSync(SESSION_FILE, JSON.stringify(map), "utf-8");
}
export class AgentSession {
    agentId;
    name;
    role;
    personality;
    backend;
    palette;
    process = null;
    currentTaskId = null;
    taskTimeout = null;
    idleTimer = null;
    lastPrompt = "";
    currentCwd = null;
    _status = "idle";
    get status() { return this._status; }
    pendingApprovals = new Map();
    workspace;
    _lastLogLine = "";
    get lastLogLine() { return this._lastLogLine; }
    sandboxMode;
    stdoutBuffer = "";
    stderrBuffer = "";
    taskInputTokens = 0;
    taskOutputTokens = 0;
    fixRoundCount = 0;
    /** Dedup same-turn repeated usage in assistant messages */
    lastUsageSignature = "";
    hasHistory;
    sessionId;
    taskQueue = [];
    onEvent;
    _renderPrompt;
    timedOut = false;
    wasInactivityTimeout = false;
    currentTool = null;
    inactivityTimeout = null;
    healthCheckInterval = null;
    _lastHealthActivity = Date.now();
    _isTeamLead;
    _memoryContext;
    /** Whether this leader has already been through execute phase at least once */
    _hasExecuted = false;
    _lastResult = null;
    /** Original user-facing task prompt (for leader state-summary mode) */
    originalTask = null;
    onDelegation = null;
    onTaskComplete = null;
    /** Whether the last failure was a timeout (not retryable) */
    get wasTimeout() { return this.timedOut || this.wasInactivityTimeout; }
    get isTeamLead() { return this._isTeamLead; }
    /** Mark that this leader has already been through execute phase (for restart recovery). */
    set hasExecuted(v) { this._hasExecuted = v; }
    /** Short summary of last completed/failed task (for roster context) */
    get lastResult() { return this._lastResult; }
    _lastResultText = null;
    /** Full output from the last completed task (for plan capture). */
    _lastFullOutput = null;
    get lastFullOutput() { return this._lastFullOutput; }
    set isTeamLead(v) { this._isTeamLead = v; }
    /** Current phase override for team collaboration phases */
    /** Current phase override for team collaboration phases */
    currentPhase = null;
    /** Whether vision is enabled for this session */
    useVision = false;
    /** Current working directory of the running task (used by worktree logic) */
    get currentWorkingDir() { return this.currentCwd; }
    /** Whether this agent has session history (used --resume before) */
    get hasSessionHistory() { return this.hasHistory; }
    /** The configured workspace root directory */
    get workspaceDir() { return this.workspace; }
    /** PID of the running child process (null if not running) */
    get pid() { return this.process?.pid ?? null; }
    /** Worktree path if task is running in one (set externally by orchestrator) */
    worktreePath = null;
    worktreeBranch = null;
    teamId;
    snapshotManager;
    currentSnapshot = null;
    /** Whether this session has autonomously failed over to a backup backend */
    isFailover = false;
    constructor(opts) {
        this.agentId = opts.agentId;
        this.name = opts.name;
        this.role = opts.role;
        this.personality = opts.personality ?? "";
        this.workspace = opts.workspace;
        this.sessionId = loadSessionMap()[opts.agentId] ?? null;
        this.hasHistory = opts.resumeHistory ?? !!this.sessionId;
        this.backend = opts.backend;
        this.sandboxMode = opts.sandboxMode ?? "full";
        this._isTeamLead = opts.isTeamLead ?? false;
        this.teamId = opts.teamId;
        this._memoryContext = opts.memoryContext ?? "";
        this.onEvent = opts.onEvent;
        this._renderPrompt = opts.renderPrompt;
        this.useVision = opts.useVision ?? false;
        this.snapshotManager = new SnapshotManager();
    }
    /** Update the backend for this session (used for failover) */
    setBackend(backend) {
        console.log(`[Agent ${this.name}] Switching backend from ${this.backend.id} to ${backend.id}`);
        this.backend = backend;
        this.isFailover = true;
    }
    incrementFixRound() {
        this.fixRoundCount++;
    }
    async runTask(taskId, prompt, repoPath, teamContext, teamChat, isUserInitiated = false, phaseOverride, imagePath, visualContext) {
        // If the user explicitly cancelled this agent, block any automatic restarts
        // (from flushResults, delegation, retry). Only a direct user action clears this.
        if (this._userCancelled && !isUserInitiated) {
            console.log(`[Agent ${this.name}] Ignoring internal task restart — agent was cancelled by user`);
            return;
        }
        if (isUserInitiated) {
            this._userCancelled = false;
            this.fixRoundCount = 0;
        }
        // Safety: prevent infinite fix loops
        if (!isUserInitiated && this.fixRoundCount >= 3) {
            console.log(`[Agent ${this.name}] Blocking task restart — max fix rounds (3) reached`);
            this.onEvent({
                type: "team:chat",
                fromAgentId: this.agentId,
                message: "I've tried fixing this 3 times but it's still not right. Stopping to avoid infinite loop. Please check the logs.",
                messageType: "status",
                timestamp: Date.now()
            });
            this.setStatus("error");
            return;
        }
        if (this.process) {
            const position = this.taskQueue.length + 1;
            this.taskQueue.push({ taskId, prompt, repoPath, teamContext, teamChat, phaseOverride, imagePath, visualContext });
            this.onEvent({
                type: "task:queued",
                agentId: this.agentId,
                taskId,
                prompt,
                position,
            });
            return;
        }
        // Cancel any pending idle timer from a previous task
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        this.lastPrompt = prompt;
        this.currentTaskId = taskId;
        this.currentPhase = phaseOverride ?? null;
        const cwd = repoPath ?? this.workspace;
        let cmd = this.backend.command;
        this.currentCwd = cwd;
        this.stdoutBuffer = "";
        this.stderrBuffer = "";
        this.taskInputTokens = 0;
        this.taskOutputTokens = 0;
        this.lastUsageSignature = "";
        this.currentSnapshot = await this.snapshotManager.createSnapshot(cwd, taskId);
        this.onEvent({
            type: "task:started",
            agentId: this.agentId,
            taskId,
            prompt,
        });
        this.setStatus("thinking");
        try {
            const cleanEnv = { ...process.env, ...(this.backend.getEnv?.(this.agentId) ?? {}) };
            for (const key of this.backend.deleteEnv ?? []) {
                delete cleanEnv[key];
            }
            // isTeamLead: uses leader template + no tools (only delegates)
            // teamContext: just the roster string (any agent in a team may see it)
            // Cap originalTask to avoid exceeding CLI argument limits (especially for non-Claude backends)
            const rawOriginalTask = this._isTeamLead ? (this.originalTask ?? prompt) : "";
            const originalTask = rawOriginalTask.length > 1500 ? rawOriginalTask.slice(0, 1500) + "\n...(truncated)" : rawOriginalTask;
            const templateVars = {
                name: this.name,
                role: this._isTeamLead ? "Team Lead" : this.role,
                personality: this.personality ? `${this.personality}` : "",
                teamRoster: teamContext ?? "",
                teamChat: teamChat ?? "",
                originalTask,
                prompt,
                memory: this._memoryContext ? `${this._memoryContext}\n\n${await this.getEnhancedMemoryContext(prompt)}` : await this.getEnhancedMemoryContext(prompt),
                soloHint: this.teamId ? "" : `- You are a SOLO developer. Do NOT delegate, assign tasks, or mention other team members. Do ALL the work yourself.
- PROJECT DIRECTORY: When creating files, first create a dedicated project directory (short kebab-case name, e.g. "snake-game"). Do ALL work inside it. Report it as PROJECT_DIR: <directory-name> in your output. If the user is just chatting (no code needed), skip this.`,
                visualContext: visualContext ?? "",
            };
            // Capture before template selection modifies it
            const isFirstExecute = this._isTeamLead && phaseOverride === "execute" && !this._hasExecuted;
            let fullPrompt;
            if (this._isTeamLead && phaseOverride && ["create", "design", "complete"].includes(phaseOverride)) {
                // Conversational phases: use continuation template if resuming, full template if first turn
                const templateName = (this.hasHistory ? `leader-${phaseOverride}-continue` : `leader-${phaseOverride}`);
                fullPrompt = this._renderPrompt(templateName, templateVars);
            }
            else if (this._isTeamLead) {
                // First time entering execute: use leader-initial (full delegation rules)
                // Subsequent execute (feedback loop / result forwarding): use leader-continue to keep context
                const useInitial = isFirstExecute || !this.hasHistory;
                fullPrompt = this._renderPrompt(useInitial ? "leader-initial" : "leader-continue", templateVars);
                if (phaseOverride === "execute")
                    this._hasExecuted = true;
            }
            else {
                const workerInitial = this.role.toLowerCase().includes("review") ? "worker-reviewer-initial" : "worker-initial";
                const templateName = this.hasHistory ? "worker-continue" : workerInitial;
                fullPrompt = this._renderPrompt(this.useVision ? `${templateName}-vision` : templateName, templateVars);
            }
            const fullAccess = this.sandboxMode === "full";
            const verbose = !!process.env.DEBUG;
            const args = this.backend.buildArgs(fullPrompt, {
                continue: this.hasHistory,
                resumeSessionId: this.sessionId ?? undefined,
                fullAccess,
                noTools: this._isTeamLead,
                verbose,
                // Only skip resume on first execute (to shed conversational create/design context).
                // On subsequent runs (result forwarding, user feedback), resume so leader keeps context.
                skipResume: isFirstExecute && this.hasHistory,
                imagePath,
            });
            const isWin = process.platform === "win32";
            console.log(`[Agent ${this.name}] PATH: ${cleanEnv.PATH || cleanEnv.Path || "NOT FOUND"}`);
            // Log which binary + env state
            try {
                if (!path.isAbsolute(this.backend.command)) {
                    const whichCmd = isWin ? 'where' : 'which';
                    const whichPath = execSync(`${whichCmd} ${this.backend.command}`, { env: cleanEnv, encoding: "utf-8", timeout: 3000 }).split('\n')[0].trim();
                    console.log(`[Agent ${this.name}] Binary found at: ${whichPath}`);
                }
            }
            catch { /* ignore */ }
            console.log(`[Agent ${this.name}] Spawning: ${this.backend.command} ${args.map(a => a.length > 80 ? a.slice(0, 80) + '...' : a).join(' ')}`);
            // stdin MUST be "ignore" — "pipe" causes Claude Code to hang waiting for input
            // detached: true creates a new process group so we can kill the entire tree on cancel
            cmd = this.backend.command;
            let useShell = false;
            if (isWin) {
                if (cmd === "node")
                    cmd = process.execPath;
                if (path.isAbsolute(cmd)) {
                    useShell = false; // Absolute paths work best without shell on Windows
                }
                else {
                    useShell = true; // Bare commands (e.g. 'git') often need shell to find the .exe/.cmd
                }
                // Quote if using shell and has spaces
                if (useShell && cmd.includes(" ") && !cmd.startsWith("\"")) {
                    cmd = `"${cmd}"`;
                }
            }
            console.log(`[Agent ${this.name}] Final Spawn: ${cmd} (shell: ${useShell})`);
            this.process = spawn(cmd, args, {
                cwd,
                env: cleanEnv,
                stdio: ["ignore", "pipe", "pipe"],
                detached: !isWin,
                shell: useShell,
            });
            // Task timeout: only for team members (prevent blocking the team flow).
            // Solo agents have no timeout — user can cancel manually.
            this.timedOut = false;
            const TASK_TIMEOUT_MS = !this.teamId ? 0
                : this._isTeamLead ? CONFIG.timing.leaderTimeoutMs
                    : CONFIG.timing.workerTimeoutMs;
            if (TASK_TIMEOUT_MS > 0) {
                this.taskTimeout = setTimeout(() => {
                    if (this.process?.pid) {
                        console.log(`[Agent ${this.agentId}] Task timed out after ${TASK_TIMEOUT_MS / 1000}s, killing`);
                        this.timedOut = true;
                        try {
                            process.kill(-this.process.pid, "SIGKILL");
                        }
                        catch {
                            this.process.kill("SIGKILL");
                        }
                    }
                }, TASK_TIMEOUT_MS);
            }
            this.wasInactivityTimeout = false;
            const resetInactivityTimer = () => {
                if (this.inactivityTimeout)
                    clearTimeout(this.inactivityTimeout);
                if (CONFIG.timing.inactivityTimeoutMs > 0) {
                    this.inactivityTimeout = setTimeout(() => {
                        if (this.process?.pid) {
                            console.log(`[Agent ${this.agentId}] Inactivity timeout (${CONFIG.timing.inactivityTimeoutMs / 1000}s), killing`);
                            this.wasInactivityTimeout = true;
                            try {
                                process.kill(-this.process.pid, "SIGKILL");
                            }
                            catch {
                                this.process.kill("SIGKILL");
                            }
                        }
                    }, CONFIG.timing.inactivityTimeoutMs);
                }
            };
            resetInactivityTimer();
            this._lastHealthActivity = Date.now();
            if (this.healthCheckInterval)
                clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = setInterval(() => {
                if (this.process && (this._status === "working" || this._status === "thinking" || this._status === "coding" || this._status === "searching" || this._status === "testing")) {
                    const inactiveMs = Date.now() - this._lastHealthActivity;
                    if (inactiveMs > 30_000) { // 30 seconds of no logs while working
                        this.onEvent({
                            type: "agent:activity",
                            agentId: this.agentId,
                            agentName: this.name,
                            phase: "health",
                            intent: "Still working, but no output for 30s. Process might be slow or hanging.",
                            timestamp: Date.now()
                        });
                    }
                }
            }, 15_000);
            // Delegation detection regex
            const DELEGATION_RE = /^\s*(?:[-*>]\s*)?(?:\*\*)?@(\w+)(?:\*\*)?:\s*(.+)$/;
            const CHAT_RE = /^\s*(?:[-*>]\s*)?(?:\*\*)?@Team(?:\*\*)?:\s*(.+)$/i;
            // Filter out system/diagnostic noise that should not appear in the UI
            const isSystemNoise = (line) => {
                const t = line.trim().toLowerCase();
                if (!t)
                    return true;
                // MCP-related
                if (t.includes("mcp") && (t.startsWith("[") || t.includes("server") || t.includes("connect") || t.includes("tool")))
                    return true;
                // Claude Code internal diagnostics (reduced filter to allow more context)
                if (/^\s*>?\s*(fetching|loaded|reading|writing|searching|running|executing)\s/i.test(line))
                    return true;
                // Progress indicators / spinners
                if (/^[\s⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏✓✗•·…\-]+$/.test(line.trim()))
                    return true;
                // Bare file path lines (no sentence content)
                if (/^\s*[\w./\\-]+\.(ts|tsx|js|jsx|json|md|css|py)\s*$/.test(line))
                    return true;
                return false;
            };
            // Accumulator for multi-line delegations (e.g. @Kai: Fix bugs:\n1. bug one\n2. bug two)
            let pendingDelegation = null;
            const flushDelegation = () => {
                if (pendingDelegation && this.onDelegation) {
                    const fullPrompt = pendingDelegation.lines.join("\n").replace(/\*\*$/, "").trim();
                    console.log(`[Delegation detected] ${this.name} -> @${pendingDelegation.targetName}: ${fullPrompt.slice(0, 120)}`);
                    this.onDelegation(this.agentId, pendingDelegation.targetName, fullPrompt);
                }
                pendingDelegation = null;
            };
            // Handle a line of plain text output (delegation detection + logging)
            const handleTextLine = (text) => {
                this._lastHealthActivity = Date.now();
                const lines = text.split("\n").filter((l) => l.trim());
                const visibleLines = [];
                for (const line of lines) {
                    const trimmed = line.trim();
                    console.log(`[Agent ${this.name}] ${trimmed.slice(0, 200)}`);
                    const chatMatch = trimmed.match(CHAT_RE);
                    if (chatMatch) {
                        this.onEvent({
                            type: "team:chat",
                            fromAgentId: this.agentId,
                            message: chatMatch[1],
                            messageType: "briefing",
                            timestamp: Date.now(),
                        });
                    }
                    const match = this._isTeamLead ? trimmed.match(DELEGATION_RE) : null;
                    if (match) {
                        // Flush any previous delegation before starting a new one
                        flushDelegation();
                        const [, targetName, delegatedPrompt] = match;
                        pendingDelegation = { targetName, lines: [delegatedPrompt] };
                    }
                    else if (pendingDelegation) {
                        // Continuation line of current delegation
                        pendingDelegation.lines.push(trimmed);
                    }
                    // Tool call detection (MCP / Claude Code / Aider)
                    if (trimmed.includes("Calling tool:") || (trimmed.startsWith("mcp") && (trimmed.includes("calling") || trimmed.includes("tool")))) {
                        const toolMatch = trimmed.match(/tool:?\s*([\w-]+)/i);
                        const toolName = toolMatch ? toolMatch[1].toLowerCase() : "unknown";
                        this.currentTool = toolName;
                        this.onEvent({
                            type: "tool:started",
                            agentId: this.agentId,
                            taskId,
                            tool: toolName,
                        });
                        // Set granular status based on tool type
                        if (["grep", "ls", "find", "read", "smart", "summary", "read_grep", "list_dir", "view_file"].some(t => toolName.includes(t))) {
                            this.setStatus("searching");
                        }
                        else if (["test", "vitest", "jest", "playwright", "cypress", "mocha"].some(t => toolName.includes(t))) {
                            this.setStatus("testing");
                        }
                        else {
                            this.setStatus("coding");
                        }
                    }
                    else if (trimmed.includes("Tool response:") || trimmed.includes("Finished tool:")) {
                        this.onEvent({
                            type: "tool:finished",
                            agentId: this.agentId,
                            taskId,
                            tool: this.currentTool || "unknown",
                            success: !trimmed.toLowerCase().includes("error"),
                        });
                        this.currentTool = null;
                        this.setStatus("thinking");
                    }
                    if (!isSystemNoise(line)) {
                        visibleLines.push(trimmed);
                        this._lastLogLine = trimmed;
                        // Update status details for real-time Thought Stream tooltips
                        this.setStatus(this._status, trimmed);
                    }
                }
                // Flush at end of text block (covers single-delegation and last-delegation cases)
                flushDelegation();
                if (visibleLines.length > 0) {
                    this.onEvent({
                        type: "log:append",
                        agentId: this.agentId,
                        taskId,
                        stream: "stdout",
                        chunk: visibleLines.join("\n"),
                    });
                }
            };
            // Parse stream-json or plain text stdout
            let jsonLineBuf = "";
            let stdoutChunkCount = 0;
            let seenFirstJson = false;
            this.process.stdout?.on("data", (data) => {
                resetInactivityTimer();
                const raw = data.toString();
                stdoutChunkCount++;
                if (stdoutChunkCount <= 3) {
                    console.log(`[Agent ${this.name} raw-stdout #${stdoutChunkCount}] ${raw.slice(0, 150)}`);
                }
                jsonLineBuf += raw;
                // Process complete lines
                let nlIdx;
                while ((nlIdx = jsonLineBuf.indexOf("\n")) !== -1) {
                    const line = jsonLineBuf.slice(0, nlIdx).trim();
                    jsonLineBuf = jsonLineBuf.slice(nlIdx + 1);
                    if (!line)
                        continue;
                    // Try to parse as stream-json
                    if (line.startsWith("{")) {
                        try {
                            const msg = JSON.parse(line);
                            seenFirstJson = true;
                            // Capture session ID for --resume on next run
                            if (msg.type === "system" && msg.session_id) {
                                this.sessionId = msg.session_id;
                                console.log(`[Agent ${this.name}] Session ID: ${msg.session_id}`);
                            }
                            if ((msg.type === "assistant" || msg.type === "message") && (msg.message?.content || msg.content)) {
                                const role = msg.role || msg.message?.role || "assistant";
                                if (msg.type === "message" && role !== "assistant") {
                                    // Skip non-assistant messages (e.g. user echo)
                                }
                                else {
                                    // Live token usage from per-turn usage (dedup same-turn repeats)
                                    const usage = msg.usage || msg.message?.usage;
                                    if (usage) {
                                        const turnIn = (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0);
                                        const turnOut = usage.output_tokens ?? 0;
                                        const sig = `${turnIn}:${turnOut}`;
                                        if (sig !== this.lastUsageSignature) {
                                            this.lastUsageSignature = sig;
                                            this.taskInputTokens += turnIn;
                                            this.taskOutputTokens += turnOut;
                                            this.onEvent({
                                                type: "token:update",
                                                agentId: this.agentId,
                                                inputTokens: this.taskInputTokens,
                                                outputTokens: this.taskOutputTokens,
                                            });
                                        }
                                    }
                                    const content = msg.content || msg.message?.content;
                                    if (typeof content === "string") {
                                        this.stdoutBuffer += content + "\n";
                                        handleTextLine(content);
                                    }
                                    else if (Array.isArray(content)) {
                                        for (const block of content) {
                                            if (block.type === "text" && block.text) {
                                                this.stdoutBuffer += block.text + "\n";
                                                handleTextLine(block.text);
                                            }
                                            if (block.type === "thinking" && block.thinking) {
                                                console.log(`[Agent ${this.name} thinking] ${block.thinking.slice(0, 120)}...`);
                                            }
                                        }
                                    }
                                }
                            }
                            else if (msg.type === "result") {
                                // Result message: authoritative session total from msg.usage or msg.stats
                                const usage = msg.usage || msg.stats;
                                if (usage) {
                                    const totalIn = (usage.input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0);
                                    const totalOut = usage.output_tokens ?? 0;
                                    // Replace live accumulation with authoritative total
                                    this.taskInputTokens = totalIn;
                                    this.taskOutputTokens = totalOut;
                                    this.onEvent({
                                        type: "token:update",
                                        agentId: this.agentId,
                                        inputTokens: this.taskInputTokens,
                                        outputTokens: this.taskOutputTokens,
                                    });
                                }
                                if (msg.result) {
                                    if (!this.stdoutBuffer) {
                                        this.stdoutBuffer = msg.result;
                                        handleTextLine(msg.result);
                                    }
                                    this._lastResultText = msg.result;
                                }
                            }
                            continue;
                        }
                        catch {
                            // Not valid JSON, treat as plain text
                        }
                    }
                    // First non-JSON line: this backend outputs plain text, not stream-json.
                    // Switch to plain-text mode so all subsequent lines are processed.
                    if (!seenFirstJson) {
                        seenFirstJson = true;
                    }
                    // Plain text fallback (non-Claude backends)
                    this.stdoutBuffer += line + "\n";
                    handleTextLine(line);
                }
            });
            this.process.stderr?.on("data", (data) => {
                resetInactivityTimer();
                const chunk = data.toString();
                this.stderrBuffer += chunk;
                // Log to console for debugging, but do NOT forward stderr to the UI.
                // Stderr is MCP internals, system diagnostics, and Claude Code infrastructure —
                // none of it is meaningful agent output for the user.
                for (const line of chunk.split("\n")) {
                    if (line.trim())
                        console.log(`[Agent ${this.name} stderr] ${line.slice(0, 200)}`);
                }
            });
            this.process.on("close", (code) => {
                const agentPid = this.process?.pid;
                this.process = null;
                if (this.taskTimeout) {
                    clearTimeout(this.taskTimeout);
                    this.taskTimeout = null;
                }
                if (this.inactivityTimeout) {
                    clearTimeout(this.inactivityTimeout);
                    this.inactivityTimeout = null;
                }
                if (this.healthCheckInterval) {
                    clearInterval(this.healthCheckInterval);
                    this.healthCheckInterval = null;
                }
                // Kill the agent's process group to clean up any orphan child processes
                // (e.g., dev servers the agent may have started despite prompt instructions)
                if (agentPid) {
                    try {
                        process.kill(-agentPid, "SIGTERM");
                    }
                    catch { /* group already dead */ }
                }
                // Flush any remaining data in the JSON line buffer (last line without trailing newline)
                const remaining = jsonLineBuf.trim();
                if (remaining) {
                    jsonLineBuf = "";
                    for (const chunk of remaining.split("\n")) {
                        const line = chunk.trim();
                        if (!line)
                            continue;
                        if (line.startsWith("{")) {
                            try {
                                const msg = JSON.parse(line);
                                if (msg.type === "assistant" && msg.message?.content) {
                                    for (const block of msg.message.content) {
                                        if (block.type === "text" && block.text) {
                                            this.stdoutBuffer += block.text + "\n";
                                            handleTextLine(block.text);
                                        }
                                    }
                                }
                                else if (msg.type === "result" && msg.result) {
                                    this._lastResultText = msg.result;
                                    if (!this.stdoutBuffer) {
                                        this.stdoutBuffer = msg.result;
                                        handleTextLine(msg.result);
                                    }
                                }
                            }
                            catch { /* not valid JSON */ }
                        }
                        else {
                            seenFirstJson = true;
                            this.stdoutBuffer += line + "\n";
                            handleTextLine(line);
                        }
                    }
                }
                const completedTaskId = this.currentTaskId ?? taskId;
                this.currentTaskId = null;
                const wasCancelled = this.cancelled;
                this.cancelled = false;
                console.log(`[Agent ${this.agentId}] ${this.backend.name} exited: code=${code}, cancelled=${wasCancelled}, stdout=${this.stdoutBuffer.length}ch`);
                try {
                    if (wasCancelled) {
                        // Already handled in cancelTask() — just clean up and dequeue
                        this.dequeueNext();
                        return;
                    }
                    else if (code === 0) {
                        this.hasHistory = true;
                        saveSessionId(this.agentId, this.sessionId);
                        const result = this.extractResult();
                        const { summary, fullOutput, changedFiles, entryFile, projectDir, previewCmd, previewPort, modules, features } = result;
                        this._lastFullOutput = fullOutput;
                        // Check for empty answer (stuck/silent failure)
                        if (!fullOutput.trim() && changedFiles.length === 0) {
                            throw new Error("AI did not provide any answer (Empty Response).");
                        }
                        // Automatically document successful work for project knowledge base (NotebookLM)
                        // Skip for team leads (they don't implement features) or trivial chats
                        if (!this._isTeamLead && (modules?.length || features?.length || changedFiles.length > 0)) {
                            knowledgeManager.documentWork({
                                agentName: this.name,
                                role: this.role,
                                taskId: completedTaskId,
                                projectDir: projectDir || this.teamId || "default",
                                summary: summary,
                                modules: modules || [],
                                features: features || [],
                                timestamp: Date.now()
                            }).catch(err => console.warn(`[Agent ${this.name}] Knowledge doc failed:`, err));
                        }
                        // Preview detection: skip for team leads (they don't create files).
                        // Leader preview is handled by the orchestrator when isFinalResult is set.
                        // Also skip when no work was done (no changed files and no structured preview fields)
                        // to prevent false-positive previews on casual conversations like "hi".
                        const stdoutMentionsFile = /\.html?\b/i.test(this.stdoutBuffer);
                        const hasWorkOutput = changedFiles.length > 0 || entryFile || previewCmd || projectDir || stdoutMentionsFile;
                        const { previewUrl, previewPath } = (this._isTeamLead || !hasWorkOutput)
                            ? { previewUrl: undefined, previewPath: undefined }
                            : this.detectPreview();
                        this._lastResult = `done: ${summary.slice(0, 120)}`;
                        this.setStatus("done");
                        const tokenUsage = (this.taskInputTokens > 0 || this.taskOutputTokens > 0)
                            ? { inputTokens: this.taskInputTokens, outputTokens: this.taskOutputTokens }
                            : undefined;
                        this.onEvent({
                            type: "task:done",
                            agentId: this.agentId,
                            taskId: completedTaskId,
                            result: { summary, fullOutput, changedFiles, diffStat: "", testResult: "unknown", previewUrl, previewPath, entryFile, projectDir, previewCmd, previewPort, tokenUsage, modules, features },
                        });
                        this.onTaskComplete?.(this.agentId, completedTaskId, summary, true, fullOutput);
                        this.idleTimer = setTimeout(() => { this.idleTimer = null; this.setStatus("idle"); }, CONFIG.timing.idleDoneDelayMs);
                    }
                    else {
                        // If resume failed (0 output, immediate error), clear the corrupted session
                        // so retries start fresh instead of hitting the same bad session repeatedly.
                        if (this.sessionId && this.stdoutBuffer.length === 0) {
                            console.log(`[Agent ${this.agentId}] Resume session ${this.sessionId} appears corrupted (0ch output), clearing`);
                            this.sessionId = null;
                            this.hasHistory = false;
                            saveSessionId(this.agentId, null);
                        }
                        // Extract meaningful error lines from stderr (e.g. "ERROR: You've hit your usage limit...")
                        const stderrErrorLines = this.stderrBuffer
                            .split("\n")
                            .filter((l) => /TerminalQuotaError|RateLimitError|quota|limit|invalid_api_key|overloaded|429|code: 429/i.test(l) ||
                            /Cannot find module|ENOENT|not found/i.test(l) ||
                            /^\s*(ERROR|error|Error)[:\s]/i.test(l))
                            .map((l) => l.trim());
                        const stderrError = stderrErrorLines[stderrErrorLines.length - 1] ?? "";
                        const rawError = this.wasInactivityTimeout ? "Task hung: Inactivity timeout (no output for too long)"
                            : this.timedOut ? `Task timed out after ${CONFIG.timing.workerTimeoutMs / 1000}s`
                                : stderrError || this.stdoutBuffer.slice(0, 300) || this.stderrBuffer.slice(-300) || `Process exited with code ${code}`;
                        // Translate to Thai for the user
                        const errorMsg = AgentErrorHandler.formatThai(rawError, { command: cmd, agentId: this.agentId });
                        this._lastResult = `failed: ${rawError.slice(0, 120)}`;
                        this.setStatus("error");
                        this.onEvent({
                            type: "task:failed",
                            agentId: this.agentId,
                            taskId: completedTaskId,
                            error: errorMsg,
                            rawError: rawError,
                        });
                        this.onTaskComplete?.(this.agentId, completedTaskId, errorMsg, false);
                        this.idleTimer = setTimeout(() => { this.idleTimer = null; this.setStatus("idle"); }, CONFIG.timing.idleErrorDelayMs);
                    }
                    this.dequeueNext();
                }
                catch (err) {
                    console.error(`[Agent ${this.agentId}] Error in close handler:`, err);
                    this.setStatus("error");
                    if (completedTaskId) {
                        this.onEvent({
                            type: "task:failed",
                            agentId: this.agentId,
                            taskId: completedTaskId,
                            error: err instanceof Error ? err.message : String(err)
                        });
                        this.onTaskComplete?.(this.agentId, completedTaskId, String(err), false);
                    }
                    this.dequeueNext();
                }
            });
            this.process.on("error", (err) => {
                this.process = null;
                this.currentTaskId = null;
                this.setStatus("error");
                const rawError = err.code === "ENOENT" || err.code === -4058
                    ? `"${cmd}" not found (CWD: ${cwd}). Please install it and make sure it's in your PATH.`
                    : err.message;
                // Translate to Thai for the user
                const errorMsg = AgentErrorHandler.formatThai(rawError, { command: cmd, agentId: this.agentId });
                this.onEvent({
                    type: "task:failed",
                    agentId: this.agentId,
                    taskId,
                    error: errorMsg,
                    rawError: rawError,
                });
                this.idleTimer = setTimeout(() => { this.idleTimer = null; this.setStatus("idle"); }, CONFIG.timing.idleErrorDelayMs);
            });
        }
        catch (err) {
            this.setStatus("error");
            const rawError = err.message;
            const errorMsg = AgentErrorHandler.formatThai(rawError, { command: cmd, agentId: this.agentId });
            this.onEvent({
                type: "task:failed",
                agentId: this.agentId,
                taskId,
                error: errorMsg,
                rawError: rawError,
            });
        }
    }
    /**
     * Send a message to the agent's stdin.
     * NOTE: Currently a no-op because stdin is set to "ignore" (pipe causes Claude Code to hang).
     * Future: use --input-format stream-json for bidirectional communication.
     */
    sendMessage(_message) {
        // stdin is "ignore" — cannot write. See TODO above.
        return false;
    }
    /**
     * Detect preview URL/path from agent output.
     * Called directly for workers; called by orchestrator for leader's final result.
     */
    detectPreview() {
        const result = this.extractResult();
        const baseCwd = this.currentCwd ?? this.workspace;
        const cwd = result.projectDir
            ? (path.isAbsolute(result.projectDir) ? result.projectDir : path.join(baseCwd, result.projectDir))
            : baseCwd;
        return resolvePreview({
            entryFile: result.entryFile,
            previewCmd: result.previewCmd,
            previewPort: result.previewPort,
            changedFiles: result.changedFiles,
            stdout: this.stdoutBuffer,
            cwd,
            workspace: baseCwd,
        });
    }
    /**
     * Parse stdoutBuffer for structured result (SUMMARY/STATUS/FILES_CHANGED).
     * Falls back to a cleaned-up excerpt of the raw output.
     */
    extractResult() {
        return parseAgentOutput(this.stdoutBuffer, this._lastResultText);
    }
    dequeueNext() {
        if (this.taskQueue.length === 0)
            return;
        const next = this.taskQueue.shift();
        setTimeout(() => {
            this.runTask(next.taskId, next.prompt, next.repoPath, next.teamContext, next.teamChat, false, next.phaseOverride, next.imagePath, next.visualContext);
        }, CONFIG.timing.dequeueDelayMs);
    }
    cancelled = false;
    /** Set by cancelTask(); prevents flushResults / delegation from auto-restarting this agent. */
    _userCancelled = false;
    cancelTask() {
        this.taskQueue = [];
        this._userCancelled = true;
        if (this.taskTimeout) {
            clearTimeout(this.taskTimeout);
            this.taskTimeout = null;
        }
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        const cancelledTaskId = this.currentTaskId ?? "";
        // Kill the running process if there is one
        if (this.process && this.process.pid) {
            this.cancelled = true;
            this.hasHistory = true;
            saveSessionId(this.agentId, this.sessionId);
            this.onTaskComplete?.(this.agentId, cancelledTaskId, "Task cancelled by user", false);
            const pgid = this.process.pid;
            try {
                process.kill(-pgid, "SIGKILL");
            }
            catch {
                try {
                    this.process.kill("SIGKILL");
                }
                catch { /* already dead */ }
            }
        }
        // Always force UI reset — even if process was already gone.
        // This prevents the UI from getting stuck in "working" state.
        this._lastResult = "cancelled: Task cancelled by user";
        this.setStatus("error");
        this.onEvent({
            type: "task:failed",
            agentId: this.agentId,
            taskId: cancelledTaskId,
            error: "Task cancelled by user",
        });
        this.idleTimer = setTimeout(() => { this.idleTimer = null; this.setStatus("idle"); }, CONFIG.timing.idleErrorDelayMs);
    }
    /**
     * Roll back the workspace to the state before the current/last task started.
     */
    async rollbackLastTask() {
        if (!this.currentSnapshot) {
            console.warn(`[Agent ${this.name}] No snapshot available for rollback.`);
            return false;
        }
        console.log(`[Agent ${this.name}] Rolling back to snapshot: ${this.currentSnapshot}`);
        const success = await this.snapshotManager.rollback(this.currentCwd || this.workspace, this.currentSnapshot);
        if (success) {
            this.currentSnapshot = null;
            this.onEvent({
                type: "agent:status",
                agentId: this.agentId,
                status: "idle",
                details: "Workspace rolled back successfully.",
            });
        }
        return success;
    }
    destroy() {
        if (this.taskTimeout) {
            clearTimeout(this.taskTimeout);
            this.taskTimeout = null;
        }
        if (this.inactivityTimeout) {
            clearTimeout(this.inactivityTimeout);
            this.inactivityTimeout = null;
        }
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
        if (this.process?.pid) {
            const pgid = this.process.pid;
            // Use SIGKILL — CLI agents like codex/claude ignore SIGTERM
            try {
                process.kill(-pgid, "SIGKILL");
            }
            catch {
                try {
                    this.process.kill("SIGKILL");
                }
                catch { /* already dead */ }
            }
            this.process = null;
        }
        this.pendingApprovals.clear();
        saveSessionId(this.agentId, null);
    }
    /** Reset conversation history so the next task starts fresh (used by End Project). */
    clearHistory() {
        this.hasHistory = false;
        this.sessionId = null;
        this.originalTask = null;
        this.currentPhase = null;
        this._hasExecuted = false;
        this._lastResult = null;
        this._lastResultText = null;
        this._lastFullOutput = null;
        this.setStatus("idle");
        saveSessionId(this.agentId, null);
    }
    resolveApproval(approvalId, decision) {
        if (approvalId === "__all__") {
            for (const [, pending] of this.pendingApprovals) {
                pending.resolve(decision);
            }
            this.pendingApprovals.clear();
            return;
        }
        const pending = this.pendingApprovals.get(approvalId);
        if (pending) {
            pending.resolve(decision);
            this.pendingApprovals.delete(approvalId);
        }
    }
    async requestApproval(title, summary, riskLevel) {
        const approvalId = nanoid();
        const taskId = this.currentTaskId ?? "unknown";
        this.setStatus("waiting_approval");
        this.onEvent({
            type: "approval:needed",
            approvalId,
            agentId: this.agentId,
            taskId,
            title,
            summary,
            riskLevel,
        });
        return new Promise((resolve) => {
            this.pendingApprovals.set(approvalId, { approvalId, resolve });
        });
    }
    getLastPrompt() {
        return this.lastPrompt;
    }
    setStatus(status, details) {
        // Guard: don't downgrade to "idle" if a task is running or queued
        if (status === "idle" && (this.process || this.taskQueue.length > 0))
            return;
        this._status = status;
        this.onEvent({
            type: "agent:status",
            agentId: this.agentId,
            status,
            details: details ?? this._lastLogLine ?? undefined,
            isFailover: this.isFailover,
        });
    }
    async getEnhancedMemoryContext(prompt) {
        const localContext = getMemoryContext();
        if (!CONFIG.memory.enabled)
            return localContext;
        try {
            // 1. Unified Omni-Memory: local recall + cross-project insights
            const vectorContext = await vectorMemory.getEnhancedMemoryContext(prompt);
            // 2. Project-specific structured knowledge base (for NotebookLM context)
            const projectKnowledge = knowledgeManager.getProjectContext(this.teamId || "default");
            const knowledgeSection = projectKnowledge ? `\n\n### Project Knowledge Base (Established Modules & Features):\n${projectKnowledge}` : "";
            return `${localContext}${vectorContext}${knowledgeSection}`;
        }
        catch (err) {
            console.warn(`[Agent ${this.name}] Failed to fetch enhanced memory:`, err);
            return localContext;
        }
    }
}
//# sourceMappingURL=agent-session.js.map