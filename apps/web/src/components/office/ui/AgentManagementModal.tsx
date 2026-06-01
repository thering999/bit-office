"use client"

import React, { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import SpriteAvatar from '../sprites/SpriteAvatar'
import { AgentDefinition } from '@office/shared'
import { useOfficeStore } from '@/store/office-store'
import { sendCommand } from '@/lib/connection'

interface AgentManagementModalProps {
  isOpen: boolean
  onClose: () => void
  agentDefs: AgentDefinition[]
  onHire: (def: AgentDefinition, backend: string, workDir?: string) => void
  onSaveDef: (def: AgentDefinition) => void
  onDeleteDef: (id: string) => void
  assetsReady?: boolean
}

import { isCloudMode } from '@/lib/cloud-ai'

const TERM_PANEL = "#0a0e0a"
const TERM_TEXT = "#eddcb8"
const TERM_GOLD = "#e8b040"
const TERM_BG = "rgba(10, 14, 10, 0.95)"

const ROLE_PRESETS = [
  "Frontend Dev", "Backend Dev", "Fullstack Dev", 
  "UI/UX Designer", "DevOps Engineer", "QA Engineer",
  "Product Manager", "Team Lead", "Security Auditor",
  "Python Expert", "Rust Developer", "Game Dev"
]

const PERSONALITY_PRESETS = [
  { label: "Friendly & Casual", text: "You speak in a friendly, casual, encouraging, and natural tone." },
  { label: "Professional & Concise", text: "You speak formally, professionally, in an organized and concise manner." },
  { label: "Action-Oriented & Fast", text: "You are aggressive, action-first, always pursuing speed and efficiency." },
  { label: "Mentor & Patient", text: "You teach patiently, explain the reasoning, and guide like a mentor." }
]

const SUGGESTED_SKILLS = [
  "React", "Next.js", "TypeScript", "Node.js", "Python", "Rust", "Go",
  "SQL", "NoSQL", "Docker", "Kubernetes", "AWS", "Tailwind", "CSS",
  "Unit Testing", "APIs", "Microservices", "Security", "Web3"
]

export default function AgentManagementModal({
  isOpen,
  onClose,
  agentDefs,
  onHire,
  onSaveDef,
  onDeleteDef,
  assetsReady
}: AgentManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'hire' | 'create' | 'keys'>('hire')
  const [selectedBackend, setSelectedBackend] = useState("openrouter")
  const [workDir, setWorkDir] = useState("")
  const [swarmGoal, setSwarmGoal] = useState("")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  
  // Create/Edit State
  const [editingAgent, setEditingAgent] = useState<AgentDefinition | null>(null)
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [customRole, setCustomRole] = useState("")
  const [rolePresetIndex, setRolePresetIndex] = useState(0)
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())
  const [customSkillInput, setCustomSkillInput] = useState("")
  const [personalityMode, setPersonalityMode] = useState(0)
  const [customPersonality, setCustomPersonality] = useState("")
  const [palette, setPalette] = useState(0)

  // API Keys State
  const [geminiKeys, setGeminiKeys] = useState("")
  const [claudeKeys, setClaudeKeys] = useState("")
  const [openaiKey, setOpenaiKey] = useState("")
  const [openRouterKey, setOpenRouterKey] = useState("")
  const [deepSeekKey, setDeepSeekKey] = useState("")
  const [serpKey, setSerpKey] = useState("")
  const [pineconeKey, setPineconeKey] = useState("")
  const [zepKey, setZepKey] = useState("")
  const [typhoonKey, setTyphoonKey] = useState("")
  const [qdrantKey, setQdrantKey] = useState("")
  const [postmanKey, setPostmanKey] = useState("")
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434")

  const backendOptions = useOfficeStore((state) => state.backendOptions)
  const availableBackends = backendOptions.length > 0 ? backendOptions : [
    { id: "claude", name: "Claude", color: "#e8b040" },
    { id: "gemini", name: "Gemini", color: "#48cc6a" },
    { id: "openai", name: "OpenAI", color: "#5aacff" },
    { id: "openrouter", name: "OpenRouter", color: "#7c3aed" },
    { id: "deepseek", name: "DeepSeek", color: "#0d6efd" },
    { id: "typhoon", name: "Typhoon", color: "#ef4444" },
    { id: "ollama", name: "Ollama", color: "#a855f7" },
    { id: "mock-ai", name: "Mock (Test)", color: "#7a6858" }
  ]

  // const sendCommand = useOfficeStore((state) => state.sendCommand)
  const config = useOfficeStore((state) => state.config) // Assuming config is in store

  useEffect(() => {
    if (editingAgent) {
      setName(editingAgent.name)
      const rIdx = ROLE_PRESETS.indexOf(editingAgent.role)
      setRolePresetIndex(rIdx)
      if (rIdx === -1) setCustomRole(editingAgent.role)
      setSelectedSkills(new Set(editingAgent.skills.split(", ").filter(Boolean)))
      
      const pIdx = PERSONALITY_PRESETS.findIndex(p => p.text === editingAgent.personality)
      setPersonalityMode(pIdx === -1 ? 4 : pIdx)
      if (pIdx === -1) setCustomPersonality(editingAgent.personality)
      
      setPalette(editingAgent.palette)
    } else {
      setName("")
      setRolePresetIndex(0)
      setCustomRole("")
      setSelectedSkills(new Set())
      setPersonalityMode(0)
      setCustomPersonality("")
      setPalette(0)
    }
  }, [editingAgent])

  // Sync API Keys from config if available
  useEffect(() => {
    // We should send a GET_CONFIG command when modal opens
    if (isOpen) {
      if (isCloudMode()) {
        setGeminiKeys(localStorage.getItem('cloud_key_gemini') || "")
        setClaudeKeys(localStorage.getItem('cloud_key_claude') || "")
        setOpenaiKey(localStorage.getItem('cloud_key_openai') || "")
        setOpenRouterKey(localStorage.getItem('cloud_key_openrouter') || "")
        setDeepSeekKey(localStorage.getItem('cloud_key_deepseek') || "")
        setTyphoonKey(localStorage.getItem('cloud_key_typhoon') || "")
      }
      sendCommand({ type: "GET_CONFIG" })
    }
  }, [isOpen])

  // Listen for config updates (this would usually be in the store)
  useEffect(() => {
    if (config) {
      if (config.geminiApiKeys) setGeminiKeys(config.geminiApiKeys.join(", "))
      if (config.claudeApiKeys) setClaudeKeys(config.claudeApiKeys.join(", "))
      if (config.openaiApiKeys) setOpenaiKey(config.openaiApiKeys.join(", "))
      if (config.openRouterApiKeys) setOpenRouterKey(config.openRouterApiKeys.join(", "))
      if (config.deepSeekApiKeys) setDeepSeekKey(config.deepSeekApiKeys.join(", "))
      else if (config.deepSeekApiKey) setDeepSeekKey(config.deepSeekApiKey)
      if (config.serpApiKey) setSerpKey(config.serpApiKey)
      if (config.pineconeApiKey) setPineconeKey(config.pineconeApiKey)
      if (config.zepApiKey) setZepKey(config.zepApiKey)
      if (config.typhoonApiKeys) setTyphoonKey(config.typhoonApiKeys.join(", "))
      else if (config.typhoonApiKey) setTyphoonKey(config.typhoonApiKey)
      if (config.qdrantApiKey) setQdrantKey(config.qdrantApiKey)
      if (config.postmanApiKey) setPostmanKey(config.postmanApiKey)
      if (config.ollamaUrl) setOllamaUrl(config.ollamaUrl)
    }
  }, [config])

  if (!isOpen) return null

  const builtinAgents = agentDefs.filter(a => a.isBuiltin && a.teamRole !== "leader")
  const customAgents = agentDefs.filter(a => !a.isBuiltin && a.teamRole !== "leader")

  const handleSaveAgent = () => {
    const finalRole = rolePresetIndex === -1 ? customRole : ROLE_PRESETS[rolePresetIndex]
    const finalPersonality = personalityMode === 4 ? customPersonality : PERSONALITY_PRESETS[personalityMode].text
    const finalSkills = Array.from(selectedSkills).join(", ")
    
    const def: AgentDefinition = {
      id: editingAgent?.id || nanoid(8),
      name,
      role: finalRole,
      skills: finalSkills,
      personality: finalPersonality,
      palette,
      isBuiltin: editingAgent?.isBuiltin || false,
      teamRole: editingAgent?.teamRole || "dev"
    }
    
    onSaveDef(def)
    setEditingAgent(null)
    setActiveTab('hire')
  }

  const handleSaveConfig = () => {
    if (isCloudMode()) {
      localStorage.setItem('cloud_key_gemini', geminiKeys.split(",")[0]?.trim() || "")
      localStorage.setItem('cloud_key_claude', claudeKeys.split(",")[0]?.trim() || "")
      localStorage.setItem('cloud_key_openai', openaiKey.split(",")[0]?.trim() || "")
      localStorage.setItem('cloud_key_openrouter', openRouterKey.split(",")[0]?.trim() || "")
      localStorage.setItem('cloud_key_deepseek', deepSeekKey.split(",")[0]?.trim() || "")
      localStorage.setItem('cloud_key_typhoon', typhoonKey.split(",")[0]?.trim() || "")
    }

    sendCommand({
      type: "UPDATE_CONFIG",
      config: {
        geminiApiKeys: geminiKeys.split(",").map(k => k.trim()).filter(Boolean),
        claudeApiKeys: claudeKeys.split(",").map(k => k.trim()).filter(Boolean),
        openaiApiKeys: openaiKey.split(",").map(k => k.trim()).filter(Boolean),
        openRouterApiKeys: openRouterKey.split(",").map(k => k.trim()).filter(Boolean),
        deepSeekApiKeys: deepSeekKey.split(",").map(k => k.trim()).filter(Boolean),
        typhoonApiKeys: typhoonKey.split(",").map(k => k.trim()).filter(Boolean),
        serpApiKey: serpKey.trim() || undefined,
        pineconeApiKey: pineconeKey.trim() || undefined,
        zepApiKey: zepKey.trim() || undefined,
        qdrantApiKey: qdrantKey.trim() || undefined,
        postmanApiKey: postmanKey.trim() || undefined,
        ollamaUrl: ollamaUrl.trim()
      }
    })
    alert("Configuration updated!")
  }

  const toggleSkill = (skill: string) => {
    const next = new Set(selectedSkills)
    if (next.has(skill)) next.delete(skill)
    else next.add(skill)
    setSelectedSkills(next)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        backdropFilter: "blur(4px)"
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: TERM_PANEL, padding: "0",
          width: "95%", maxWidth: 460, border: "2px solid #1a2a1a",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8), 4px 4px 0px rgba(0,0,0,0.5)",
          maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
          borderRadius: 4
        }}
      >
        {/* Header Tabs */}
        <div style={{ display: "flex", backgroundColor: "#050805", borderBottom: "1px solid #1a2a1a" }}>
          {[
            { id: 'hire', label: 'Hire', icon: '👤' },
            { id: 'create', label: editingAgent ? 'Edit Agent' : 'New Agent', icon: '✨' },
            { id: 'keys', label: 'API Keys', icon: '🔑' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1, padding: "12px", border: "none", cursor: "pointer",
                backgroundColor: activeTab === tab.id ? TERM_PANEL : "transparent",
                color: activeTab === tab.id ? TERM_GOLD : "#5a4a38",
                fontSize: 13, fontWeight: 700, fontFamily: "monospace",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <button 
            onClick={onClose}
            style={{ 
              padding: "0 16px", background: "none", border: "none", 
              color: "#5a4a38", cursor: "pointer", fontSize: 18 
            }}
          >&times;</button>
        </div>

        <div style={{ padding: "18px", overflowY: "auto", flex: 1 }}>
          
          {activeTab === 'hire' && (
            <>
              {/* Backend selector */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 6, fontFamily: "monospace", textTransform: "uppercase" }}>AI Intelligence Provider</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                  {availableBackends.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBackend(b.id)}
                      style={{
                        padding: "8px 4px", fontSize: 12, fontWeight: 700,
                        border: selectedBackend === b.id ? `1px solid ${b.color}` : "1px solid #1a2a1a",
                        backgroundColor: selectedBackend === b.id ? b.color + "15" : "#050805",
                        color: selectedBackend === b.id ? b.color : "#6a5848",
                        cursor: "pointer", fontFamily: "monospace",
                        borderRadius: 2
                      }}
                    >{b.name}</button>
                  ))}
                </div>
              </div>

              {/* Built-in agents */}
              <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 8, fontFamily: "monospace", textTransform: "uppercase" }}>Professional Talent Pool</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 20 }}>
                {builtinAgents.map((def) => (
                  <div
                    key={def.id}
                    onMouseEnter={() => setHoveredId(def.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      padding: "14px 6px 10px", position: "relative",
                      border: "1px solid #1a2a1a", backgroundColor: "#080c08",
                      textAlign: "center", transition: "all 0.15s",
                      borderColor: hoveredId === def.id ? TERM_GOLD + "40" : "#1a2a1a"
                    }}
                  >
                    <div
                      onClick={() => onHire(def, selectedBackend, workDir || undefined)}
                      style={{
                        width: "100%", height: "100%", display: "flex", flexDirection: "column",
                        alignItems: "center", cursor: "pointer"
                      }}
                    >
                      <SpriteAvatar palette={def.palette} zoom={2} ready={assetsReady} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: TERM_TEXT, marginTop: 8 }}>{def.name}</div>
                      <div style={{ fontSize: 11, color: "#7a6858", marginTop: 2 }}>{def.role}</div>
                    </div>
                    <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 4, zIndex: 10 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingAgent(def); setActiveTab('create'); }}
                        style={{
                          fontSize: 12, color: TERM_GOLD, cursor: "pointer", padding: "2px 5px",
                          backgroundColor: "#1a1505", border: "1px solid #3d2d10", borderRadius: "3px",
                          fontFamily: "monospace", outline: "none"
                        }}
                        title="Edit definition"
                      >✎</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom agents */}
              {customAgents.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 8, fontFamily: "monospace", textTransform: "uppercase" }}>Your Managed Assets</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 20 }}>
                    {customAgents.map((def) => (
                      <div
                        key={def.id}
                        onMouseEnter={() => setHoveredId(def.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center",
                          padding: "14px 6px 10px", position: "relative",
                          border: "1px solid #1a2a1a", backgroundColor: "#080c08",
                          textAlign: "center", transition: "all 0.15s",
                          borderColor: hoveredId === def.id ? TERM_GOLD + "40" : "#1a2a1a"
                        }}
                      >
                        <div
                          onClick={() => onHire(def, selectedBackend, workDir || undefined)}
                          style={{
                            width: "100%", height: "100%", display: "flex", flexDirection: "column",
                            alignItems: "center", cursor: "pointer"
                          }}
                        >
                          <SpriteAvatar palette={def.palette} zoom={2} ready={assetsReady} />
                          <div style={{ fontSize: 14, fontWeight: 700, color: TERM_TEXT, marginTop: 8 }}>{def.name}</div>
                          <div style={{ fontSize: 11, color: "#7a6858", marginTop: 2 }}>{def.role}</div>
                        </div>
                        <div style={{ position: "absolute", top: 4, right: 4, display: "flex", gap: 4, zIndex: 10 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingAgent(def); setActiveTab('create'); }}
                            style={{
                              fontSize: 12, color: TERM_GOLD, cursor: "pointer", padding: "2px 5px",
                              backgroundColor: "#1a1505", border: "1px solid #3d2d10", borderRadius: "3px",
                              fontFamily: "monospace", outline: "none"
                            }}
                            title="Edit definition"
                          >✎</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteDef(def.id); }}
                            style={{
                              fontSize: 12, color: "#e04848", cursor: "pointer", padding: "2px 5px",
                              backgroundColor: "#1a0505", border: "1px solid #5a1a1a", borderRadius: "3px",
                              fontFamily: "monospace", outline: "none"
                            }}
                            title="Delete definition"
                          >&times;</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Dynamic Swarm Assembly */}
              <div style={{ marginTop: 20, padding: "14px", border: "1px solid #7c3aed40", backgroundColor: "#0f0a1a", borderRadius: 4 }}>
                <div style={{ fontSize: 11, color: "#a855f7", marginBottom: 8, fontFamily: "monospace", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🧠</span> DYNAMIC SWARM ASSEMBLY
                </div>
                <div style={{ fontSize: 10, color: "#7c6a9a", marginBottom: 10, lineHeight: 1.4 }}>
                  Describe your mission. Our Meta-Agent will analyze the requirements and recruit the perfect team of specialized AI agents.
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <input
                    value={swarmGoal}
                    onChange={(e) => setSwarmGoal(e.target.value)}
                    placeholder="e.g. Build a secure crypto portfolio tracker..."
                    style={{
                      flex: 1, padding: "8px 10px", fontSize: 13, fontFamily: "monospace",
                      border: "1px solid #3a2a5a", backgroundColor: "#050308", color: "#c084fc",
                      outline: "none"
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!swarmGoal.trim()) return;
                      sendCommand({ type: "ASSEMBLE_SWARM", prompt: swarmGoal });
                      onClose();
                    }}
                    style={{
                      padding: "0 15px", border: "1px solid #7c3aed", backgroundColor: "#7c3aed",
                      color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: "monospace"
                    }}
                  >ASSEMBLE</button>
                </div>
              </div>

              <div style={{ height: 16 }} />

              <button
                onClick={() => { setEditingAgent(null); setActiveTab('create'); }}
                style={{
                  width: "100%", padding: "12px", border: "1px dashed #3a2a1a",
                  backgroundColor: "transparent", color: "#7a6858", fontSize: 13,
                  cursor: "pointer", fontFamily: "monospace", borderRadius: 2
                }}
              >+ Initialize New Custom Agent</button>
            </>
          )}

          {activeTab === 'create' && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 15, alignItems: "center", backgroundColor: "#050805", padding: "12px", border: "1px solid #1a2a1a" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <SpriteAvatar palette={palette} zoom={3} ready={assetsReady} />
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2, 3, 4, 5].map(p => (
                      <div
                        key={p}
                        onClick={() => setPalette(p)}
                        style={{
                          width: 12, height: 12, borderRadius: "50%",
                          backgroundColor: p === 0 ? "#eddcb8" : p === 1 ? "#5aacff" : p === 2 ? "#e8b040" : p === 3 ? "#48cc6a" : p === 4 ? "#e04848" : "#a855f7",
                          cursor: "pointer", border: palette === p ? "2px solid #fff" : "1px solid transparent",
                          boxSizing: "border-box"
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 4, fontFamily: "monospace" }}>AGENT IDENTITY</div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name..."
                    style={{
                      width: "100%", padding: "8px 10px", fontSize: 15, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <select
                      value={rolePresetIndex}
                      onChange={(e) => setRolePresetIndex(Number(e.target.value))}
                      style={{
                        width: "100%", padding: "6px 10px", fontSize: 13, fontFamily: "monospace",
                        border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: "#7a6858",
                        outline: "none"
                      }}
                    >
                      {ROLE_PRESETS.map((r, i) => <option key={r} value={i}>{r}</option>)}
                      <option value={-1}>Custom Role...</option>
                    </select>
                    {rolePresetIndex === -1 && (
                      <input
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="e.g. Lead Researcher"
                        style={{
                          width: "100%", padding: "6px 10px", fontSize: 13, fontFamily: "monospace",
                          border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                          marginTop: 4, outline: "none"
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 6, fontFamily: "monospace" }}>SKILLSET & SPECIALTIES</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                  {SUGGESTED_SKILLS.slice(0, 10).map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: "3px 8px", fontSize: 11, fontFamily: "monospace",
                        border: selectedSkills.has(skill) ? `1px solid ${TERM_GOLD}80` : "1px solid #1a2a1a",
                        backgroundColor: selectedSkills.has(skill) ? "#2a1e00" : "transparent",
                        color: selectedSkills.has(skill) ? TERM_GOLD : "#5a4a38",
                        cursor: "pointer", borderRadius: 2
                      }}
                    >{skill}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <input
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    placeholder="Add custom skill..."
                    style={{
                      flex: 1, padding: "6px 10px", fontSize: 13, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                  <button
                    onClick={() => { if(customSkillInput) { toggleSkill(customSkillInput); setCustomSkillInput(""); } }}
                    style={{ padding: "0 15px", border: "1px solid #1a2a1a", backgroundColor: "transparent", color: "#5a4a38", cursor: "pointer" }}
                  >+</button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 6, fontFamily: "monospace" }}>PERSONALITY PROFILE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {PERSONALITY_PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setPersonalityMode(i)}
                      style={{
                        padding: "8px 10px", textAlign: "left", fontSize: 12, fontFamily: "monospace",
                        border: personalityMode === i ? `1px solid ${TERM_GOLD}60` : "1px solid #1a2a1a",
                        backgroundColor: personalityMode === i ? "#1a1505" : "transparent",
                        color: personalityMode === i ? TERM_TEXT : "#5a4a38",
                        cursor: "pointer", borderRadius: 2
                      }}
                    >{p.label}</button>
                  ))}
                  <button
                    onClick={() => setPersonalityMode(4)}
                    style={{
                      padding: "8px 10px", textAlign: "left", fontSize: 12, fontFamily: "monospace",
                      border: personalityMode === 4 ? `1px solid ${TERM_GOLD}60` : "1px solid #1a2a1a",
                      backgroundColor: personalityMode === 4 ? "#1a1505" : "transparent",
                      color: personalityMode === 4 ? TERM_TEXT : "#5a4a38",
                      cursor: "pointer", borderRadius: 2
                    }}
                  >Custom Personality...</button>
                  {personalityMode === 4 && (
                    <textarea
                      value={customPersonality}
                      onChange={(e) => setCustomPersonality(e.target.value)}
                      placeholder="Describe behavioral patterns..."
                      rows={3}
                      style={{
                        width: "100%", padding: "8px 10px", fontSize: 13, fontFamily: "monospace",
                        border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                        outline: "none", resize: "none", marginTop: 4
                      }}
                    />
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={handleSaveAgent}
                  disabled={!name.trim()}
                  style={{
                    flex: 1, padding: "12px", border: `1px solid ${TERM_GOLD}60`,
                    backgroundColor: "#382800", color: TERM_GOLD, fontWeight: 700,
                    cursor: "pointer", fontFamily: "monospace", opacity: name.trim() ? 1 : 0.4
                  }}
                >{editingAgent ? "Update Intelligence Profile" : "Initialize Agent"}</button>
                <button
                  onClick={() => setActiveTab('hire')}
                  style={{
                    padding: "12px 20px", border: "1px solid #1a2a1a",
                    backgroundColor: "transparent", color: "#5a4a38", cursor: "pointer"
                  }}
                >Cancel</button>
              </div>
            </div>
          )}

          {activeTab === 'keys' && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: "10px", border: "1px solid #3d2d10", backgroundColor: "#1a1505", color: "#b09878", fontSize: 12, fontFamily: "monospace" }}>
                🔒 API keys are stored locally and encrypted in transit. These keys will override environment variables for the current session.
              </div>
              
              <div>
                <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 6, fontFamily: "monospace" }}>GOOGLE GEMINI KEYS (Comma-separated)</div>
                <textarea
                  value={geminiKeys}
                  onChange={(e) => setGeminiKeys(e.target.value)}
                  placeholder="Paste multiple keys separated by commas..."
                  rows={2}
                  style={{
                    width: "100%", padding: "10px", fontSize: 12, fontFamily: "monospace",
                    border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                    outline: "none", resize: "none"
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 6, fontFamily: "monospace" }}>ANTHROPIC CLAUDE KEYS</div>
                <textarea
                  value={claudeKeys}
                  onChange={(e) => setClaudeKeys(e.target.value)}
                  placeholder="Paste keys here..."
                  rows={2}
                  style={{
                    width: "100%", padding: "10px", fontSize: 12, fontFamily: "monospace",
                    border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                    outline: "none", resize: "none"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 6, fontFamily: "monospace" }}>OPENAI KEYS (Comma-separated)</div>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..., sk-..."
                    style={{
                      width: "100%", padding: "8px", fontSize: 12, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 6, fontFamily: "monospace" }}>OPENROUTER KEYS (Comma-separated)</div>
                  <input
                    type="password"
                    value={openRouterKey}
                    onChange={(e) => setOpenRouterKey(e.target.value)}
                    placeholder="sk-or-..., sk-or-..."
                    style={{
                      width: "100%", padding: "8px", fontSize: 12, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 6, fontFamily: "monospace" }}>DEEPSEEK KEYS (Comma-separated)</div>
                  <input
                    type="password"
                    value={deepSeekKey}
                    onChange={(e) => setDeepSeekKey(e.target.value)}
                    placeholder="sk-..."
                    style={{
                      width: "100%", padding: "8px", fontSize: 12, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 6, fontFamily: "monospace" }}>TYPHOON KEYS (TH - Comma-separated)</div>
                  <input
                    type="password"
                    value={typhoonKey}
                    onChange={(e) => setTyphoonKey(e.target.value)}
                    placeholder="sk-..."
                    style={{
                      width: "100%", padding: "8px", fontSize: 12, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#7a6858", marginBottom: 4, fontFamily: "monospace" }}>SERPAPI</div>
                  <input
                    type="password"
                    value={serpKey}
                    onChange={(e) => setSerpKey(e.target.value)}
                    style={{
                      width: "100%", padding: "6px", fontSize: 11, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#7a6858", marginBottom: 4, fontFamily: "monospace" }}>PINECONE</div>
                  <input
                    type="password"
                    value={pineconeKey}
                    onChange={(e) => setPineconeKey(e.target.value)}
                    style={{
                      width: "100%", padding: "6px", fontSize: 11, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#7a6858", marginBottom: 4, fontFamily: "monospace" }}>ZEP AI</div>
                  <input
                    type="password"
                    value={zepKey}
                    onChange={(e) => setZepKey(e.target.value)}
                    style={{
                      width: "100%", padding: "6px", fontSize: 11, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#7a6858", marginBottom: 4, fontFamily: "monospace" }}>QDRANT KEY</div>
                  <input
                    type="password"
                    value={qdrantKey}
                    onChange={(e) => setQdrantKey(e.target.value)}
                    style={{
                      width: "100%", padding: "6px", fontSize: 11, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#7a6858", marginBottom: 4, fontFamily: "monospace" }}>POSTMAN KEY</div>
                  <input
                    type="password"
                    value={postmanKey}
                    onChange={(e) => setPostmanKey(e.target.value)}
                    style={{
                      width: "100%", padding: "6px", fontSize: 11, fontFamily: "monospace",
                      border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#7a6858", marginBottom: 6, fontFamily: "monospace" }}>OLLAMA SERVICE URL</div>
                <input
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  style={{
                    width: "100%", padding: "10px", fontSize: 14, fontFamily: "monospace",
                    border: "1px solid #1a2a1a", backgroundColor: "#0a0e0a", color: TERM_TEXT,
                    outline: "none"
                  }}
                />
              </div>

              <button
                onClick={handleSaveConfig}
                style={{
                  width: "100%", padding: "12px", border: `1px solid ${TERM_GOLD}60`,
                  backgroundColor: "#382800", color: TERM_GOLD, fontWeight: 700,
                  cursor: "pointer", fontFamily: "monospace", marginTop: 10
                }}
              >Save Secure Configuration</button>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        {activeTab === 'hire' && (
          <div style={{ padding: "12px 18px", borderTop: "1px solid #1a2a1a", backgroundColor: "#050805", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#4a3a28", fontFamily: "monospace" }}>TARGET WORKSPACE</div>
              <input 
                value={workDir}
                onChange={(e) => setWorkDir(e.target.value)}
                placeholder="Current Project Directory"
                style={{
                  width: "100%", background: "none", border: "none", color: "#7a6858",
                  fontSize: 12, fontFamily: "monospace", outline: "none", padding: "2px 0"
                }}
              />
            </div>
            <button 
              onClick={() => {
                const rid = nanoid(6);
                sendCommand({ type: "PICK_FOLDER", requestId: rid });
              }}
              style={{ padding: "6px 10px", background: "#1a1505", border: "1px solid #3d2d10", color: TERM_GOLD, cursor: "pointer", fontSize: 14 }}
            >📁</button>
          </div>
        )}
      </div>
    </div>
  )
}
