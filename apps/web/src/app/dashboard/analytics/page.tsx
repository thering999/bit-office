"use client";

import { motion } from "framer-motion";
import { useOfficeStore } from "@/store/office-store";
import { useMemo } from "react";

export default function AnalyticsPage() {
  const agentsMap = useOfficeStore(state => state.agents);
  const agents = useMemo(() => Array.from(agentsMap.values()), [agentsMap]);

  const totalTokens = useMemo(() => {
    return agents.reduce((acc, a) => ({
      input: acc.input + a.tokenUsage.inputTokens,
      output: acc.output + a.tokenUsage.outputTokens
    }), { input: 0, output: 0 });
  }, [agents]);

  const agentStats = useMemo(() => {
    const total = agents.length;
    const working = agents.filter(a => a.status === "working").length;
    const idle = agents.filter(a => a.status === "idle").length;
    const error = agents.filter(a => a.status === "error").length;
    return { total, working, idle, error };
  }, [agents]);

  const stats = [
    { label: "Active Agents", value: agentStats.total.toString(), change: `${agentStats.working} active`, positive: true },
    { label: "Total Tokens", value: ((totalTokens.input + totalTokens.output) / 1000).toFixed(1) + "k", change: "+12.5%", positive: true },
    { label: "Success Rate", value: "99.9%", change: "+0.1%", positive: true },
    { label: "System Load", value: (agentStats.working > 0 ? "Medium" : "Low"), change: "-4.2%", positive: true },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-white/90">System Analytics</h1>
        <p className="text-sm text-white/40">Real-time performance metrics and historical data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-[#111] border border-white/5 rounded-3xl"
          >
            <p className="text-xs font-medium text-white/30 uppercase tracking-widest">{stat.label}</p>
            <div className="flex items-baseline gap-3 mt-2">
              <h3 className="text-3xl font-light text-white">{stat.value}</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 p-8 bg-[#111] border border-white/5 rounded-[2rem] h-[400px] flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-medium text-white/80">Token Consumption (Per Agent)</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Input
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-white/40 uppercase">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div> Output
              </span>
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-4 px-2 pb-4 overflow-x-auto custom-scrollbar">
            {agents.map((agent) => (
              <div key={agent.agentId} className="flex-1 min-w-[60px] group relative flex flex-col items-center justify-end gap-1">
                <div 
                  className="w-full bg-purple-500/40 rounded-t-sm group-hover:bg-purple-500/60 transition-colors" 
                  style={{ height: `${Math.min(agent.tokenUsage.outputTokens / 500, 100)}%` }}
                ></div>
                <div 
                  className="w-full bg-indigo-500/40 rounded-t-sm group-hover:bg-indigo-500/60 transition-colors" 
                  style={{ height: `${Math.min(agent.tokenUsage.inputTokens / 1000, 100)}%` }}
                ></div>
                <div className="mt-2 text-[10px] text-white/20 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                  {agent.name}
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-white/10 italic text-sm">
                No active agents to track
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-[#111] border border-white/5 rounded-[2rem] flex flex-col"
        >
          <h3 className="text-lg font-medium text-white/80 mb-8">Agent Status</h3>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {[
              { label: "Working", value: agentStats.working, total: agentStats.total, color: "bg-indigo-500" },
              { label: "Idle", value: agentStats.idle, total: agentStats.total, color: "bg-emerald-500" },
              { label: "Error", value: agentStats.error, total: agentStats.total, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">{item.label}</span>
                  <span className="text-white/40 font-mono">{item.value} / {item.total}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : "0%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 rounded-[2rem] relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-white mb-2">Smart Insights</h3>
          <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
            Your system performance has improved by <span className="text-indigo-400 font-bold">14%</span> compared to last week. 
            Recommendation: Consider scaling the <span className="text-indigo-400">Agent Executor</span> service to handle upcoming traffic peaks detected in historical patterns.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -mr-32 -mt-32 group-hover:bg-indigo-500/20 transition-colors"></div>
      </div>
    </div>
  );
}
