import { useState, useEffect, useCallback, useRef } from 'react';
import { useOfficeStore } from '../store/office-store';

export function useSpeechRecognition({
  onResult,
  wakeWord = "OpenClaw",
}: {
  onResult?: (text: string, isFinal: boolean) => void;
  wakeWord?: string;
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWakeMode, setIsWakeMode] = useState(false);

  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef<string>('');
  const isWakeModeRef = useRef(false);

  const { voiceLang } = useOfficeStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        if (!recognitionRef.current) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
        }
        
        // Update language if changed
        if (recognitionRef.current.lang !== voiceLang) {
          recognitionRef.current.lang = voiceLang;
        }

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let newFinalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              newFinalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = (newFinalTranscript || interimTranscript).toLowerCase();
          
          // Wake word detection: "Hey Bit-Office", "OpenClaw", "บิทออฟฟิศ", "หวัดดีบิทออฟฟิศ", "Jarvis"
          const wakeWords = [wakeWord.toLowerCase(), "bit-office", "bit office", "บิทออฟฟิศ", "บิท ออฟฟิศ", "หวัดดี", "jarvis", "จาร์วิส", "hey jarvis"];
          
          if (!isWakeModeRef.current) {
            const foundWake = wakeWords.some(w => currentText.includes(w));
            if (foundWake) {
              console.log("[Voice] Wake word detected!");
              isWakeModeRef.current = true;
              setIsWakeMode(true);
              // Audio feedback would be nice here
              const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
              audio.volume = 0.2;
              audio.play().catch(() => {});
              
              // Clear previous transcript and start fresh for the command
              fullTranscriptRef.current = '';
              return;
            }
          }

          if (isWakeModeRef.current) {
            if (newFinalTranscript) {
              fullTranscriptRef.current += newFinalTranscript;
            }

            if (onResult) {
              onResult(fullTranscriptRef.current + interimTranscript, false);
            }
            
            // Auto-stop after a long enough silence or final result
            if (newFinalTranscript && newFinalTranscript.trim().length > 3) {
               // We'll let the component handle the "Execute" part
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error === 'no-speech') return; // Ignore silence in continuous mode
          console.error("Speech recognition error", event.error);
          setError(event.error);
          setIsListening(false);
          setIsWakeMode(false);
          isWakeModeRef.current = false;
        };

        recognitionRef.current.onend = () => {
          // In Jarvis mode, we might want to restart automatically
          if (isListening) {
             try { recognitionRef.current.start(); } catch {}
          } else {
            setIsListening(false);
            if (onResult && isWakeModeRef.current) {
               onResult(fullTranscriptRef.current, true);
            }
            setIsWakeMode(false);
            isWakeModeRef.current = false;
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult, wakeWord, voiceLang]);

  const startListening = useCallback(() => {
    setError(null);
    fullTranscriptRef.current = '';
    isWakeModeRef.current = false;
    setIsWakeMode(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        if (err.name !== 'InvalidStateError') {
            setError(err.message);
        }
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsWakeMode(false);
      isWakeModeRef.current = false;
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    isWakeMode,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
