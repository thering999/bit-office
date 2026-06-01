"use client";

import { useOfficeStore } from "@/store/office-store";
import { sendCommand } from "@/lib/connection";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";

export default function AgentsPage() {
  const agentsMap = useOfficeStore(state => state.agents);
  const agents = useMemo(() => Array.from(agentsMap.values()), [agentsMap]);
  const [search, setSearch] = useState("");

  const filteredAgents = useMemo(() => {
    return agents.filter(a => 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [agents, search]);

  const handleFireAgent = (agentId: string) => {
    if (confirm(`Are you sure you want to terminate ${agentId}?`)) {
      sendCommand({ type: "FIRE_AGENT", agentId });
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    idle: "text-white/40 bg-white/5",
    working: "text-indigo-400 bg-indigo-500/10",
    waiting_approval: "text-amber-400 bg-amber-500/10",
    error: "text-red-400 bg-red-500/10",
    done: "text-emerald-400 bg-emerald-500/10",
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-white/90">Swarm Control</h1>
          <p className="text-sm text-white/40">Manage and orchestrate active AI agents</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search agents..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500/50 focus:outline-none transition-colors text-sm"
          />
          <svg className="absolute right-3 top-2.5 text-white/20" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAgents.map((agent) => (
            <motion.div
              key={agent.agentId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col hover:border-indigo-500/30 transition-all duration-500"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-xl">
                      🤖
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{agent.name}</h3>
                      <p className="text-xs text-white/40 font-mono">{agent.agentId}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${STATUS_COLORS[agent.status] || STATUS_COLORS.idle}`}>
                    {agent.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">Assigned Role</p>
                    <p className="text-sm text-white/70">{agent.role || "General Assistant"}</p>
                  </div>

                  {agent.currentPrompt && (
                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[10px] text-indigo-400/60 uppercase tracking-widest font-bold mb-1">Current Task</p>
                      <p className="text-xs text-white/50 line-clamp-2 italic">&quot;{agent.currentPrompt}&quot;</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">Tokens In</p>
                      <p className="text-sm text-white/60 font-mono">{(agent.tokenUsage.inputTokens / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-1">Tokens Out</p>
                      <p className="text-sm text-white/60 font-mono">{(agent.tokenUsage.outputTokens / 1000).toFixed(1)}k</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleFireAgent(agent.agentId)}
                  className="text-[10px] text-red-400/60 hover:text-red-400 font-bold uppercase tracking-widest transition-colors"
                >
                  Terminate Agent
                </button>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAgents.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem]">
            <p className="text-white/20 text-lg font-light">
              {search ? `No agents matching "${search}"` : "No active agents in the swarm"}
            </p>
            {!search && (
              <p className="text-xs text-white/10 mt-2">
                Deploy agents via the Office interface to see them here.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
