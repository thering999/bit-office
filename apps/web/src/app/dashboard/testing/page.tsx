"use client";

import { useState, useEffect } from "react";
import { useOfficeStore } from "@/store/office-store";
import type { ChatMessage } from "@office/shared";
import { sendCommand } from "@/lib/connection";
import { nanoid } from "nanoid";
import { motion, AnimatePresence } from "framer-motion";

interface Presets {
  title: string;
  emoji: string;
  prompt: string;
}

const PRESET_PROMPTS: Presets[] = [
  {
    title: "Verify Git Environment",
    emoji: "🔍",
    prompt: "Check git status and determine if the workspace has any uncommitted changes or active files in staging."
  },
  {
    title: "Analyze Directory Tree",
    emoji: "📂",
    prompt: "Generate a summary of the current project directory layout and list the main active directories under src."
  },
  {
    title: "Backend Smoke Test",
    emoji: "⚡",
    prompt: "Execute backend test suite checking if all database and gateway test specs complete without throwing failures."
  },
  {
    title: "Swarm Diagnostic Review",
    emoji: "🩺",
    prompt: "Audit the local swarm's overall health diagnostics and make concrete recommendations to prevent key exhaustion."
  }
];

export default function AgentPlaygroundPage() {
  const connected = useOfficeStore((state) => state.connected);
  const agents = useOfficeStore((state) => state.agents);
  const agentDefs = useOfficeStore((state) => state.agentDefs);
  const systemLogs = useOfficeStore((state) => state.systemLogs);
  const executionSteps = useOfficeStore((state) => state.executionSteps);

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [promptText, setPromptText] = useState("");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTaskStatus, setActiveTaskStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [taskResult, setTaskResult] = useState<any | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Fallback list of agents if none are synchronized yet
  const availableAgents = Array.from(agents.values()).length > 0
    ? Array.from(agents.values())
    : agentDefs.length > 0
    ? agentDefs.map((d) => ({ agentId: d.id, name: d.name, role: d.role }))
    : [
        { agentId: "boss", name: "Swarm Boss", role: "Product Manager & Swarm Commander" },
        { agentId: "coder-fe", name: "Frontend Coder", role: "UI & Component Architect" },
        { agentId: "coder-be", name: "Backend Coder", role: "Database & Gateway Engineer" },
        { agentId: "reviewer", name: "Code Reviewer", role: "Quality Assurance Specialist" }
      ];

  // Auto-select first agent on mount
  useEffect(() => {
    if (availableAgents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(availableAgents[0].agentId);
    }
  }, [availableAgents, selectedAgentId]);

  // Sync active task statuses from execution steps and logs
  useEffect(() => {
    if (!activeTaskId) return;

    // Check if task completed
    const doneStep = executionSteps.find((s) => s.agentId === selectedAgentId && s.type === "TASK_DONE");
    if (doneStep) {
      setActiveTaskStatus("done");
      // Find matching reply in agent messages to get full result payload
      const agentObj = agents.get(selectedAgentId);
      if (agentObj) {
        const lastMsg = agentObj.messages.find((m: ChatMessage) => m.role === "agent" && m.result);
        if (lastMsg?.result) {
          setTaskResult(lastMsg.result);
        }
      }
    }

    // Check if task failed
    const failStep = executionSteps.find((s) => s.agentId === selectedAgentId && s.type === "TASK_FAILED");
    if (failStep) {
      setActiveTaskStatus("error");
      const agentObj = agents.get(selectedAgentId);
      if (agentObj) {
        const lastMsg = agentObj.messages.find((m: ChatMessage) => m.id?.includes("error"));
        setTaskError(lastMsg?.text || "Task execution failed.");
      }
    }
  }, [executionSteps, activeTaskId, selectedAgentId, agents]);

  const handleRunTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      alert("Please ensure the Swarm Gateway is connected and online first.");
      return;
    }
    if (!promptText.trim()) return;

    const taskId = nanoid(8);
    setActiveTaskId(taskId);
    setActiveTaskStatus("running");
    setTaskResult(null);
    setTaskError(null);

    // Store workDir locally so RUN_TASK can pass it as repoPath
    const agentObj = agents.get(selectedAgentId);
    const repoPath = agentObj?.workDir || undefined;

    sendCommand({
      type: "RUN_TASK",
      agentId: selectedAgentId,
      taskId,
      prompt: promptText,
      repoPath
    });
  };

  const handleCancelTask = () => {
    if (activeTaskId) {
      sendCommand({
        type: "CANCEL_TASK",
        agentId: selectedAgentId,
        taskId: activeTaskId
      });
      setActiveTaskStatus("error");
      setTaskError("Task cancelled by operator.");
    }
  };

  const getAgentDetails = () => {
    const ag = agents.get(selectedAgentId);
    if (ag) return ag;
    const def = agentDefs.find((d) => d.id === selectedAgentId);
    return def ? { name: def.name, role: def.role } : { name: selectedAgentId, role: "Swarm Agent" };
  };

  // Filter logs only for our specific target agent and task
  const currentTaskLogs = systemLogs.filter((l) => l.agentId === selectedAgentId);
  const currentTaskSteps = executionSteps.filter((s) => s.agentId === selectedAgentId);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Playground Controller Side */}
      <div className="lg:col-span-1 space-y-6">
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h2 className="text-lg font-bold text-white/90">Test Playground</h2>
              <p className="text-xs text-white/40">Directly command and benchmark dynamic swarm agents</p>
            </div>
          </div>

          <form onSubmit={handleRunTask} className="space-y-4">
            {/* Target Agent Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/30 uppercase tracking-widest block">Command Target Agent</label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                disabled={activeTaskStatus === "running"}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white/80 focus:border-indigo-500/50 outline-none transition-colors"
              >
                {availableAgents.map((a) => (
                  <option key={a.agentId} value={a.agentId}>
                    {a.name} ({a.role.split(" ")[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Prompt Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/30 uppercase tracking-widest block">Task Prompt</label>
              <textarea
                placeholder="Instruct the agent on what task to execute..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={5}
                disabled={activeTaskStatus === "running"}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors text-white/80 text-sm placeholder:text-white/10"
              />
            </div>

            {/* Controls */}
            {activeTaskStatus === "running" ? (
              <button
                type="button"
                onClick={handleCancelTask}
                className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-2xl transition-all text-sm font-semibold flex items-center justify-center gap-2"
              >
                🛑 Terminate Execution
              </button>
            ) : (
              <button
                type="submit"
                disabled={!promptText.trim()}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-2xl transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                🚀 Run Swarm Task
              </button>
            )}
          </form>
        </div>

        {/* Preset Prompt Selectors */}
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Ready Preset Templates</h3>
          <div className="grid grid-cols-1 gap-2">
            {PRESET_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPromptText(p.prompt)}
                disabled={activeTaskStatus === "running"}
                className="p-3 bg-black/20 hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-2xl transition-all text-left flex items-start gap-3 disabled:opacity-50"
              >
                <span className="text-lg mt-0.5">{p.emoji}</span>
                <div>
                  <h4 className="text-xs font-bold text-white/80 leading-none">{p.title}</h4>
                  <p className="text-[10px] text-white/30 mt-1 line-clamp-1">{p.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Logs & Output Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Swarm Target Agent Details */}
        <div className="p-6 bg-[#111] border border-white/5 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl font-bold">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-white/90 text-sm">{getAgentDetails().name}</h3>
              <p className="text-xs text-white/40">{getAgentDetails().role}</p>
            </div>
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wider font-mono px-3 py-1.5 rounded-full ${
              activeTaskStatus === "running"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                : activeTaskStatus === "done"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : activeTaskStatus === "error"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-white/5 text-white/40"
            }`}
          >
            {activeTaskStatus === "running" ? "Active" : activeTaskStatus === "done" ? "Succeeded" : activeTaskStatus === "error" ? "Failed" : "Idle"}
          </span>
        </div>

        {/* Task Streams Console */}
        <div className="border border-white/5 rounded-3xl bg-black overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="px-6 py-4 bg-zinc-900 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-bold text-white/50 font-mono">TASK EXECUTION LOGS</span>
            <span className="text-[10px] text-white/30 font-mono">
              Task ID: {activeTaskId || "N/A"}
            </span>
          </div>

          {/* Core Stream View */}
          <div className="flex-1 p-6 overflow-y-auto space-y-3 font-mono text-[11px] select-text">
            {activeTaskStatus === "idle" && (
              <div className="h-full flex flex-col items-center justify-center text-white/20 select-none">
                <span className="text-3xl mb-2">⚡</span>
                <span>Ready to run. Select an agent and enter a prompt to begin test.</span>
              </div>
            )}

            {activeTaskStatus === "running" && currentTaskLogs.length === 0 && currentTaskSteps.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-white/20 select-none">
                <span className="text-3xl mb-2 animate-bounce">🌀</span>
                <span>Initializing agent process...</span>
              </div>
            )}

            {/* Steps & Logs Chronological Feed */}
            {currentTaskSteps.map((step) => (
              <div key={step.id} className="text-indigo-400/90 py-1 border-b border-white/5">
                <span className="text-white/20">[{new Date(step.timestamp).toLocaleTimeString()}]</span>{" "}
                <span className="font-bold">✦ {step.message}</span>
              </div>
            ))}

            {currentTaskLogs.map((log) => {
              const isErr = log.stream === "stderr";
              return (
                <div
                  key={log.id}
                  className={`py-0.5 px-2 rounded hover:bg-white/[0.01] flex items-start gap-4 transition-colors ${
                    isErr ? "text-rose-400 bg-rose-950/5" : "text-emerald-400/90"
                  }`}
                >
                  <span className="text-white/20 select-none w-14 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <span className="whitespace-pre-wrap break-all flex-1">{log.chunk}</span>
                </div>
              );
            })}

            {/* Task Finished Cards */}
            {activeTaskStatus === "done" && taskResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3 font-sans mt-4 text-xs"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>✔</span>
                  <span>Task Succeeded! Here is the summary:</span>
                </div>
                <p className="text-white/70 whitespace-pre-wrap">{taskResult.summary}</p>
                {taskResult.changedFiles?.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="font-bold text-white/55 uppercase tracking-wide block text-[10px] mb-1">Changed Files:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-indigo-300 font-mono">
                      {taskResult.changedFiles.map((f: string, i: number) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {activeTaskStatus === "error" && taskError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl font-sans mt-4 text-xs"
              >
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <span>✖</span>
                  <span>Execution Aborted</span>
                </div>
                <p className="text-white/70 whitespace-pre-wrap mt-2">{taskError}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
