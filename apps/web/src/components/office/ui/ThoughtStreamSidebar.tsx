"use client";
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Terminal, Activity, X, Zap, Cpu, MessageSquare, Shield, Info } from 'lucide-react';
import { useOfficeStore } from '../../../store/office-store';
import { SwarmNodeGraph } from './SwarmNodeGraph';

/**
 * ThoughtStreamSidebar provides real-time visibility into the Meta-Agent's deliberation process.
 * God-Tier Edition: Enhanced with premium animations, icons, and live telemetry.
 */
export const ThoughtStreamSidebar: React.FC<{ isOpen: boolean; onClose: () => void; style?: React.CSSProperties }> = ({ isOpen, onClose, style }) => {
  const teamMessages = useOfficeStore(state => state.teamMessages);
  // Include thoughts, status updates, and briefings for a rich cognition stream
  const cognitiveEvents = teamMessages.filter(m => 
    m.messageType === 'thought' || 
    m.messageType === 'status' || 
    m.messageType === 'briefing' ||
    m.messageType === 'delegation'
  );
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [cognitiveEvents.length]);

  const getEventIcon = (type: string | undefined) => {
    switch (type) {
      case 'thought': return <Brain size={14} className="text-indigo-400" />;
      case 'status': return <Activity size={14} className="text-emerald-400" />;
      case 'briefing': return <Info size={14} className="text-blue-400" />;
      case 'delegation': return <Zap size={14} className="text-amber-400" />;
      default: return <Terminal size={14} className="text-slate-400" />;
    }
  };

  const getEventColor = (type: string | undefined) => {
    switch (type) {
      case 'thought': return 'rgba(99, 102, 241, 0.15)';
      case 'status': return 'rgba(16, 185, 129, 0.1)';
      case 'briefing': return 'rgba(59, 130, 246, 0.1)';
      case 'delegation': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  };

  const getEventBorder = (type: string | undefined) => {
    switch (type) {
      case 'thought': return 'rgba(99, 102, 241, 0.3)';
      case 'status': return 'rgba(16, 185, 129, 0.3)';
      case 'briefing': return 'rgba(59, 130, 246, 0.3)';
      case 'delegation': return 'rgba(245, 158, 11, 0.3)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  return (
    <>
      {/* Backdrop with extreme blur for premium feel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(2, 6, 23, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 90000,
        }}
      />

      {/* Sidebar Panel - Animate from Right */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '420px',
          height: '100vh',
          background: 'rgba(10, 10, 18, 0.9)',
          backdropFilter: 'blur(40px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-20px 0 50px rgba(0, 0, 0, 0.6)',
          zIndex: 100001, // Ensure it's above everything
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc',
          fontFamily: 'var(--font-mono, "Fira Code", monospace)',
          ...style,
        }}
      >
        {/* Animated Glow Effect Header */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header Scanning Line Effect */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '100px',
              background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)'
            }}>
              <Brain size={22} className="text-indigo-400" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>COGNITION</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Stream Active</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="hover:bg-white/10 transition-colors"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '10px', 
              width: '36px', 
              height: '36px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Topology Preview */}
        <div style={{ height: '240px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ 
            position: 'absolute', 
            top: '12px', 
            left: '16px', 
            zIndex: 10, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '4px 8px',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(4px)'
          }}>
            <Activity size={10} className="text-indigo-400" />
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Swarm Topology</span>
          </div>
          <SwarmNodeGraph />
          {/* Shadow vignette for graph */}
          <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
        </div>

        {/* Main Event Stream */}
        <div 
          ref={scrollRef}
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), transparent)',
            scrollbarWidth: 'none'
          }}
        >
          {cognitiveEvents.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, textAlign: 'center', padding: '0 40px' }}>
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                  filter: ['drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))', 'drop-shadow(0 0 25px rgba(99, 102, 241, 0.6))', 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))']
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ marginBottom: '32px' }}
              >
                <Cpu size={64} className="text-indigo-500" />
              </motion.div>
              <h3 style={{ fontSize: '14px', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '12px', fontWeight: 900 }}>Synaptic Idle</h3>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.7, maxWidth: '240px' }}>
                Waiting for the Swarm Orchestrator to initialize deliberation cycles.
              </p>
            </div>
          ) : (
            cognitiveEvents.map((event, idx) => (
              <motion.div 
                key={event.id || idx}
                initial={{ opacity: 0, x: 20, filter: 'blur(5px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                style={{ 
                  padding: '16px', 
                  background: getEventColor(event.messageType),
                  borderRadius: '16px',
                  border: `1px solid ${getEventBorder(event.messageType)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual Accent for different message types */}
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '4px', 
                  height: '100%', 
                  background: getEventBorder(event.messageType).replace('0.3', '1') 
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ 
                    padding: '6px', 
                    background: 'rgba(0,0,0,0.3)', 
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getEventIcon(event.messageType)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {event.fromAgentName || 'System'}
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                      {event.messageType || 'event'}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 500, color: '#475569', marginLeft: 'auto', fontFamily: 'monospace' }}>
                    {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                
                <div style={{ 
                  fontSize: '13px', 
                  lineHeight: 1.6, 
                  color: '#cbd5e1',
                  wordBreak: 'break-word'
                }}>
                  {event.message}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer Real-time Telemetry */}
        <div style={{ 
          padding: '20px 24px', 
          background: 'rgba(2, 6, 23, 0.6)', 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={12} className="text-amber-400" />
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>LOW_LATENCY</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={12} className="text-blue-400" />
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8' }}>ENCRYPTED</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={12} className="text-slate-500" />
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569' }}>{cognitiveEvents.length} EVENTS</span>
            </div>
          </div>
          <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div 
              animate={{ width: ['20%', '85%', '40%', '95%', '60%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};
