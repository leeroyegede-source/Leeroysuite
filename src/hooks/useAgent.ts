"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type AgentStatus = "idle" | "listening" | "processing" | "speaking" | "error";

export interface Message {
  role: "user" | "agent";
  content: string;
}

export interface UseAgentOptions {
  onFinalResult?: (text: string) => void;
  isTranscriptionEnabled?: boolean;
}

export function useAgent(options: UseAgentOptions = {}) {
  const { onFinalResult, isTranscriptionEnabled = false } = options;
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  
  const statusRef = useRef<AgentStatus>("idle");
  const { selectedModel } = useAuth();
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  // Store the active utterance so we can cancel it if needed
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Ref to track if we should automatically restart recognition
  const shouldListenRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const isActiveRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const modelRef = useRef(selectedModel);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTranscriptionEnabledRef = useRef(isTranscriptionEnabled);
  const accumulatedTranscriptRef = useRef("");

  // Sync refs with state for use in closures
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { modelRef.current = selectedModel; }, [selectedModel]);
  useEffect(() => { isTranscriptionEnabledRef.current = isTranscriptionEnabled; }, [isTranscriptionEnabled]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;

      // Pre-load voices
      const updateVoices = () => {
          if (synthRef.current) {
              voicesRef.current = synthRef.current.getVoices();
          }
      };
      
      if (synthRef.current) {
          updateVoices();
          if (synthRef.current.onvoiceschanged !== undefined) {
              synthRef.current.onvoiceschanged = updateVoices;
          }
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening until explicitly stopped
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          if (shouldListenRef.current) {
            setAgentStatus("listening");
          }
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentFullTranscript = (finalTranscript || interimTranscript).trim();
          if (currentFullTranscript) {
             accumulatedTranscriptRef.current = currentFullTranscript;
             setTranscript(currentFullTranscript);
             
             // Reset silence timer whenever user is still talking
             if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
             
             // If we have a final result, trigger immediately
             if (finalTranscript.trim()) {
                handleUserSpeech(finalTranscript.trim());
             } else {
                // Otherwise, wait for a natural pause (silence detection)
                silenceTimerRef.current = setTimeout(() => {
                   if (accumulatedTranscriptRef.current && statusRef.current === "listening") {
                      handleUserSpeech(accumulatedTranscriptRef.current);
                   }
                }, 1800); // 1.8 seconds of silence triggers processing
             }
          }
        };

        recognition.onerror = (event: any) => {
          // 'no-speech' and 'aborted' are common and don't usually require user notification
          if (event.error === 'no-speech' || event.error === 'aborted') {
            return;
          }
          
          console.error("Speech recognition error", event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              setAgentStatus("error");
          }
        };

        recognition.onend = () => {
          // Restart automatically unless we explicitly stopped it
          if (shouldListenRef.current) {
             try {
                recognition.start();
             } catch(e) { /* ignore restart errors */ }
          }
        };

        recognitionRef.current = recognition;
      } else {
        console.error("SpeechRecognition is not supported in this browser.");
        setAgentStatus("error");
      }
    }

    return () => {
      stopAgentSession();
    };
  }, []);

  // Monitor both transcription and agent activity to start/stop the engine
  useEffect(() => {
    if (isTranscriptionEnabled || isActive) {
      if (statusRef.current === "idle") {
        startAgentSession();
      }
    } else {
      if (statusRef.current !== "idle") {
        stopAgentSession();
      }
    }
  }, [isTranscriptionEnabled, isActive]);

  const handleUserSpeech = async (text: string) => {
    // Prevent double-processing if both isFinal and silence timer fire
    if (statusRef.current === "processing" || statusRef.current === "speaking") return;

    // Clear any pending silence timers
    if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
    }
    accumulatedTranscriptRef.current = "";

    // If user interrupts while agent is speaking, stop the synthesis
    if (status === "speaking" && synthRef.current) {
      synthRef.current.cancel();
    }

    // Temporarily pause listening while processing and speaking
    shouldListenRef.current = false;
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    
    const currentMessages = messagesRef.current;
    const newMessages: Message[] = [...currentMessages, { role: "user", content: text }];
    setMessages(newMessages);
    setTranscript("");
    setAgentStatus("processing");
    
    // Notify about final transcript if callback provided
    if (onFinalResult) onFinalResult(text);

    // If agent is not active, just resume listening for more transcripts 
    // without triggering an AI response context
    if (!isActiveRef.current) {
        resumeListening();
        return;
    }

    try {
      // Format history into a single prompt string since /api/ai/stream auto-formats simple prompts
      const historyPrompt = newMessages.map(m => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`).join("\n");

      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // /api/ai/stream resolves the provider automatically based on the model ID
        body: JSON.stringify({
           tool: "agent",
           model: modelRef.current || "gemini-2.5-flash",
           prompt: historyPrompt,
           systemPrompt: "You are a helpful AI assistant integrated into a WebRTC video meeting. Keep your answers concise, conversational, and direct, as they will be spoken aloud using Text-to-Speech immediately. Do not output markdown. Do not include prefixes like 'Agent:'."
        }),
      });

      if (!response.ok) throw new Error("Agent API error");
      
      // Parse SSE stream
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let responseText = "";
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
           const trimmed = line.trim();
           if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
              try {
                  const data = JSON.parse(trimmed.slice(6));
                  if (data.text) responseText += data.text;
              } catch (e) {
                  // ignore parse error if line is incomplete or malformed
              }
           }
        }
      }
      
      setMessages((prev) => [...prev, { role: "agent", content: responseText }]);
      
      if (responseText.trim()) {
        speakResponse(responseText);
      } else {
        resumeListening();
      }
    } catch (err) {
      console.error(err);
      setAgentStatus("error");
      resumeListening();
    }
  };

  const setAgentStatus = (newStatus: AgentStatus) => {
    setStatus(newStatus);
    statusRef.current = newStatus;
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;
    
    // Always cancel existing speech and heartbeats
    synthRef.current.cancel();
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    
    if (!text || !text.trim()) {
        resumeListening();
        return;
    }

    setAgentStatus("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Enhanced Voice Priority
    const voices = voicesRef.current.length > 0 ? voicesRef.current : synthRef.current.getVoices();
    const preferredVoice = 
        voices.find((v) => v.name.includes("Natural") && v.lang.startsWith("en")) ||
        voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
        voices.find((v) => (v.name.includes("Alex") || v.name.includes("Samantha")) && v.lang.startsWith("en")) ||
        voices.find((v) => v.name.includes("Microsoft") && v.lang.startsWith("en")) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        voices[0];
        
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Fallback: If browser fails to emit onend, force back to listening
    const estimatedDuration = (text.length / 15) * 1000 + 3000;
    fallbackTimeoutRef.current = setTimeout(() => {
        if (statusRef.current === "speaking") {
            finishSpeaking();
        }
    }, Math.max(7000, estimatedDuration));

    // Chrome Heartbeat Fix: Chrome stops long speech after 15s without this
    heartbeatIntervalRef.current = setInterval(() => {
        if (synthRef.current?.speaking) {
            synthRef.current.pause();
            synthRef.current.resume();
        } else {
            if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
        }
    }, 10000);

    function finishSpeaking() {
        if (fallbackTimeoutRef.current) {
            clearTimeout(fallbackTimeoutRef.current);
            fallbackTimeoutRef.current = null;
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
        resumeListening();
    }
    
    utterance.onend = finishSpeaking;
    utterance.onerror = finishSpeaking;

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const resumeListening = useCallback(() => {
    if (!isActiveRef.current && !isTranscriptionEnabledRef.current) {
        setAgentStatus("idle");
        return;
    }
    shouldListenRef.current = true;
    try {
        recognitionRef.current?.start();
    } catch (e) {
        // already started exception ignored
    }
    setAgentStatus("listening");
  }, []);

  const toggleAgent = useCallback(() => {
    if (isActive) {
      setIsActive(false);
      stopAgentSession();
    } else {
      setIsActive(true);
      startAgentSession();
    }
  }, [isActive]);

  const startAgentSession = () => {
    // We only clear messages if Agent mode is being toggled ON, 
    // not just starting transcription
    if (isActiveRef.current) {
        setMessages([]);
    }
    setTranscript("");
    shouldListenRef.current = true;
    
    // Web Speech API requires a gesture (like a click) to load voices sometimes, 
    // doing a silent utterance primes it
    if (synthRef.current) {
       const prime = new SpeechSynthesisUtterance("");
       prime.volume = 0;
       synthRef.current.speak(prime);
    }

    try {
      recognitionRef.current?.start();
      setAgentStatus("listening");
    } catch (e) {
      console.error(e);
      setAgentStatus("error");
    }
  };

  const stopAgentSession = () => {
    shouldListenRef.current = false;
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setAgentStatus("idle");
  };

  return {
    isActive,
    status,
    messages,
    transcript,
    toggleAgent,
  };
}
