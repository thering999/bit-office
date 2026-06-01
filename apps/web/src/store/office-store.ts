import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  GatewayEvent,
  ChatMessage,
  AgentState,
  DataPacket,
  TeamChatMessage,
  TeamPhaseState,
  UserRole,
  AgentDefinition,
  GatewayEventSchema,
} from "@office/shared";

export type { ChatMessage, TeamChatMessage, TeamPhaseState, AgentState };

export interface ProjectPreview {
  entryFile?: string;
  projectDir?: string;
  previewCmd?: string;
  previewPort?: number;
}

export interface TokenUsageSummary {
  inputTokens: number;
  outputTokens: number;
}

export type ProjectRatings = Record<string, number>;

export interface ProjectSummary {
  id: string;
  name: string;
  startedAt: number;
  endedAt: number;
  agentNames: string[];
  eventCount: number;
  preview?: ProjectPreview;
  tokenUsage?: TokenUsageSummary;
  ratings?: ProjectRatings;
}

interface OfficeStore {
  agents: Map<string, AgentState>;
  agentDefs: AgentDefinition[];
  teamMessages: TeamChatMessage[];
  teamPhases: Map<string, TeamPhaseState>;
  role: UserRole;
  suggestions: { text: string; author: string; timestamp: number }[];
  projectList: ProjectSummary[];
  activePackets: DataPacket[];
  viewingProjectId: string | null;
  viewingProjectEvents: GatewayEvent[];
  viewingProjectName: string | null;
  pendingPreviewUrl: string | null;
  backendOptions: any[];
  config: any;
  keyStatus: any[] | null;
  connected: boolean;
  hydrated: boolean;
  voiceEnabled: boolean;
  voiceLang: string;
  swarmHealth: {
    score: number;
    status: string;
    diagnostics: string[];
    recommendations: string[];
  };
  knowledgeContent: string | null;
  knowledgeDir: string | null;
  setKnowledge: (content: string, dir: string) => void;

  // System logs and activities telemetry
  systemLogs: { id: string; agentId: string; stream: "stdout" | "stderr"; chunk: string; timestamp: number }[];
  executionSteps: { id: string; agentId: string; type: string; message: string; timestamp: number }[];
  clearLogs: () => void;

  // UI States
  showThoughtStream: boolean;
  showHealthDashboard: boolean;
  setShowThoughtStream: (show: boolean) => void;
  setShowHealthDashboard: (show: boolean) => void;
  toggleThoughtStream: () => void;
  toggleHealthDashboard: () => void;

  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceLang: (lang: string) => void;

  consumePreviewUrl: () => string | null;
  setConnected: (c: boolean) => void;
  setRole: (role: UserRole) => void;
  hydrate: () => void;
  getAgent: (id: string) => AgentState;
  removeAgent: (agentId: string) => void;
  clearTeamMessages: () => void;
  clearViewingProject: () => void;
  addUserMessage: (agentId: string, taskId: string, prompt: string) => void;
  handleEvent: (event: GatewayEvent) => void;
}

export const folderPickCallbacks = new Map<string, (path: string) => void>();
export const imageUploadCallbacks = new Map<string, (path: string) => void>();

export function registerFolderPick(requestId: string, callback: (path: string) => void) {
  folderPickCallbacks.set(requestId, callback);
}

export function registerImageUpload(requestId: string, callback: (path: string) => void) {
  imageUploadCallbacks.set(requestId, callback);
}


// ── localStorage persistence ──

const STORAGE_KEY = "office-chat-history";

interface PersistedAgent {
  agentId: string;
  name: string;
  role: string;
  palette?: number;
  personality?: string;
  backend?: string;
  isTeamLead?: boolean;
  teamId?: string;
  messages: ChatMessage[];
}

function isBrowser() {
  return typeof window !== "undefined";
}

