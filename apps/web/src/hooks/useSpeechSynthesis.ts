import { useState, useEffect, useCallback, useRef } from 'react';
import { useOfficeStore } from '../store/office-store';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const { voiceLang } = useOfficeStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string, lang: string = voiceLang) => {
    if (!synthRef.current) return;

    // Stop any current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Attempt to find a natural sounding voice for the language
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang === lang && (v.name.includes('Premium') || v.name.includes('Natural')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [voiceLang]);

  const stop = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
