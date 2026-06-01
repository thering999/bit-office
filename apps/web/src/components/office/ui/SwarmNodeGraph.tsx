"use client";
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfficeStore } from '../../../store/office-store';

/**
 * SwarmNodeGraph provides a visual map of the AI swarm topology.
 * Shows active agents as nodes and their communication links.
 */
export const SwarmNodeGraph: React.FC = () => {
  const agentsMap = useOfficeStore(state => state.agents);
  const activePackets = useOfficeStore(state => state.activePackets);
  const teamMessages = useOfficeStore(state => state.teamMessages);
  
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);

  const agents = useMemo(() => 
    Array.from(agentsMap.values()).filter(a => 
      !a.name.toLowerCase().includes('vera') && 
      !a.role.toLowerCase().includes('verificator')
    ), 
    [agentsMap]
  );
  
  // Find the latest thought for each agent to display in tooltips
  const latestThoughts = useMemo(() => {
    const thoughts = new Map<string, string>();
    // Iterate in order, later ones overwrite earlier ones
    teamMessages.forEach(msg => {
      const mType = msg.messageType as string;
      if (mType === 'thought' || mType === 'deliberation' || mType === 'reasoning') {
        thoughts.set(msg.fromAgentId, msg.message);
      }
    });
    return thoughts;
  }, [teamMessages]);

  // Calculate node positions in a circular layout for "God's Eye View"
  const nodes = useMemo(() => {
    const radius = 120;
    const centerX = 175;
    const centerY = 175;
    
    return agents.map((agent, i) => {
      const angle = (i / agents.length) * 2 * Math.PI - Math.PI / 2;
      return {
        id: agent.agentId,
        name: agent.name,
        status: agent.status,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        color: agent.palette === 1 ? '#ef4444' : 
               agent.palette === 2 ? '#3b82f6' : 
               agent.palette === 3 ? '#10b981' : 
               agent.palette === 4 ? '#f59e0b' : '#6366f1'
      };
    });
  }, [agents]);

  // Find links based on active data packets
  const links = useMemo(() => {
    return activePackets.map(packet => {
      const source = nodes.find(n => n.id === packet.from);
      const target = nodes.find(n => n.id === packet.to);
      if (!source || !target) return null;
      return { id: packet.id, source, target, type: packet.type };
    }).filter(Boolean);
  }, [activePackets, nodes]);

  const hoveredNode = useMemo(() => nodes.find(n => n.id === hoveredAgentId), [nodes, hoveredAgentId]);
  const currentThought = hoveredAgentId ? latestThoughts.get(hoveredAgentId) : null;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1 / 1',
      backgroundColor: 'rgba(15, 23, 42, 0.2)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      overflow: 'hidden'
    }}>
      <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 350 350">
        {/* Background Grid */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(99,102,241,0.05)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Links */}
        {links.map((link: any) => (
          <React.Fragment key={link.id}>
            <motion.line
              x1={link.source.x}
              y1={link.source.y}
              x2={link.target.x}
              y2={link.target.y}
              stroke={link.type === 'delegation' ? '#6366f1' : '#10b981'}
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              exit={{ opacity: 0 }}
            />
            {/* Travelling Packet */}
            <motion.circle
              r="2.5"
              fill={link.type === 'delegation' ? '#818cf8' : '#34d399'}
              initial={{ x: link.source.x, y: link.source.y }}
              animate={{ x: link.target.x, y: link.target.y }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ filter: `blur(1px) drop-shadow(0 0 4px ${link.type === 'delegation' ? '#6366f1' : '#10b981'})` }}
            />
          </React.Fragment>
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <g 
            key={node.id} 
            onMouseEnter={() => setHoveredAgentId(node.id)}
            onMouseLeave={() => setHoveredAgentId(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Glow effect for active nodes */}
            {node.status !== 'idle' && (
              <motion.circle
                cx={node.x}
                cy={node.y}
                r="12"
                fill={node.color}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
            
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="6"
              fill={node.color}
              initial={{ scale: 0 }}
              animate={{ scale: hoveredAgentId === node.id ? 1.5 : 1 }}
            />
            
            <text
              x={node.x}
              y={node.y + 18}
              textAnchor="middle"
              style={{
                fontSize: '8px',
                fontFamily: 'monospace',
                fill: hoveredAgentId === node.id ? '#fff' : '#94a3b8',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                transition: 'fill 0.2s ease'
              }}
            >
              {node.name}
            </text>
          </g>
        ))}

        {agents.length === 0 && (
          <text
            x="175"
            y="175"
            textAnchor="middle"
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              fill: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          >
            NO_SWARM_DETECTED
          </text>
        )}
      </svg>

      {/* Thought Stream Tooltip */}
      <AnimatePresence>
        {hoveredNode && currentThought && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '20px',
              transform: 'translateX(-50%)',
              width: '80%',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${hoveredNode.color}44`,
              borderRadius: '12px',
              padding: '12px',
              zIndex: 50,
              pointerEvents: 'none',
              boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px ${hoveredNode.color}22`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: hoveredNode.color }} />
              <span style={{ fontSize: '10px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {hoveredNode.name} Thoughts
              </span>
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#cbd5e1', 
              lineHeight: 1.5, 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {currentThought}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Telemetry Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
           <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} className="animate-pulse" />
           <span style={{ fontSize: '8px', fontFamily: 'monospace', color: 'rgba(16, 185, 129, 0.7)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Topology Live</span>
        </div>
        <span style={{ fontSize: '8px', fontFamily: 'monospace', color: '#475569' }}>NODES: {agents.length}</span>
      </div>
    </div>
  );
};