function saveToStorage(agents: Map<string, AgentState>) {
  if (!isBrowser()) return;
  try {
    const data: PersistedAgent[] = [];
    for (const [, agent] of agents) {
      // Skip external agents — they are transient
      if (agent.isExternal) continue;
      if (agent.messages.length > 0 || agent.name !== agent.agentId) {
        data.push({
          agentId: agent.agentId,
          name: agent.name,
          role: agent.role,
          palette: agent.palette,
          personality: agent.personality,
          backend: agent.backend,
          isTeamLead: agent.isTeamLead,
          teamId: agent.teamId,
          messages: agent.messages.map(({ _accumulatedText, ...m }) => m),
        });
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // quota exceeded or unavailable
  }
}

function loadFromStorage(): Map<string, PersistedAgent> {
  if (!isBrowser()) return new Map();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const data: PersistedAgent[] = JSON.parse(raw);
    const map = new Map<string, PersistedAgent>();
    for (const item of data) {
      map.set(item.agentId, item);
    }
    return map;
  } catch {
    return new Map();
  }
}

function removeFromStorage(agentId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data: PersistedAgent[] = JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.filter(a => a.agentId !== agentId)));
  } catch {
    // ignore
  }
}

// ── Team messages persistence ──

const TEAM_STORAGE_KEY = "office-team-messages";

function saveTeamMessages(messages: TeamChatMessage[]) {
  if (!isBrowser()) return;
  try {
    // Keep last 200 messages
    const trimmed = messages.slice(-200);
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* quota exceeded */ }
}

