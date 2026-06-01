"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, AlertCircle, X, Shield, Cpu, Database, Network, CheckCircle, RefreshCcw, Stethoscope } from 'lucide-react';
import { useOfficeStore } from '../../../store/office-store';
import { sendCommand } from '../../../lib/connection';

/**
 * SwarmHealthDashboard provides a high-level overview of the AI team's operational health.
 * God-Tier Edition: Real-time diagnostics, performance scoring, and strategic recommendations.
 */
export const SwarmHealthDashboard: React.FC<{ isOpen: boolean; onClose: () => void; style?: React.CSSProperties }> = ({ isOpen, onClose, style }) => {
  const agentsMap = useOfficeStore(state => state.agents);
  const swarmHealth = useOfficeStore(state => state.swarmHealth) || {
    score: 0,
    status: 'scanning',
    diagnostics: [],
    recommendations: []
  };
  
  const agents = Array.from(agentsMap.values());
  const activeAgents = agents.filter(a => a.status === 'idle' || a.status === 'working');
  const errorAgents = agents.filter(a => a.status === 'error');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6366f1';
    }
  };

  return (
    <>
      {/* Backdrop */}
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
          background: 'rgba(2, 6, 23, 0.5)',
          backdropFilter: 'blur(10px)',
          zIndex: 90000,
        }}
      />

      {/* Modal Panel - Centered or Large Modal style */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'fixed',
          top: '10%',
          left: '15%',
          right: '15%',
          bottom: '10%',
          background: 'rgba(10, 10, 18, 0.92)',
          backdropFilter: 'blur(40px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 100px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(255,255,255,0.02)',
          zIndex: 100001,
          display: 'flex',
          flexDirection: 'column',
          color: '#f8fafc',
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '32px 40px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '14px', 
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
            }}>
              <Activity size={26} className="text-emerald-400" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, letterSpacing: '0.02em', color: '#fff' }}>SWARM HEALTH</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Diagnostics Engine v4.0</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#475569' }} />
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 800 }}>LIVE_SYSTEM</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Health Score</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: getStatusColor(swarmHealth.status) }}>{swarmHealth.score}%</div>
            </div>
            <button 
              onClick={onClose}
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '12px', 
                width: '44px', 
                height: '44px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                transition: 'all 0.2s'
              }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          
          {/* Left Column: Diagnostics & Recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Health Status Card */}
            <div style={{ 
              padding: '24px', 
              background: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: '20px', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
              position: 'relative'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={16} className="text-blue-400" />
                Core Diagnostics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {swarmHealth.diagnostics.length > 0 ? (
                  swarmHealth.diagnostics.map((diag, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <CheckCircle size={14} className="text-emerald-400 mt-1" />
                      <span style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>{diag}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>
                    <div style={{ fontSize: '12px' }}>No anomalies detected.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div style={{ 
              padding: '24px', 
              background: 'rgba(99, 102, 241, 0.03)', 
              borderRadius: '20px', 
              border: '1px solid rgba(99, 102, 241, 0.1)',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={16} className="text-amber-400" />
                Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {swarmHealth.recommendations.length > 0 ? (
                  swarmHealth.recommendations.map((rec, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                      <Zap size={14} className="text-amber-500 mt-1" />
                      <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>{rec}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>
                    <div style={{ fontSize: '12px' }}>Swarm is operating at peak efficiency.</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Resource Map & Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Resource Allocation */}
            <div style={{ 
              padding: '24px', 
              background: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: '20px', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={16} className="text-purple-400" />
                Swarm Capacity
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, marginBottom: '8px' }}>AGENTS_ACTIVE</div>
                  <div style={{ fontSize: '24px', fontWeight: 900 }}>{activeAgents.length} / {agents.length}</div>
                </div>
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 800, marginBottom: '8px' }}>MEMORY_SYNC</div>
                  <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981' }}>OPTIMAL</div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>NEURAL_LOAD</span>
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: 800 }}>42%</span>
                </div>
                <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '42%' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                  />
                </div>
              </div>
            </div>

            {/* Network Latency & Sync */}
            <div style={{ 
              padding: '24px', 
              background: 'rgba(255, 255, 255, 0.02)', 
              borderRadius: '20px', 
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Network size={16} className="text-emerald-400" />
                Connectivity Sync
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Vector DB Latency</span>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 800 }}>12ms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>Provider API Ping</span>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 800 }}>142ms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>WebRTC Channel</span>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 800 }}>STABLE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ 
          padding: '24px 40px', 
          background: 'rgba(0, 0, 0, 0.3)', 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px'
        }}>
          <button 
            onClick={() => {
              sendCommand({ type: "RUN_DOCTOR" });
              onClose();
            }}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '12px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Stethoscope size={16} />
            Run Swarm Doctor
          </button>
          <button 
            onClick={() => {
              if (confirm("EMERGENCY RESCUE: This will reset all agents and failover to a stable backend. Are you sure?")) {
                sendCommand({ type: "RESCUE_SWARM" });
                onClose();
              }
            }}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '12px', 
              background: 'rgba(245, 158, 11, 0.1)', 
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Zap size={16} />
            Rescue Swarm
          </button>
          <button 
            onClick={onClose}
            style={{ 
              padding: '12px 32px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
              border: 'none',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
            }}
          >
            Acknowledge
          </button>
        </div>
      </motion.div>
    </>
  );
};
