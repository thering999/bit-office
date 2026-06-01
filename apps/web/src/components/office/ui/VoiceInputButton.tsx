import React, { useRef, useEffect } from 'react';
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useOfficeStore } from "@/store/office-store";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced VoiceInputButton with Wake-word and TTS.
 */
export function VoiceInputButton({ 
  onText, 
  onCommand,
  textValue,
  disabled,
  variant = "standard"
}: { 
  onText: (text: string) => void, 
  onCommand?: (cmd: string, args?: any) => void,
  textValue: string,
  disabled?: boolean,
  variant?: "standard" | "terminal"
}) {
  const initialTextRef = useRef(textValue);
  const { speak, stop: stopSpeech, isSpeaking } = useSpeechSynthesis();
  const { voiceEnabled, voiceLang, setVoiceEnabled } = useOfficeStore();

  const handleResult = (transcript: string, isFinal: boolean) => {
    // Check for Jarvis-style commands if final
    if (isFinal) {
      const lower = transcript.toLowerCase().trim();
      
      // Intent: Swarm Assembly
      const assembleTriggers = [
        "สร้างทีมสำหรับ", "จัดทีมสำหรับ", "assemble team for", 
        "สร้างทีมให้หน่อย", "หาคนมาช่วยเรื่อง", "จัดทัพสำหรับ"
      ];
      
      const assembleTrigger = assembleTriggers.find(t => lower.includes(t));
      if (assembleTrigger) {
        const task = lower.split(assembleTrigger)[1]?.trim();
        if (task && onCommand) {
          speak(voiceLang === 'th-TH' ? `กำลังจัดทีมสำหรับ ${task}` : `Assembling team for ${task}`);
          onCommand("ASSEMBLE_SWARM", { prompt: task });
          return;
        }
      }

      // Intent: Run Task
      const runTriggers = [
        "เริ่มงาน", "เริ่มทำ", "start task", 
        "สั่งให้", "ลุยเรื่อง", "จัดการเรื่อง"
      ];
      
      const runTrigger = runTriggers.find(t => lower.startsWith(t) || lower.includes(t));
      if (runTrigger) {
        const task = lower.split(runTrigger)[1]?.trim();
        if (task && onCommand) {
          speak(voiceLang === 'th-TH' ? `เริ่มงาน ${task}` : `Starting task ${task}`);
          onCommand("RUN_TASK", { prompt: task });
          return;
        }
      }

      // If it was a wake-word command, but no specific intent found, just send it as a general task
      if (onCommand && lower.length > 5) {
         speak(voiceLang === 'th-TH' ? `ส่งคำสั่ง ${lower}` : `Dispatching command ${lower}`);
         onCommand("RUN_TASK", { prompt: lower });
         return;
      }
    }

    const space = initialTextRef.current && !initialTextRef.current.endsWith(' ') ? ' ' : '';
    onText(initialTextRef.current + space + transcript);
  };

  const { isListening, isSupported, isWakeMode, toggleListening, startListening, stopListening } = useSpeechRecognition({ 
    onResult: handleResult,
    wakeWord: "OpenClaw"
  });

  const spokenIds = useRef<Set<string>>(new Set());

  // Watch for new AI messages to speak them if voice is enabled
  useEffect(() => {
    if (!voiceEnabled) {
      spokenIds.current.clear();
      return;
    }

    const unsubscribe = useOfficeStore.subscribe((state) => {
      // 1. Handle Message Narration
      for (const agent of state.agents.values()) {
        const messages = agent.messages;
        if (messages.length === 0) continue;
        
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'agent' && !spokenIds.current.has(lastMsg.id)) {
          spokenIds.current.add(lastMsg.id);
          
          const textToSpeak = lastMsg.text
            .replace(/```[\s\S]*?```/g, ' [Code Block] ')
            .replace(/\{[\s\S]*?\}/g, ' [Data Object] ')
            .substring(0, 500); 
            
          speak(textToSpeak);
        }
      }
    });

    return () => unsubscribe();
  }, [voiceEnabled, speak]);

  if (!isSupported) return null;
  
  const isTerminal = variant === "terminal";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={(e) => { 
          e.preventDefault(); 
          if (!isListening) {
            initialTextRef.current = textValue;
          }
          toggleListening(); 
        }}
        disabled={disabled}
        style={{
          position: "relative",
          width: isTerminal ? 32 : 36,
          height: isTerminal ? 32 : 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          cursor: disabled ? "not-allowed" : "pointer",
          border: isListening 
            ? (isWakeMode ? "2px solid #3b82f6" : "1px solid #ef4444") 
            : isTerminal ? "1px solid var(--term-green-dim)" : "1px solid var(--office-border)",
          backgroundColor: isListening 
            ? (isWakeMode ? "rgba(59, 130, 246, 0.15)" : "rgba(239, 68, 68, 0.15)") 
            : isTerminal ? "transparent" : "var(--office-panel)",
          boxShadow: isListening 
            ? (isWakeMode ? "0 0 15px rgba(59, 130, 246, 0.4)" : "0 0 12px rgba(239, 68, 68, 0.3)") 
            : "none",
          padding: 0,
          outline: "none",
        }}
        title={isListening ? (isWakeMode ? "Listening for command..." : "Listening...") : "Start Jarvis mode (Voice control)"}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="active"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{ fontSize: isTerminal ? 12 : 14, color: isWakeMode ? "#3b82f6" : "#ef4444" }}
            >
              {isWakeMode ? "🔵" : "⏹"}
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{ fontSize: isTerminal ? 12 : 14, color: isTerminal ? "var(--term-green)" : "var(--office-text)", opacity: isTerminal ? 0.7 : 1 }}
            >
              🎤
            </motion.div>
          )}
        </AnimatePresence>

        {isListening && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: isWakeMode ? "rgba(59, 130, 246, 0.3)" : "rgba(239, 68, 68, 0.3)"
            }}
          />
        )}
      </button>

      {/* Voice Mode Toggle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            fontSize: 9,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            transition: "all 0.2s",
            cursor: "pointer",
            border: voiceEnabled 
              ? "1px solid rgba(59, 130, 246, 0.4)" 
              : "1px solid var(--term-border-dim)",
            backgroundColor: voiceEnabled 
              ? "rgba(59, 130, 246, 0.1)" 
              : "transparent",
            color: voiceEnabled ? "#60a5fa" : "var(--px-text-dim)",
            fontFamily: "monospace",
          }}
        >
          Jarvis: {voiceEnabled ? 'ACTIVE' : 'OFF'}
        </button>
        {isListening && isWakeMode && (
          <span style={{ fontSize: 7, color: "#3b82f6", fontWeight: 700, textAlign: "center", textShadow: "0 0 4px rgba(59, 130, 246, 0.5)" }}>
            WAITING FOR COMMAND
          </span>
        )}
      </div>

      {isSpeaking && (
        <motion.div 
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <div style={{ display: "flex", gap: 2, alignItems: "end", height: 12 }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 12, 4] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                style={{ width: 2, backgroundColor: "#60a5fa", borderRadius: 4 }}
              />
            ))}
          </div>
          <span style={{ fontSize: 9, color: "#60a5fa", fontWeight: 500, fontFamily: "monospace" }}>SPEAKING</span>
        </motion.div>
      )}
    </div>
  );
}
