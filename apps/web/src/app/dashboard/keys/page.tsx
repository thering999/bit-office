"use client";

import { useState, useEffect } from "react";
import { useOfficeStore } from "@/store/office-store";
import { sendCommand } from "@/lib/connection";
import { motion, AnimatePresence } from "framer-motion";

interface KeyStatus {
  key: string;
  keyPrefix: string;
  provider: string;
  isBlacklisted: boolean;
  exhaustedUntil: number;
  remainingMs: number;
  useCount: number;
  failCount: number;
  lastUsedAt: number;
}

export default function KeyRotationPage() {
  const connected = useOfficeStore((state) => state.connected);
  const config = useOfficeStore((state) => state.config);
  const keyStatus = useOfficeStore((state) => state.keyStatus) as KeyStatus[] | null;

  // Local state for keys management inputs
  const [geminiInput, setGeminiInput] = useState("");
  const [claudeInput, setClaudeInput] = useState("");
  const [openaiInput, setOpenaiInput] = useState("");
  const [openRouterInput, setOpenRouterInput] = useState("");
  const [deepSeekInput, setDeepSeekInput] = useState("");
  const [typhoonInput, setTyphoonInput] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"status" | "manage">("status");
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Periodically poll key status and local clock
  useEffect(() => {
    if (connected) {
      sendCommand({ type: "GET_CONFIG" });
      sendCommand({ type: "GET_KEY_STATUS" });

      const interval = setInterval(() => {
        sendCommand({ type: "GET_KEY_STATUS" });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [connected]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update input fields when config is fetched
  useEffect(() => {
    if (config) {
      if (config.geminiApiKeys) setGeminiInput(config.geminiApiKeys.join(", "));
      if (config.claudeApiKeys) setClaudeInput(config.claudeApiKeys.join(", "));
      if (config.openaiApiKeys) setOpenaiInput(config.openaiApiKeys.join(", "));
      if (config.openRouterApiKeys) setOpenRouterInput(config.openRouterApiKeys.join(", "));
      if (config.deepSeekApiKeys) setDeepSeekInput(config.deepSeekApiKeys.join(", "));
      if (config.typhoonApiKeys) setTyphoonInput(config.typhoonApiKeys.join(", "));
    }
  }, [config]);

  const handleResetBlacklist = () => {
    if (confirm("Are you sure you want to reset all blacklisted keys and clear all cooldown periods?")) {
      sendCommand({ type: "RESET_KEYS" });
    }
  };

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    sendCommand({
      type: "UPDATE_CONFIG",
      config: {
        geminiApiKeys: geminiInput.split(",").map(k => k.trim()).filter(Boolean),
        claudeApiKeys: claudeInput.split(",").map(k => k.trim()).filter(Boolean),
        openaiApiKeys: openaiInput.split(",").map(k => k.trim()).filter(Boolean),
        openRouterApiKeys: openRouterInput.split(",").map(k => k.trim()).filter(Boolean),
        deepSeekApiKeys: deepSeekInput.split(",").map(k => k.trim()).filter(Boolean),
        typhoonApiKeys: typhoonInput.split(",").map(k => k.trim()).filter(Boolean),
      }
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      sendCommand({ type: "GET_KEY_STATUS" });
    }, 2000);
  };

  const getRemainingTimeStr = (exhaustedUntil: number) => {
    const diff = exhaustedUntil - currentTime;
    if (diff <= 0) return "Ready";
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const providerMeta: Record<string, { color: string; bg: string; icon: string; title: string }> = {
    gemini: { color: "text-emerald-400 border-emerald-500/20", bg: "bg-emerald-500/5", icon: "🟢", title: "Google Gemini" },
    claude: { color: "text-amber-400 border-amber-500/20", bg: "bg-amber-500/5", icon: "🟠", title: "Anthropic Claude" },
    openai: { color: "text-sky-400 border-sky-500/20", bg: "bg-sky-500/5", icon: "🔵", title: "OpenAI GPT" },
    openrouter: { color: "text-violet-400 border-violet-500/20", bg: "bg-violet-500/5", icon: "🟣", title: "OpenRouter" },
    deepseek: { color: "text-blue-400 border-blue-500/20", bg: "bg-blue-500/5", icon: "🌀", title: "DeepSeek" },
    typhoon: { color: "text-red-400 border-red-500/20", bg: "bg-red-500/5", icon: "🔴", title: "Typhoon" },
    unknown: { color: "text-zinc-400 border-zinc-500/20", bg: "bg-zinc-500/5", icon: "⚪", title: "Unknown Provider" }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white/90">API Key Rotation Pool</h1>
          <p className="text-sm text-white/40">Fault-tolerant key balancing, automatic error cooldowns, and real-time statuses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleResetBlacklist}
            className="px-4 py-2 border border-rose-500/30 hover:border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl transition-all text-sm font-medium flex items-center gap-2"
          >
            🔄 Reset Blacklists
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-2">
        <button
          onClick={() => setActiveTab("status")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === "status" ? "border-indigo-500 text-white" : "border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          📈 Real-Time Pool Status
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
            activeTab === "manage" ? "border-indigo-500 text-white" : "border-transparent text-white/40 hover:text-white/70"
          }`}
        >
          🔑 Manage API Keys
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === "status" ? (
          <motion.div
            key="status-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between">
                <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Total Configured Keys</span>
                <span className="text-3xl font-bold mt-2 text-indigo-400">
                  {keyStatus ? keyStatus.length : 0}
                </span>
              </div>
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between">
                <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Active & Ready</span>
                <span className="text-3xl font-bold mt-2 text-emerald-400">
                  {keyStatus ? keyStatus.filter((k) => !k.isBlacklisted).length : 0}
                </span>
              </div>
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between">
                <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">In Cooldown / Suspended</span>
                <span className="text-3xl font-bold mt-2 text-rose-400">
                  {keyStatus ? keyStatus.filter((k) => k.isBlacklisted).length : 0}
                </span>
              </div>
              <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between">
                <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">Gateway Connection</span>
                <span className={`text-sm font-bold uppercase tracking-wider mt-3 flex items-center gap-2 ${connected ? "text-emerald-400" : "text-rose-500"}`}>
                  <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                  {connected ? "Gateway Online" : "Gateway Offline"}
                </span>
              </div>
            </div>

            {/* Keys Table / Visual Cards */}
            {!keyStatus || keyStatus.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl flex flex-col items-center justify-center">
                <span className="text-4xl mb-4">🔑</span>
                <p className="text-white/40 text-lg font-light">No keys active in the rotation pool.</p>
                <button
                  onClick={() => setActiveTab("manage")}
                  className="mt-4 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 rounded-xl transition-all text-sm font-medium"
                >
                  Configure API Keys Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {keyStatus.map((k, idx) => {
                  const meta = providerMeta[k.provider] || providerMeta.unknown;
                  const isCoolingDown = k.isBlacklisted;
                  const percentDone = isCoolingDown
                    ? Math.max(0, Math.min(100, 100 - (k.remainingMs / (1000 * 60 * 60)) * 100))
                    : 100;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-6 border rounded-2xl backdrop-blur-md transition-all relative overflow-hidden flex flex-col justify-between h-56 ${meta.bg} ${
                        isCoolingDown ? "border-rose-500/20" : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      {/* Provider Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{meta.icon}</span>
                          <div>
                            <h3 className="font-semibold text-white/90 text-sm leading-none">{meta.title}</h3>
                            <span className="text-[10px] font-mono text-white/30 uppercase mt-1 block">
                              {k.keyPrefix}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase font-mono ${
                            isCoolingDown
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {isCoolingDown ? "Cooldown" : "Healthy"}
                        </span>
                      </div>

                      {/* Stats Core */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div>
                          <span className="text-[10px] text-white/30 uppercase tracking-widest block">Usage Count</span>
                          <span className="text-xl font-bold text-white/80 mt-1 block">{k.useCount}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/30 uppercase tracking-widest block">Fail Count</span>
                          <span className={`text-xl font-bold mt-1 block ${k.failCount > 0 ? "text-rose-400" : "text-white/60"}`}>
                            {k.failCount}
                          </span>
                        </div>
                      </div>

                      {/* Footer & Cooldown Indicator */}
                      <div className="mt-6">
                        {isCoolingDown ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-rose-400 font-semibold">Exhausted</span>
                              <span className="font-mono text-white/60">{getRemainingTimeStr(k.exhaustedUntil)}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-rose-500 transition-all duration-1000"
                                style={{ width: `${percentDone}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center text-[10px] text-white/30">
                            <span>Last Used</span>
                            <span className="font-mono">
                              {k.lastUsedAt > 0 ? new Date(k.lastUsedAt).toLocaleTimeString() : "Never"}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="manage-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-4xl mx-auto"
          >
            <form onSubmit={handleSaveKeys} className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg">
                  🔑
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white/90">Configure Rotation Keys</h2>
                  <p className="text-xs text-white/40">Provide multiple keys separated by commas for fault-tolerant rotation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest block">Google Gemini Keys</label>
                  <textarea
                    placeholder="AIzaSy..., AIzaSy..."
                    value={geminiInput}
                    onChange={(e) => setGeminiInput(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors text-white/80 font-mono text-xs placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest block">Anthropic Claude Keys</label>
                  <textarea
                    placeholder="sk-ant-..., sk-ant-..."
                    value={claudeInput}
                    onChange={(e) => setClaudeInput(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors text-white/80 font-mono text-xs placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest block">OpenAI GPT Keys</label>
                  <textarea
                    placeholder="sk-..., sk-..."
                    value={openaiInput}
                    onChange={(e) => setOpenaiInput(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors text-white/80 font-mono text-xs placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest block">OpenRouter Keys</label>
                  <textarea
                    placeholder="sk-or-..., sk-or-..."
                    value={openRouterInput}
                    onChange={(e) => setOpenRouterInput(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors text-white/80 font-mono text-xs placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest block">DeepSeek Keys</label>
                  <textarea
                    placeholder="sk-..., sk-..."
                    value={deepSeekInput}
                    onChange={(e) => setDeepSeekInput(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors text-white/80 font-mono text-xs placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-widest block">Typhoon Keys (TH)</label>
                  <textarea
                    placeholder="sk-..., sk-..."
                    value={typhoonInput}
                    onChange={(e) => setTyphoonInput(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors text-white/80 font-mono text-xs placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <p className="text-xs text-white/30 italic">
                  💡 Multiple keys can be separated by commas to increase swarm concurrency.
                </p>
                <button
                  type="submit"
                  className={`px-8 py-4 rounded-2xl font-semibold transition-all duration-300 ${
                    isSaved
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
                  }`}
                >
                  {isSaved ? "Configuration Updated!" : "Update Secure Rotation"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
