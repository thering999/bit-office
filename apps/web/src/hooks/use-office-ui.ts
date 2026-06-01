import { useState, useEffect, useCallback, useRef } from 'react';
import { useOfficeStore } from '../store/office-store';
import { TERM_THEMES, applyTermTheme } from '../lib/theme';
import { OfficeState } from '../components/office/engine/officeState';
import { EditorState } from '../components/office/editor/editorState';
import type { SceneAdapter } from '../components/office/scene/SceneAdapter';
import type { AgentDefinition } from '@office/shared';

export type Ratings = Record<string, number>;

export function useOfficeUI() {
  const [mounted, setMounted] = useState(false);
  
  // UI Visibility States (Synced from global store)
  const showThoughtStream = useOfficeStore(s => s.showThoughtStream);
  const setShowThoughtStream = useOfficeStore(s => s.setShowThoughtStream);
  const showHealthDashboard = useOfficeStore(s => s.showHealthDashboard);
  const setShowHealthDashboard = useOfficeStore(s => s.setShowHealthDashboard);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOfficeSwitcher, setShowOfficeSwitcher] = useState(false);
  const [showEditorControls, setShowEditorControls] = useState(false);
  const [showDemoButton, setShowDemoButton] = useState(false);
  const [showTestButton, setShowTestButton] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showHireTeamModal, setShowHireTeamModal] = useState(false);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileTeamOpen, setMobileTeamOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showKnowledge, setShowKnowledge] = useState(false);
  
  // Task/Result States
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewRatings, setPreviewRatings] = useState<Ratings>({});
  const [previewRated, setPreviewRated] = useState(false);
  const [celebration, setCelebration] = useState<{ previewUrl?: string; previewPath?: string; previewCmd?: string; previewPort?: number; projectDir?: string; entryFile?: string } | null>(null);
  
  // Interaction States
  const [testActive, setTestActive] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [consoleMode, setConsoleMode] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(true);
  const [expandedSection, setExpandedSection] = useState<"team" | "agents" | "external">("agents");
  const [prompt, setPrompt] = useState("");
  const [assetsReady, setAssetsReady] = useState(false);
  const [mapAspect, setMapAspect] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [, forceUpdate] = useState(0);
  const [sceneAdapter, setSceneAdapter] = useState<SceneAdapter | null>(null);
  const [currentOfficeId, setCurrentOfficeId] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<{ name: string; dataUrl: string; base64: string }[]>([]);
  
  // Selected Entity States
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentDefinition | null>(null);
  
  // Refs
  const editorRef = useRef(new EditorState());
  const officeStateRef = useRef<OfficeState | null>(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const pasteMapRef = useRef(new Map<string, string>());
  const pasteCountRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Theme State
  const [termTheme, setTermTheme] = useState("green-hacker");

  // Office Store Sync
  const voiceEnabled = useOfficeStore(s => s.voiceEnabled);
  const setVoiceEnabled = useOfficeStore(s => s.setVoiceEnabled);

  useEffect(() => {
    setMounted(true);
    useOfficeStore.getState().hydrate();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 800);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowDemoButton(params.has('demo'));
    setShowTestButton(params.has('test'));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("bit-office-theme");
    if (saved && saved !== "green-hacker" && TERM_THEMES[saved]) {
      setTermTheme(saved);
    }
    
    try {
      const storedSound = localStorage.getItem('office-sound-enabled');
      if (storedSound !== null) setSoundEnabled(JSON.parse(storedSound));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    applyTermTheme(termTheme);
    localStorage.setItem("bit-office-theme", termTheme);
  }, [termTheme]);

  const toggleThoughtStream = useOfficeStore(s => s.toggleThoughtStream);
  const toggleHealthDashboard = useOfficeStore(s => s.toggleHealthDashboard);
  const toggleSettings = useCallback(() => setShowSettings(prev => !prev), []);
  const toggleHistory = useCallback(() => setShowHistory(prev => !prev), []);
  const toggleOfficeSwitcher = useCallback(() => setShowOfficeSwitcher(prev => !prev), []);
  const toggleEditMode = useCallback(() => setEditMode(prev => !prev), []);
  const toggleVoice = useCallback(() => setVoiceEnabled(!voiceEnabled), [voiceEnabled, setVoiceEnabled]);
  const toggleConsoleMode = useCallback(() => setConsoleMode(prev => !prev), []);
  const toggleKnowledge = useCallback(() => setShowKnowledge(prev => !prev), []);
  const triggerUpdate = useCallback(() => forceUpdate(n => n + 1), []);

  return {
    mounted,
    showThoughtStream, setShowThoughtStream, toggleThoughtStream,
    showHealthDashboard, setShowHealthDashboard, toggleHealthDashboard,
    showSettings, setShowSettings, toggleSettings,
    showHistory, setShowHistory, toggleHistory,
    showOfficeSwitcher, setShowOfficeSwitcher, toggleOfficeSwitcher,
    showEditorControls, setShowEditorControls,
    showDemoButton, showTestButton,
    showShareMenu, setShowShareMenu,
    showHireModal, setShowHireModal,
    showHireTeamModal, setShowHireTeamModal,
    showCreateAgent, setShowCreateAgent,
    chatOpen, setChatOpen,
    mobileTeamOpen, setMobileTeamOpen,
    showConfetti, setShowConfetti,
    previewUrl, setPreviewUrl,
    previewRatings, setPreviewRatings,
    previewRated, setPreviewRated,
    celebration, setCelebration,
    showKnowledge, setShowKnowledge, toggleKnowledge,
    testActive, setTestActive,
    demoRunning, setDemoRunning,
    isMobile,
    voiceEnabled, setVoiceEnabled, toggleVoice,
    editMode, setEditMode, toggleEditMode,
    consoleMode, setConsoleMode, toggleConsoleMode,
    sceneVisible, setSceneVisible,
    expandedSection, setExpandedSection,
    prompt, setPrompt,
    selectedAgent, setSelectedAgent,
    editingAgent, setEditingAgent,
    assetsReady, setAssetsReady,
    mapAspect, setMapAspect,
    soundEnabled, setSoundEnabled,
    termTheme, setTermTheme,
    forceUpdate: triggerUpdate,
    sceneAdapter, setSceneAdapter,
    currentOfficeId, setCurrentOfficeId,
    pendingImages, setPendingImages,
    // Refs
    editorRef,
    officeStateRef,
    zoomRef,
    panRef,
    pasteMapRef,
    pasteCountRef,
    chatEndRef
  };
}
