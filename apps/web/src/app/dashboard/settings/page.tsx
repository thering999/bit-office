"use client";

import { useState, useEffect } from "react";
import { getConnection, saveConnection, ConnectionInfo } from "@/lib/storage";
import { useOfficeStore } from "@/store/office-store";
import { connect, sendCommand } from "@/lib/connection";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [config, setConfig] = useState<ConnectionInfo>({
    mode: "ws",
    machineId: "",
    wsUrl: "ws://localhost:9100",
    role: "owner",
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [gatewayConfig, setGatewayConfig] = useState({
    defaultModel: "gemini-1.5-flash",
    openaiKey: "",
    geminiKey: "",
    anthropicKey: "",
  });
  const connected = useOfficeStore(state => state.connected);
  const setConnected = useOfficeStore(state => state.setConnected);

  useEffect(() => {
    const saved = getConnection();
    if (saved) {
      setConfig(saved);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveConnection(config);

    // If connected, sync config to gateway
    if (connected) {
      sendCommand({
        type: "UPDATE_CONFIG",
        config: gatewayConfig
      });
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      // Connect and wait for status
      connect(config);
      // Give it a few seconds to establish
      setTimeout(() => setIsTesting(false), 2000);
    } catch (err) {
      console.error(err);
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white/90">Gateway Settings</h1>
        <p className="text-sm text-white/40">Configure the connection to your Bit-Office Gateway</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111] border border-white/5 rounded-3xl p-8"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Connection Mode</label>
              <select 
                value={config.mode}
                onChange={(e) => setConfig({ ...config, mode: e.target.value as any })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors"
              >
                <option value="ws">Websocket (Direct)</option>
                <option value="ably">Ably (Cloud Relay)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Machine ID</label>
              <input 
                type="text"
                value={config.machineId}
                onChange={(e) => setConfig({ ...config, machineId: e.target.value })}
                placeholder="e.g. gateway-01"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Gateway URL</label>
              <input 
                type="text"
                value={config.wsUrl}
                onChange={(e) => setConfig({ ...config, wsUrl: e.target.value })}
                placeholder="ws://localhost:9100"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Role</label>
              <select 
                value={config.role}
                onChange={(e) => setConfig({ ...config, role: e.target.value as any })}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors"
              >
                <option value="owner">Owner (Full Access)</option>
                <option value="collaborator">Collaborator</option>
                <option value="spectator">Spectator (Read-only)</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <p className="text-xs text-white/20 italic">
              Changes will take effect upon the next connection attempt.
            </p>
            <button 
              type="submit"
              className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                isSaved 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95"
              }`}
            >
              {isSaved ? "Settings Saved!" : "Save Configuration"}
            </button>
            <button 
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="ml-4 px-6 py-3 bg-white/5 hover:bg-white/10 text-white/80 rounded-2xl font-medium border border-white/10 transition-all disabled:opacity-50"
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </button>
          </div>
        </form>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
          <h3 className="text-sm font-medium text-white/60 mb-2">System Status</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></div>
            <span className="text-xs text-white/40 font-mono uppercase">
              {connected ? "Gateway Online" : "Gateway Offline"}
            </span>
          </div>
        </div>

        <div className="p-8 bg-[#111] border border-white/5 rounded-[2rem] space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white/90">Gateway Configuration</h2>
              <p className="text-sm text-white/40">Model overrides and provider authentication</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/20 uppercase tracking-widest">Default Model</label>
              <select 
                value={gatewayConfig.defaultModel}
                onChange={(e) => setGatewayConfig({...gatewayConfig, defaultModel: e.target.value})}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors appearance-none text-white/80"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/20 uppercase tracking-widest">OpenAI API Key</label>
              <input 
                type="password" 
                placeholder="sk-..."
                value={gatewayConfig.openaiKey}
                onChange={(e) => setGatewayConfig({...gatewayConfig, openaiKey: e.target.value})}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors text-white/80"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/20 uppercase tracking-widest">Gemini API Key</label>
              <input 
                type="password" 
                placeholder="AIza..."
                value={gatewayConfig.geminiKey}
                onChange={(e) => setGatewayConfig({...gatewayConfig, geminiKey: e.target.value})}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors text-white/80"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/20 uppercase tracking-widest">Anthropic API Key</label>
              <input 
                type="password" 
                placeholder="sk-ant-..."
                value={gatewayConfig.anthropicKey}
                onChange={(e) => setGatewayConfig({...gatewayConfig, anthropicKey: e.target.value})}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-indigo-500/50 focus:outline-none transition-colors text-white/80"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
          <h3 className="text-sm font-medium text-white/60 mb-2">Active Session</h3>
          <p className="text-xs text-white/40 font-mono truncate">ID: {config.sessionToken || "Not Authenticated"}</p>
        </div>
      </div>
    </div>
  );
}