function loadTeamMessages(): TeamChatMessage[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(TEAM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Team phase persistence ──

const TEAM_PHASE_KEY = "office-team-phase";

function saveTeamPhases(phases: Map<string, TeamPhaseState>) {
  if (!isBrowser()) return;
  try {
    const data: Record<string, TeamPhaseState> = {};
    for (const [k, v] of phases) data[k] = v;
    localStorage.setItem(TEAM_PHASE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

function loadTeamPhases(): Map<string, TeamPhaseState> {
  if (!isBrowser()) return new Map();
  try {
    const raw = localStorage.getItem(TEAM_PHASE_KEY);
    if (!raw) return new Map();
    const data: Record<string, TeamPhaseState> = JSON.parse(raw);
    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
}

// ── Store ──

function defaultAgent(agentId: string, name = agentId, role = ""): AgentState {
  return {
    agentId,
    name,
    role,
    status: "idle",
    currentTaskId: null,
    currentPrompt: null,
    pendingApproval: null,
    messages: [],
    lastLogLine: null,
    statusDetails: null,
    tokenUsage: { inputTokens: 0, outputTokens: 0 },
  };
}

export const useOfficeStore = create<OfficeStore>((set, get) => ({
  agents: new Map(),
  agentDefs: [],
  teamMessages: [],
  teamPhases: new Map(),
  role: "owner" as UserRole,
  suggestions: [],
  projectList: [],
  activePackets: [],
  viewingProjectId: null,
  viewingProjectEvents: [],
  viewingProjectName: null,
  pendingPreviewUrl: null,
  backendOptions: [],
  config: {},
  keyStatus: null,
  connected: false,
  hydrated: false,
  voiceEnabled: false,
  voiceLang: "th-TH",
  swarmHealth: {
    score: 100,
    status: "healthy",
    diagnostics: ["All systems operational", "Swarm synchronizer active"],
    recommendations: ["System optimal", "No immediate actions required"]
  },
  knowledgeContent: null,
  knowledgeDir: null,
  setKnowledge: (content, dir) => set({ knowledgeContent: content, knowledgeDir: dir }),

  // System logs and activities telemetry initial state
  systemLogs: [],
  executionSteps: [],
  clearLogs: () => set({ systemLogs: [], executionSteps: [] }),

  // UI States
  showThoughtStream: false,
  showHealthDashboard: false,
  setShowThoughtStream: (show) => set({ showThoughtStream: show }),
  setShowHealthDashboard: (show) => set({ showHealthDashboard: show }),
  toggleThoughtStream: () => {
    console.log("[Store] Toggling Thought Stream");
    set(s => ({ showThoughtStream: !s.showThoughtStream }));
  },
  toggleHealthDashboard: () => {
    console.log("[Store] Toggling Health Dashboard");
    set(s => ({ showHealthDashboard: !s.showHealthDashboard }));
  },

  setVoiceEnabled: (enabled) => set({ voiceEnabled: enabled }),
  setVoiceLang: (lang) => set({ voiceLang: lang }),

  consumePreviewUrl: () => {
    const url = get().pendingPreviewUrl;
    if (url) set({ pendingPreviewUrl: null });
    return url;
  },
  setConnected: (c) => set({ connected: c }),
  setRole: (role) => set({ role }),

  hydrate: () => {
    if (get().hydrated) return;
    const saved = loadFromStorage();
    const savedTeamMessages = loadTeamMessages();
    const savedTeamPhases = loadTeamPhases();
    if (saved.size === 0 && savedTeamMessages.length === 0 && savedTeamPhases.size === 0) { set({ hydrated: true, teamMessages: savedTeamMessages, teamPhases: savedTeamPhases }); return; }
    set((state) => {
      const agents = new Map(state.agents);
      for (const [agentId, persisted] of saved) {
        if (!agents.has(agentId)) {
          agents.set(agentId, {
            ...defaultAgent(agentId, persisted.name, persisted.role),
            palette: persisted.palette,
            personality: persisted.personality,
            backend: persisted.backend,
            isTeamLead: persisted.isTeamLead,
            teamId: persisted.teamId,
            messages: persisted.messages,
          });
        }
      }
      return { agents, teamMessages: savedTeamMessages, teamPhases: savedTeamPhases, hydrated: true };
    });
  },

  getAgent: (id) => {
    return get().agents.get(id) ?? defaultAgent(id);
  },

  removeAgent: (agentId) => {
    set((state) => {
      const agents = new Map(state.agents);
      agents.delete(agentId);
      removeFromStorage(agentId);
      return { agents };
    });
  },

  clearTeamMessages: () => {
    saveTeamMessages([]);
    saveTeamPhases(new Map());
    set({ teamMessages: [], teamPhases: new Map() });
  },

  clearViewingProject: () => {
    set({ viewingProjectId: null, viewingProjectEvents: [], viewingProjectName: null });
  },

  addUserMessage: (agentId, taskId, prompt) => {
    set((state) => {
      const agents = new Map(state.agents);
      const agent = agents.get(agentId) ?? defaultAgent(agentId);
      agents.set(agentId, {
        ...agent,
        messages: [...agent.messages, {
          id: taskId,
          role: "user",
          text: prompt,
          timestamp: Date.now(),
        }],
      });
      saveToStorage(agents);
      return { agents };
    });
  },

  handleEvent: (event) => {
    const events = event.type === "BATCH" ? (event.events as GatewayEvent[]) : [event];

    set((state) => {
      let nextAgents = new Map(state.agents);
      let nextTeamMessages = [...state.teamMessages];
      let nextTeamPhases = new Map(state.teamPhases);
      let nextSuggestions = [...state.suggestions];
      let partialState: Partial<OfficeStore> = {};

      for (const e of events) {
        // Capture global system logs
        if (e.type === "LOG_APPEND") {
          const newLog = {
            id: nanoid(),
            agentId: e.agentId,
            stream: e.stream,
            chunk: e.chunk,
            timestamp: Date.now(),
          };
          const currentLogs = partialState.systemLogs || state.systemLogs || [];
          partialState.systemLogs = [...currentLogs, newLog].slice(-1000);
        }

        // Capture global execution steps
        let stepMsg = "";
        if (e.type === "TASK_STARTED") {
          stepMsg = `Started task: "${e.prompt.slice(0, 100)}${e.prompt.length > 100 ? "..." : ""}"`;
        } else if (e.type === "TASK_DONE") {
          stepMsg = `Completed task successfully: ${e.result.summary.slice(0, 100)}${e.result.summary.length > 100 ? "..." : ""}`;
        } else if (e.type === "TASK_FAILED") {
          stepMsg = `Task failed: "${e.error}"`;
        } else if (e.type === "TOOL_STARTED") {
          stepMsg = `Invoked tool "${e.tool}" with input: "${e.input ? e.input.slice(0, 100) : ""}"`;
        } else if (e.type === "TOOL_FINISHED") {
          stepMsg = `Tool "${e.tool}" finished (${e.success ? "success" : "failed"})`;
        } else if (e.type === "AGENT_STATUS") {
          stepMsg = `Status changed to ${e.status}${e.details ? `: ${e.details}` : ""}`;
        }

        if (stepMsg) {
          const newStep = {
            id: nanoid(),
            agentId: (e as { agentId?: string }).agentId || "system",
            type: e.type,
            message: stepMsg,
            timestamp: Date.now(),
          };
          const currentSteps = partialState.executionSteps || state.executionSteps || [];
          partialState.executionSteps = [...currentSteps, newStep].slice(-500);
        }

        switch (e.type) {
          case "AGENTS_SYNC": {
            const validIds = new Set(e.agentIds);
            for (const agentId of nextAgents.keys()) {
              if (!validIds.has(agentId)) nextAgents.delete(agentId);
            }
            break;
          }
          case "META_THOUGHT": {
            const agent = nextAgents.get(e.agentId) ?? defaultAgent(e.agentId);
            nextAgents.set(e.agentId, {
              ...agent,
              messages: [...agent.messages, {
                id: `thought-${e.timestamp}`,
                role: "thought",
                text: e.thought,
                timestamp: e.timestamp,
              }],
            });
            // Also add to team messages
            const teamMsg: TeamChatMessage = {
              id: `mt-${e.timestamp}-${e.agentId}`,
              fromAgentId: e.agentId,
              fromAgentName: "Meta-Agent",
              message: e.thought,
              messageType: "thought",
              timestamp: e.timestamp,
            };
            nextTeamMessages = [...nextTeamMessages, teamMsg].slice(-200);
            saveTeamMessages(nextTeamMessages);
            break;
          }
          case "SWARM_HEALTH": {
            Object.assign(partialState, {
              swarmHealth: {
                score: e.score,
                status: e.status,
                diagnostics: e.diagnostics,
                recommendations: e.recommendations,
              }
            });
            break;
          }
          case "SWARM_REASSEMBLY": {
            const teamMsg: TeamChatMessage = {
              id: `sr-${Date.now()}-${e.teamId}`,
              fromAgentId: "system",
              fromAgentName: "Swarm Orchestrator",
              message: `⚠️ Autonomous Re-assembly Triggered for team ${e.teamId}. New strategic focus: ${e.newTeamName}.`,
              messageType: "status",
              timestamp: Date.now(),
            };
            nextTeamMessages = [...nextTeamMessages, teamMsg].slice(-200);
            saveTeamMessages(nextTeamMessages);
            break;
          }
          case "BACKENDS_SYNC": {
            Object.assign(partialState, { backendOptions: e.backends });
            break;
          }
          case "KEY_STATUS_DATA": {
            Object.assign(partialState, { keyStatus: e.summary });
            break;
          }
          case "CONFIG_DATA":
          case "CONFIG_UPDATED": {
            Object.assign(partialState, { config: e.config });
            break;
          }
          case "AGENT_CREATED": {
            const existing = nextAgents.get(e.agentId);
            if (existing) {
              nextAgents.set(e.agentId, {
                ...existing,
                name: e.name,
                role: e.role,
                palette: e.palette ?? existing.palette,
                personality: e.personality ?? existing.personality,
                backend: e.backend ?? existing.backend,
                isTeamLead: e.isTeamLead ?? existing.isTeamLead,
                teamId: e.teamId ?? existing.teamId,
                isExternal: e.isExternal ?? existing.isExternal,
                pid: e.pid ?? existing.pid,
                cwd: e.cwd ?? existing.cwd,
                workDir: e.workDir ?? existing.workDir,
                startedAt: e.startedAt ?? existing.startedAt,
              });
            } else {
              const saved = e.isExternal ? undefined : loadFromStorage().get(e.agentId);
              const agent = defaultAgent(e.agentId, e.name, e.role);
              agent.palette = e.palette ?? saved?.palette;
              agent.personality = e.personality ?? saved?.personality;
              agent.backend = e.backend ?? saved?.backend;
              agent.isTeamLead = e.isTeamLead ?? saved?.isTeamLead;
              agent.teamId = e.teamId ?? saved?.teamId;
              agent.isExternal = e.isExternal;
              agent.pid = e.pid;
              agent.cwd = e.cwd;
              agent.workDir = e.workDir;
              agent.startedAt = e.startedAt;
              if (saved) agent.messages = saved.messages;
              nextAgents.set(e.agentId, agent);
            }
            if (!e.isExternal) saveToStorage(nextAgents);
            break;
          }
          case "AGENT_FIRED": {
            nextAgents.delete(e.agentId);
            removeFromStorage(e.agentId);
            for (const [teamId, tp] of nextTeamPhases) {
              if (tp.leadAgentId === e.agentId) nextTeamPhases.delete(teamId);
            }
            saveTeamPhases(nextTeamPhases);
            break;
          }
          case "AGENT_STATUS": {
            const agent = nextAgents.get(e.agentId) ?? defaultAgent(e.agentId);
            nextAgents.set(e.agentId, {
              ...agent,
              status: e.status,
              statusDetails: e.details ?? agent.statusDetails ?? null,
              isFailover: e.isFailover ?? agent.isFailover,
            });
            break;
          }
          case "TASK_STARTED": {
            const agent = nextAgents.get(e.agentId) ?? defaultAgent(e.agentId);
            const streamId = e.taskId + "-stream";
            const hasStream = agent.messages.some((m) => m.id === streamId);
            const staleFinalized = agent.messages.map((m) =>
              m.id.endsWith("-stream") && m.id !== streamId
                ? { ...m, id: m.id.replace("-stream", "-streamed") }
                : m
            );
            nextAgents.set(e.agentId, {
              ...agent,
              status: "working",
              currentTaskId: e.taskId,
              currentPrompt: e.prompt,
              pendingApproval: null,
              lastLogLine: null,
              messages: hasStream ? staleFinalized : [...staleFinalized, {
                id: streamId,
                role: "agent" as const,
                text: "",
                timestamp: Date.now(),
              }],
            });
            break;
          }
          case "APPROVAL_NEEDED": {
            const agent = nextAgents.get(e.agentId) ?? defaultAgent(e.agentId);
            nextAgents.set(e.agentId, {
              ...agent,
              status: "waiting_approval",
              pendingApproval: {
                approvalId: e.approvalId,
                title: e.title,
                summary: e.summary,
                riskLevel: e.riskLevel,
              },
            });
            break;
          }
          case "TASK_DONE": {
            const agent = nextAgents.get(e.agentId) ?? defaultAgent(e.agentId);
            const replyId = e.taskId + "-reply";
            if (agent.messages.some((m) => m.id === replyId)) break;

            let leaderConversational = false;
            if (agent.isTeamLead) {
              for (const [, tp] of nextTeamPhases) {
                if (tp.leadAgentId === e.agentId) {
                  leaderConversational = ["create", "design", "complete"].includes(tp.phase);
                  break;
                }
              }
            }

            const baseline = agent._tokenBaseline ?? { inputTokens: 0, outputTokens: 0 };
            const liveUpdated = agent.tokenUsage.inputTokens > baseline.inputTokens || agent.tokenUsage.outputTokens > baseline.outputTokens;
            const updatedTokenUsage = liveUpdated ? agent.tokenUsage : (e.result.tokenUsage ? {
              inputTokens: agent.tokenUsage.inputTokens + e.result.tokenUsage.inputTokens,
              outputTokens: agent.tokenUsage.outputTokens + e.result.tokenUsage.outputTokens,
            } : agent.tokenUsage);

            if (agent.isTeamLead && !e.isFinalResult && !leaderConversational) {
              const intStreamId = e.taskId + "-stream";
              const intStreamMsg = agent.messages.find((m) => m.id === intStreamId);
              const finalizedMsgs = intStreamMsg
                ? agent.messages.map((m) => m.id === intStreamId ? { ...m, id: intStreamId.replace("-stream", "-streamed") } : m)
                : agent.messages;
              nextAgents.set(e.agentId, {
                ...agent,
                status: "working",
                currentTaskId: null,
                pendingApproval: null,
                lastLogLine: e.result.summary?.slice(0, 100) ?? "Coordinating team...",
                messages: finalizedMsgs,
                tokenUsage: updatedTokenUsage,
                _tokenBaseline: updatedTokenUsage,
              });
              break;
            }

            const streamId = e.taskId + "-stream";
            const streamMsg = agent.messages.find((m) => m.id === streamId);
            const durationMs = streamMsg ? Date.now() - streamMsg.timestamp : undefined;
            const accumulated = streamMsg?._accumulatedText ?? "";
            const serverFull = e.result.fullOutput || e.result.summary;
            const bestText = accumulated.length > serverFull.length ? accumulated : serverFull;
            const finalizedMessages = agent.messages.filter((m) => m.id !== streamId);
            nextAgents.set(e.agentId, {
              ...agent,
              status: "done",
              currentTaskId: null,
              pendingApproval: null,
              lastLogLine: null,
              messages: [...finalizedMessages, {
                id: replyId,
                role: "agent",
                text: bestText,
                timestamp: Date.now(),
                result: e.result,
                isFinalResult: e.isFinalResult,
                durationMs,
              }],
              tokenUsage: updatedTokenUsage,
              _tokenBaseline: updatedTokenUsage,
            });
            saveToStorage(nextAgents);
            break;
          }
          case "TASK_FAILED": {
            const agent = nextAgents.get(e.agentId) ?? defaultAgent(e.agentId);
            const errorId = e.taskId + "-error";
            if (agent.messages.some((m) => m.id === errorId)) break;
            const displayText = e.error === "Task cancelled by user" ? "Current task has been cancelled. Tell me continue to pick up where I left off, or start something entirely new." : e.error;
            const failStreamId = e.taskId + "-stream";
            const finalizedMessages = agent.messages.map((m) => m.id === failStreamId ? { ...m, id: failStreamId.replace("-stream", "-streamed") } : m);
            nextAgents.set(e.agentId, {
              ...agent,
              status: "error",
              currentTaskId: null,
              pendingApproval: null,
              lastLogLine: null,
              messages: [...finalizedMessages, {
                id: errorId,
                role: "system",
                text: displayText,
                timestamp: Date.now(),
              }],
            });
            saveToStorage(nextAgents);
            break;
          }
          case "TASK_DELEGATED": {
            const fromAgent = nextAgents.get(e.fromAgentId);
            const toAgent = nextAgents.get(e.toAgentId);
            const delegateId = e.taskId + "-delegate";
            if (fromAgent && !fromAgent.messages.some((m) => m.id === delegateId)) {
              nextAgents.set(e.fromAgentId, {
                ...fromAgent,
                messages: [...fromAgent.messages, {
                  id: delegateId,
                  role: "system",
                  text: `Delegated to ${toAgent?.name ?? e.toAgentId}: ${e.prompt}`,
                  timestamp: Date.now(),
                }],
              });
            }
            const receivedId = e.taskId + "-received";
            const targetAgent = nextAgents.get(e.toAgentId) ?? defaultAgent(e.toAgentId);
            if (!targetAgent.messages.some((m) => m.id === receivedId)) {
              nextAgents.set(e.toAgentId, {
                ...targetAgent,
                messages: [...targetAgent.messages, {
                  id: receivedId,
                  role: "user",
                  text: `[From ${fromAgent?.name ?? e.fromAgentId}] ${e.prompt}`,
                  timestamp: Date.now(),
                }],
              });
            }
            const packet: DataPacket = { id: nanoid(), from: e.fromAgentId, to: e.toAgentId, type: "delegation", timestamp: Date.now() };
            Object.assign(partialState, { activePackets: [...(partialState.activePackets || state.activePackets), packet] });
            setTimeout(() => {
              set((s) => ({ activePackets: s.activePackets.filter(p => p.id !== packet.id) }));
            }, 2500);
            saveToStorage(nextAgents);
            break;
          }
          case "LOG_APPEND": {
            const agent = nextAgents.get(e.agentId);
            if (!agent || !e.chunk) break;
            nextAgents.set(e.agentId, { ...agent, lastLogLine: e.chunk });
            const streamId = agent.currentTaskId ? agent.currentTaskId + "-stream" : null;
            const lastMsg = agent.messages.length > 0 ? agent.messages[agent.messages.length - 1] : null;
            if (streamId && lastMsg?.id === streamId) {
              const prev = lastMsg._accumulatedText ?? "";
              const accumulated = prev ? prev + "\n" + e.chunk : e.chunk;
              const updatedMessages = [...agent.messages];
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMsg,
                text: accumulated,
                timestamp: Date.now(),
                _accumulatedText: accumulated,
              };
              nextAgents.set(e.agentId, { ...agent, messages: updatedMessages });
            } else if (agent.isExternal) {
              const now = Date.now();
              if (lastMsg && lastMsg.role === "agent" && (now - lastMsg.timestamp) < 10000) {
                const newText = (lastMsg.text ? lastMsg.text + "\n" : "") + e.chunk;
                const updatedMessages = [...agent.messages];
                updatedMessages[updatedMessages.length - 1] = { ...lastMsg, text: newText, timestamp: now };
                nextAgents.set(e.agentId, { ...agent, messages: updatedMessages });
              } else {
                nextAgents.set(e.agentId, {
                  ...agent,
                  messages: [...agent.messages, { id: `ext-log-${now}`, role: "agent", text: e.chunk, timestamp: now }],
                });
              }
            }
            break;
          }
          case "TASK_RESULT_RETURNED": {
            const originator = nextAgents.get(e.toAgentId);
            if (originator) {
              const fromAgent = nextAgents.get(e.fromAgentId);
              const resultId = e.taskId + "-result-return";
              if (!originator.messages.some((m) => m.id === resultId)) {
                nextAgents.set(e.toAgentId, {
                  ...originator,
                  messages: [...originator.messages, {
                    id: resultId,
                    role: "system",
                    text: `Result from ${fromAgent?.name ?? e.fromAgentId} (${e.success ? "completed" : "failed"}): ${e.summary.slice(0, 500)}`,
                    timestamp: Date.now(),
                  }],
                });
              }
            }
            const packet: DataPacket = { id: nanoid(), from: e.fromAgentId, to: e.toAgentId, type: "result", timestamp: Date.now() };
            Object.assign(partialState, { activePackets: [...(partialState.activePackets || state.activePackets), packet] });
            setTimeout(() => {
              set((s) => ({ activePackets: s.activePackets.filter(p => p.id !== packet.id) }));
            }, 2500);
            saveToStorage(nextAgents);
            break;
          }
          case "TEAM_CHAT": {
            const fromAgent = nextAgents.get(e.fromAgentId);
            const toAgent = e.toAgentId ? nextAgents.get(e.toAgentId) : undefined;
            const teamMsg: TeamChatMessage = {
              id: `tc-${e.timestamp}-${e.fromAgentId}-${e.messageType}-${e.toAgentId ?? ""}`,
              fromAgentId: e.fromAgentId,
              fromAgentName: fromAgent?.name ?? e.fromAgentId,
              toAgentId: e.toAgentId,
              toAgentName: toAgent?.name ?? e.toAgentId,
              message: e.message,
              messageType: e.messageType,
              timestamp: e.timestamp,
            };
            if (!nextTeamMessages.some((m) => m.id === teamMsg.id)) {
              nextTeamMessages = [...nextTeamMessages, teamMsg];
              saveTeamMessages(nextTeamMessages);
            }
            break;
          }
          case "TASK_QUEUED": {
            const agent = nextAgents.get(e.agentId) ?? defaultAgent(e.agentId);
            const queuedId = e.taskId + "-queued";
            if (!agent.messages.some((m) => m.id === queuedId)) {
              nextAgents.set(e.agentId, {
                ...agent,
                messages: [...agent.messages, {
                  id: queuedId,
                  role: "system",
                  text: `Task queued (position #${e.position}): ${e.prompt.slice(0, 100)}`,
                  timestamp: Date.now(),
                }],
              });
            }
            break;
          }
          case "TOKEN_UPDATE": {
            const agent = nextAgents.get(e.agentId) ?? defaultAgent(e.agentId);
            const baseline = agent._tokenBaseline ?? { inputTokens: 0, outputTokens: 0 };
            nextAgents.set(e.agentId, {
              ...agent,
              tokenUsage: {
                inputTokens: baseline.inputTokens + e.inputTokens,
                outputTokens: baseline.outputTokens + e.outputTokens,
              },
            });
            break;
          }
          case "AGENT_DEFS": {
            Object.assign(partialState, { agentDefs: e.agents });
            break;
          }
          case "TEAM_PHASE": {
            nextTeamPhases.set(e.teamId, { phase: e.phase, leadAgentId: e.leadAgentId });
            saveTeamPhases(nextTeamPhases);
            break;
          }
          case "SUGGESTION": {
            nextSuggestions = [...nextSuggestions, { text: e.text, author: e.author, timestamp: e.timestamp }].slice(-50);
            Object.assign(partialState, { suggestions: nextSuggestions });
            break;
          }
          case "PREVIEW_READY": {
            Object.assign(partialState, { pendingPreviewUrl: e.url });
            break;
          }
          case "FOLDER_PICKED": {
            const cb = folderPickCallbacks.get(e.requestId);
            if (cb) {
              cb(e.path);
              folderPickCallbacks.delete(e.requestId);
            }
            break;
          }
          case "IMAGE_UPLOADED": {
            const cb = imageUploadCallbacks.get(e.requestId);
            if (cb) {
              cb(e.path);
              imageUploadCallbacks.delete(e.requestId);
            }
            break;
          }
          case "PROJECT_LIST": {
            Object.assign(partialState, { projectList: e.projects });
            break;
          }
          case "PROJECT_DATA": {
            Object.assign(partialState, {
              viewingProjectId: e.projectId,
              viewingProjectName: e.name,
              viewingProjectEvents: e.events as GatewayEvent[],
            });
            break;
          }
          case "KNOWLEDGE_SYNCED": {
            Object.assign(partialState, {
              knowledgeContent: e.content,
              knowledgeDir: e.projectDir,
            });
            break;
          }
        }
      }

      return {
        ...partialState,
        agents: nextAgents,
        teamMessages: nextTeamMessages,
        teamPhases: nextTeamPhases,
        suggestions: nextSuggestions,
      };
    });
  },
}));
