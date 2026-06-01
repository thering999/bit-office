"use client"

import { useState } from 'react'

interface BottomToolbarProps {
  editMode: boolean
  onToggleEditMode: () => void
  onOpenSettings: () => void
  onOpenHistory?: () => void
  onOpenOfficeSwitcher?: () => void
  onToggleTest?: () => void
  testActive?: boolean
  showEditorControls?: boolean
  onOpenThoughtStream?: () => void
  onToggleHealth?: () => void
  onToggleJarvis?: () => void
  jarvisActive?: boolean
  onOpenKnowledge?: () => void
}

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 10,
  left: 10,
  zIndex: 15,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  background: 'rgba(20, 20, 25, 0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 8,
  padding: '3px 4px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
}

const btnBase: React.CSSProperties = {
  padding: '5px 10px',
  fontSize: '12px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: 'rgba(255, 255, 255, 0.5)',
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: 4,
  cursor: 'pointer',
  letterSpacing: '0.03em',
}

const btnActive: React.CSSProperties = {
  ...btnBase,
  background: 'rgba(130, 160, 255, 0.15)',
  border: '1px solid rgba(130, 160, 255, 0.4)',
  color: 'rgba(160, 185, 255, 0.9)',
}

export default function BottomToolbar({ 
  editMode, 
  onToggleEditMode, 
  onOpenSettings, 
  onOpenHistory, 
  onOpenOfficeSwitcher, 
  onToggleTest, 
  testActive, 
  showEditorControls = true,
  onOpenThoughtStream,
  onToggleHealth,
  onToggleJarvis,
  jarvisActive,
  onOpenKnowledge
}: BottomToolbarProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div style={panelStyle}>
      {onToggleHealth && (
        <button
          onClick={() => { 
            console.log("[BottomToolbar] Health Clicked, onToggleHealth available:", !!onToggleHealth);
            if (onToggleHealth) onToggleHealth(); 
          }}
          onMouseEnter={() => setHovered('health')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background: hovered === 'health' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            color: hovered === 'health' ? '#10b981' : 'rgba(16, 185, 129, 0.6)',
            borderColor: hovered === 'health' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '10px'
          }}
          title="Swarm Health Dashboard"
        >
          Health
        </button>
      )}
      {onOpenThoughtStream && (
        <button
          onClick={() => { 
            console.log("[BottomToolbar] Cognition Clicked, onOpenThoughtStream available:", !!onOpenThoughtStream);
            if (onOpenThoughtStream) onOpenThoughtStream(); 
          }}
          onMouseEnter={() => setHovered('cognition')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background: hovered === 'cognition' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: hovered === 'cognition' ? '#818cf8' : 'rgba(129, 140, 248, 0.6)',
            borderColor: hovered === 'cognition' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '10px'
          }}
          title="Open Deliberation Stream"
        >
          Cognition
        </button>
      )}

      {onToggleJarvis && (
        <button
          onClick={onToggleJarvis}
          onMouseEnter={() => setHovered('jarvis')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background: jarvisActive ? 'rgba(59, 130, 246, 0.2)' : (hovered === 'jarvis' ? 'rgba(59, 130, 246, 0.15)' : 'transparent'),
            color: jarvisActive ? '#3b82f6' : (hovered === 'jarvis' ? '#60a5fa' : 'rgba(59, 130, 246, 0.6)'),
            borderColor: jarvisActive ? 'rgba(59, 130, 246, 0.5)' : (hovered === 'jarvis' ? 'rgba(59, 130, 246, 0.3)' : 'transparent'),
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontSize: '10px',
            boxShadow: jarvisActive ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none'
          }}
          title="Toggle Always-On Voice (Jarvis Mode)"
        >
          Jarvis
        </button>
      )}
      {onOpenKnowledge && (
        <button
          onClick={onOpenKnowledge}
          onMouseEnter={() => setHovered('knowledge')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background: hovered === 'knowledge' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
            color: hovered === 'knowledge' ? '#a78bfa' : 'rgba(139, 92, 246, 0.6)',
            borderColor: hovered === 'knowledge' ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '10px'
          }}
          title="Open Project Knowledge (NotebookLM)"
        >
          Knowledge
        </button>
      )}
      {onOpenOfficeSwitcher && (
        <button
          onClick={onOpenOfficeSwitcher}
          onMouseEnter={() => setHovered('office')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background: hovered === 'office' ? 'rgba(255, 255, 255, 0.08)' : btnBase.background,
            color: hovered === 'office' ? 'rgba(255, 255, 255, 0.8)' : btnBase.color,
          }}
          title="Switch office appearance"
        >
          Office
        </button>
      )}
      {showEditorControls && (
        <>
          <button
            onClick={onToggleEditMode}
            onMouseEnter={() => setHovered('edit')}
            onMouseLeave={() => setHovered(null)}
            style={
              editMode
                ? btnActive
                : {
                    ...btnBase,
                    background: hovered === 'edit' ? 'rgba(255, 255, 255, 0.08)' : btnBase.background,
                    color: hovered === 'edit' ? 'rgba(255, 255, 255, 0.8)' : btnBase.color,
                  }
            }
            title="Edit office layout"
          >
            Layout
          </button>
          <button
            onClick={onOpenSettings}
            onMouseEnter={() => setHovered('settings')}
            onMouseLeave={() => setHovered(null)}
            style={{
              ...btnBase,
              background: hovered === 'settings' ? 'rgba(255, 255, 255, 0.08)' : btnBase.background,
              color: hovered === 'settings' ? 'rgba(255, 255, 255, 0.8)' : btnBase.color,
            }}
            title="Settings"
          >
            Settings
          </button>
        </>
      )}
      {onOpenHistory && (
        <button
          onClick={onOpenHistory}
          onMouseEnter={() => setHovered('history')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...btnBase,
            background: hovered === 'history' ? 'rgba(255, 255, 255, 0.08)' : btnBase.background,
            color: hovered === 'history' ? 'rgba(255, 255, 255, 0.8)' : btnBase.color,
          }}
          title="Project history"
        >
          History
        </button>
      )}
      {onToggleTest && (
        <button
          onClick={onToggleTest}
          onMouseEnter={() => setHovered('test')}
          onMouseLeave={() => setHovered(null)}
          style={
            testActive
              ? { ...btnActive, color: '#e85040', borderColor: 'rgba(232, 80, 64, 0.4)', background: 'rgba(200, 48, 48, 0.12)' }
              : {
                  ...btnBase,
                  background: hovered === 'test' ? 'rgba(255, 255, 255, 0.08)' : btnBase.background,
                  color: hovered === 'test' ? 'rgba(255, 255, 255, 0.8)' : btnBase.color,
                }
          }
          title="Fill all work seats with test characters"
        >
          {testActive ? 'Clear Test' : 'Test'}
        </button>
      )}
    </div>
  )
}
