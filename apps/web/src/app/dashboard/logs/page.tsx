"use client";

import { useState, useEffect, useRef } from "react";
import { useOfficeStore } from "@/store/office-store";
import { motion, AnimatePresence } from "framer-motion";

export default function SystemLogsPage() {
  const connected = useOfficeStore((state) => state.connected);
  const systemLogs = useOfficeStore((state) => state.systemLogs);
  const executionSteps = useOfficeStore((state) => state.executionSteps);
  const agents = useOfficeStore((state) => state.agents);
  const clearLogs = useOfficeStore((state) => state.clearLogs);

  const [activeTab, setActiveTab] = useState<"terminal" | "steps">("terminal");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedStream, setSelectedStream] = useState<"all" | "stdout" | "stderr">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll logic
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [systemLogs, autoScroll, activeTab]);

  const handleExportLogs = () => {
    const logText = systemLogs
      .filter((log) => {
        if (selectedAgent !== "all" && log.agentId !== selectedAgent) return false;
        if (selectedStream !== "all" && log.stream !== selectedStream) return false;
        if (searchQuery && !log.chunk.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .map((log) => {
        const time = new Date(log.timestamp).toISOString();
        return `[${time}] [${log.agentId}] [${log.stream.toUpperCase()}] ${log.chunk}`;
      })
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bit_office_system_logs_${Date.now()}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get distinct agents that actually produced logs
  const loggedAgents = Array.from(new Set(systemLogs.map((l) => l.agentId)));

  const getAgentDisplayName = (id: string) => {
    const agent = agents.get(id);
    return agent ? agent.name : id;
  };

  // Filtering
  const filteredLogs = systemLogs.filter((log) => {
    if (selectedAgent !== "all" && log.agentId !== selectedAgent) return false;
    if (selectedStream !== "all" && log.stream !== selectedStream) return false;
    if (searchQuery && !log.chunk.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredSteps = executionSteps.filter((step) => {
    if (selectedAgent !== "all" && step.agentId !== selectedAgent) return false;
    if (searchQuery && !step.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">System Telemetry & Logs</h1>
          <p className="text-sm text-white/40">Real-time container execution stdout/stderr streams and lifecycle stages</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
              autoScroll
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
            }`}
          >
            {autoScroll ? "🔒 Auto-Scroll Lock" : "🔓 Auto-Scroll Off"}
          </button>
          <button
            onClick={handleExportLogs}
            disabled={systemLogs.length === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-all text-xs font-medium"
          >
            📥 Export Filtered Logs
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 border border-white/5 hover:border-white/10 hover:bg-white/5 text-white/60 rounded-xl transition-all text-xs font-medium"
          >
            🗑️ Clear Screen
          </button>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Agent Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 font-medium">Agent:</span>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/80 focus:border-indigo-500/50 outline-none"
            >
              <option value="all">All Agents</option>
              {loggedAgents.map((id) => (
                <option key={id} value={id}>
                  {getAgentDisplayName(id)}
                </option>
              ))}
            </select>
          </div>

          {/* Stream Filter */}
          {activeTab === "terminal" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 font-medium">Stream:</span>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/80 focus:border-indigo-500/50 outline-none"
              >
                <option value="all">All Outputs</option>
                <option value="stdout">Stdout (Info)</option>
                <option value="stderr">Stderr (Errors)</option>
              </select>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="w-full md:w-64 relative">
          <input
            type="text"
            placeholder="Search logs or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white/80 placeholder:text-white/20 focus:border-indigo-500/50 focus:outline-none transition-colors"
          />
          <span className="absolute left-2.5 top-2 text-white/20 text-xs">🔍</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-2">
        <button
          onClick={() => setActiveTab("terminal")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === "terminal" ? "border-indigo-500 text-white" : "border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          💻 Live Terminal Stream
        </button>
        <button
          onClick={() => setActiveTab("steps")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === "steps" ? "border-indigo-500 text-white" : "border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          🕒 Lifecycle Steps Timeline
        </button>
      </div>

      {/* Main Terminal View */}
      <AnimatePresence mode="wait">
        {activeTab === "terminal" ? (
          <motion.div
            key="terminal-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative border border-white/5 rounded-2xl bg-black overflow-hidden shadow-2xl h-[550px] flex flex-col font-mono text-[11px] leading-relaxed"
          >
            {/* Terminal Window Header */}
            <div className="px-4 py-2.5 bg-zinc-900 border-b border-white/5 flex items-center justify-between text-white/30 text-xs selection:bg-transparent">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/40"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40"></span>
              </div>
              <span>bash - bit-office-swarm.log</span>
              <span className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
            </div>

            {/* Terminal Content Screen */}
            <div className="flex-1 p-6 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/5 selection:bg-indigo-500/30 select-text">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 select-none">
                  <span className="text-3xl mb-2">📟</span>
                  <span>No log output matching filters.</span>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const isErr = log.stream === "stderr";
                  return (
                    <div
                      key={log.id}
                      className={`py-0.5 px-2 rounded hover:bg-white/[0.02] flex items-start gap-4 transition-colors ${
                        isErr ? "text-rose-400 bg-rose-950/5" : "text-emerald-400"
                      }`}
                    >
                      <span className="text-white/20 select-none w-14 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                      </span>
                      <span className="text-indigo-400/80 select-none font-bold shrink-0 w-24 truncate">
                        [{getAgentDisplayName(log.agentId)}]
                      </span>
                      <span className="whitespace-pre-wrap break-all flex-1">{log.chunk}</span>
                    </div>
                  );
                })
              )}
              <div ref={terminalEndRef} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="steps-tab"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {filteredSteps.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-3xl mb-3">🕒</span>
                <p className="text-white/40 text-sm">No lifecycle steps recorded yet.</p>
              </div>
            ) : (
              <div className="relative border-l border-white/5 ml-4 pl-6 space-y-6">
                {filteredSteps.map((step) => {
                  const isError = step.type === "TASK_FAILED";
                  const isSuccess = step.type === "TASK_DONE";
                  const isTool = step.type.startsWith("TOOL_");

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative"
                    >
                      {/* Timeline Dot */}
                      <span className={`absolute -left-[30px] top-1 w-4 h-4 rounded-full border border-black flex items-center justify-center text-[8px] font-bold ${
                        isError
                          ? "bg-rose-500 text-white"
                          : isSuccess
                          ? "bg-emerald-500 text-black"
                          : isTool
                          ? "bg-amber-500 text-black"
                          : "bg-indigo-500 text-white"
                      }`}>
                        {isError ? "✖" : isSuccess ? "✔" : isTool ? "⚙" : "✦"}
                      </span>

                      {/* Timeline Card */}
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white/70">
                            {getAgentDisplayName(step.agentId)}
                          </span>
                          <span className="text-[10px] text-white/30 font-mono">
                            {new Date(step.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className={`text-xs ${isError ? "text-rose-300" : isSuccess ? "text-emerald-300" : "text-white/50"}`}>
                          {step.message}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
