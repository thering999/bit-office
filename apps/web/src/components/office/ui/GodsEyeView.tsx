import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfficeStore } from '../../../store/office-store';

/**
 * GodsEyeView visualizes the AI swarm as a dynamic node-link diagram.
 * It shows the leader, workers, and their current delegation relationships.
 * Optimized for God-Tier aesthetics with glassmorphism and premium animations.
 */
export const GodsEyeView: React.FC = () => {
  const agentsMap = useOfficeStore(state => state.agents);
  const teamMessages = useOfficeStore(state => state.teamMessages);
  const activePackets = useOfficeStore(state => state.activePackets);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const agents = useMemo(() => Array.from(agentsMap.values()), [agentsMap]);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  }, []);

  // Filter for team agents only, and exclude 'Vera' (Mission Verificator) from the visual diagram
  const teamAgents = useMemo(() => 
    agents.filter(a => (a.teamId || a.isTeamLead) && 
      !a.name.toLowerCase().includes('vera') && 
      !a.role.toLowerCase().includes('verificator')
    ),
    [agents]
  );

  // Calculate node positions in a circle
  const nodes = useMemo(() => {
    const count = teamAgents.length;
    if (count === 0) return [];
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;

    return teamAgents.map((agent, i) => {
      // Team lead is always in the center or top
      if (agent.isTeamLead) {
        return { ...agent, x: centerX, y: centerY - (count > 1 ? radius * 0.2 : 0) };
      }
      
      const angle = (i / (count > 1 ? count - 1 : 1)) * Math.PI * 2;
      return {
        ...agent,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  }, [teamAgents, dimensions]);

  // Extract active delegations (from -> to)
  const links = useMemo(() => {
    const activeLinks: Array<{ from: string; to: string; type: string }> = [];
    const seen = new Set<string>();

    [...teamMessages].reverse().forEach(msg => {
      if (msg.messageType === 'delegation' && msg.toAgentId) {
        const key = `${msg.fromAgentId}-${msg.toAgentId}`;
        if (!seen.has(key)) {
          activeLinks.push({ from: msg.fromAgentId, to: msg.toAgentId, type: 'delegation' });
          seen.add(key);
        }
      }
    });

    return activeLinks;
  }, [teamMessages]);

  if (teamAgents.length === 0) return null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[350px] rounded-2xl border border-white/10 overflow-hidden backdrop-blur-md p-4"
      style={{
        background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(2, 6, 23, 0.8) 100%)',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.02)'
      }}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ 
        backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', 
        backgroundSize: '24px 24px' 
      }} />

      <div className="relative w-full h-full">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.1)" />
              <stop offset="50%" stopColor="rgba(99, 102, 241, 0.6)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.1)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <AnimatePresence>
            {links.map((link) => {
              const from = nodes.find(n => n.agentId === link.from);
              const to = nodes.find(n => n.agentId === link.to);
              if (!from || !to) return null;

              return (
                <g key={`link-${link.from}-${link.to}`}>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="url(#linkGradient)"
                    strokeWidth="2"
                    strokeDasharray="4 8"
                    filter="url(#glow)"
                  />
                  {/* Flowing particle animation along the link */}
                  <motion.circle
                    r="2"
                    fill="#818cf8"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{
                      offsetPath: `path('M ${from.x} ${from.y} L ${to.x} ${to.y}')`,
                      filter: 'drop-shadow(0 0 4px #818cf8)'
                    }}
                  />
                </g>
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Real-time Data Packets */}
        <AnimatePresence>
          {activePackets.map((packet) => {
            const from = nodes.find(n => n.agentId === packet.from);
            const to = nodes.find(n => n.agentId === packet.to);
            if (!from || !to) return null;

            return (
              <motion.div
                key={packet.id}
                initial={{ 
                  x: from.x, 
                  y: from.y, 
                  scale: 0, 
                  opacity: 0 
                }}
                animate={{ 
                  x: to.x, 
                  y: to.y, 
                  scale: [0, 1.5, 1, 0.5], 
                  opacity: [0, 1, 1, 0],
                  filter: [
                    'blur(0px)',
                    'blur(2px)',
                    'blur(1px)',
                    'blur(4px)'
                  ]
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="absolute z-50 w-3 h-3 -ml-1.5 -mt-1.5 pointer-events-none"
              >
                {/* Core Packet Body */}
                <div className={`w-full h-full rounded-full shadow-2xl ${
                  packet.type === 'delegation' 
                    ? 'bg-indigo-400 shadow-indigo-500/50' 
                    : 'bg-emerald-400 shadow-emerald-500/50'
                }`} />
                
                {/* Outer Glow */}
                <div className={`absolute inset-[-4px] rounded-full blur-md opacity-60 ${
                  packet.type === 'delegation' ? 'bg-indigo-500' : 'bg-emerald-500'
                }`} />

                {/* Inner Core */}
                <div className="absolute inset-[30%] bg-white rounded-full" />
                
                {/* Energy Trail */}
                <motion.div 
                  className={`absolute inset-0 rounded-full ${
                    packet.type === 'delegation' ? 'bg-indigo-400' : 'bg-emerald-400'
                  }`}
                  animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {nodes.map((node) => (
            <motion.div
              key={node.agentId}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                x: node.x - 28,
                y: node.y - 28
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="absolute z-10"
            >
              <div className="relative flex flex-col items-center group cursor-pointer">
                {/* Node Aura */}
                <div 
                  className={`absolute inset-[-8px] rounded-full blur-xl opacity-20 transition-opacity group-hover:opacity-40
                    ${node.status === 'working' || node.status === 'coding' ? 'bg-indigo-500' : 
                      node.status === 'searching' ? 'bg-amber-500' :
                      node.status === 'testing' ? 'bg-sky-500' :
                      node.status === 'error' ? 'bg-rose-500' : 
                      'bg-slate-400'}`} 
                />

                {/* Thought Stream Tooltip */}
                {node.statusDetails && node.status !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    key={node.statusDetails}
                    className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 p-2 rounded-xl bg-slate-950/90 border border-white/10 shadow-2xl backdrop-blur-md pointer-events-none z-20"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <div className="text-[9px] text-indigo-300 font-black uppercase tracking-widest opacity-80">AGENT_COGNITION</div>
                    </div>
                    <div className="text-[10px] text-slate-200 line-clamp-3 leading-relaxed font-medium">
                      {node.statusDetails}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 rotate-45 border-r border-b border-white/10" />
                  </motion.div>
                )}

                {/* Node Core */}
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500
                  ${node.status === 'working' || node.status === 'coding' ? 'border-indigo-400 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 
                    node.status === 'searching' ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]' :
                    node.status === 'testing' ? 'border-sky-400 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.3)]' :
                    node.status === 'error' ? 'border-rose-400 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.3)]' :
                    'border-white/10 bg-white/5'}
                  backdrop-blur-xl
                `}>
                  <span className="text-2xl filter drop-shadow-md">
                    {node.isTeamLead ? '👑' : (node.role.toLowerCase().includes('qa') ? '🔍' : '🤖')}
                  </span>

                  {/* Activity Indicator */}
                  {(node.status === 'working' || node.status === 'coding' || node.status === 'searching' || node.status === 'testing') && (
                    <div className="absolute -top-1 -right-1">
                      <div className={`w-4 h-4 rounded-full border-2 border-[#020617] flex items-center justify-center
                        ${node.status === 'searching' ? 'bg-amber-500' : 
                          node.status === 'testing' ? 'bg-sky-500' : 
                          'bg-indigo-500'}`}>
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-1.5 h-1.5 bg-white rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Failover Shield */}
                  {node.isFailover && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-[#020617] flex items-center justify-center shadow-lg" title="Failover Protection Active">
                      <span className="text-[10px] text-white font-bold">🛡️</span>
                    </div>
                  )}
                </div>

                {/* Node Label */}
                <div className="mt-3 text-center px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="text-[10px] font-bold text-white tracking-tight leading-none mb-0.5">{node.name}</div>
                  <div className="text-[8px] text-slate-400 font-medium uppercase tracking-tighter opacity-70">{node.role}</div>
                </div>

                {/* Floating status badge */}
                {node.status !== 'idle' && (
                  <motion.div 
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: -10, opacity: 1 }}
                    className={`absolute -top-6 text-[9px] font-black px-2 py-0.5 rounded-full border shadow-sm
                      ${node.status === 'working' || node.status === 'coding' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 
                        node.status === 'searching' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        node.status === 'testing' ? 'bg-sky-500/20 text-sky-300 border-sky-500/30' :
                        node.status === 'error' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}
                  >
                    {node.status.toUpperCase()}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
