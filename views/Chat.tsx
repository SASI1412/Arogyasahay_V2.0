import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Sparkles, User, Info, AlertTriangle, MicOff, Volume2, X } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { geminiService } from '../services/geminiService';
import { UserData, ChatMessage } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

interface ChatProps {
  user: UserData;
}

// Audio helper functions for Live API (Raw PCM)
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hello ${user.username || 'User'}! I'm AarogyaSahay AI. How can I assist you today? You can type or use the voice assistant.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Live API refs
  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, isLoading, voiceTranscript]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const promptWithLang = `[Language: ${user.settings.language}] ${userMessage}`;
    const response = await geminiService.sendMessage(promptWithLang, messages);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  const startVoiceAssistant = async () => {
    try {
      setIsVoiceActive(true);
      setVoiceTranscript('Connecting to Voice Assistant...');

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Contexts
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        // Updated to the recommended model for real-time audio interaction
        model: 'gemini-2.0-flash-exp',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `${SYSTEM_INSTRUCTION} 
          IMPORTANT: Use ${user.settings.language} for communication. 
          You are in real-time voice mode. Be concise and helpful.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setVoiceTranscript('I am listening...');
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Followed guidelines: initiate sendRealtimeInput after live.connect call resolves using sessionPromise.then
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.outputTranscription) {
              setVoiceTranscript(prev => prev + ' ' + message.serverContent?.outputTranscription?.text);
            }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
              const ctx = audioContextOutRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => activeSourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              activeSourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Handle turn complete
            if (message.serverContent?.turnComplete) {
              // Optionally add the transcript to chat history here if desired
            }
          },
          onclose: () => stopVoiceAssistant(),
          onerror: (e) => {
            console.error(e);
            stopVoiceAssistant();
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start voice assistant:', err);
      setIsVoiceActive(false);
    }
  };

  const stopVoiceAssistant = () => {
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    if (audioContextInRef.current) audioContextInRef.current.close();
    if (audioContextOutRef.current) audioContextOutRef.current.close();
    activeSourcesRef.current.forEach(s => s.stop());
    activeSourcesRef.current.clear();
    setIsVoiceActive(false);
    setVoiceTranscript('');
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col pt-2 relative">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <h1 className="text-xl font-bold">Aarogya AI</h1>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={isVoiceActive ? stopVoiceAssistant : startVoiceAssistant}
            className={`p-2 rounded-xl transition-all ${isVoiceActive ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600/10 text-blue-500'}`}
           >
            {isVoiceActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <div className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full uppercase">
            {user.settings.language}
          </div>
        </div>
      </div>

      {/* Voice Active Overlay */}
      {isVoiceActive && (
        <div className="absolute inset-x-0 top-16 bottom-20 z-50 bg-[#0B0E14]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="w-32 h-32 rounded-full border-4 border-blue-500/30 flex items-center justify-center relative z-10">
              <Volume2 className="w-12 h-12 text-blue-500 animate-bounce" />
            </div>
            {/* Pulsing rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-blue-500/20 rounded-full animate-ping"></div>
          </div>
          
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-4">Voice Assistant Active</h2>
          <div className="max-w-xs">
            <p className="text-blue-400 text-sm font-medium animate-pulse italic">
              {voiceTranscript || "How can I help you today?"}
            </p>
          </div>
          
          <button 
            onClick={stopVoiceAssistant}
            className="mt-12 px-8 py-4 bg-red-600 text-white font-black rounded-2xl flex items-center gap-2 uppercase text-xs tracking-widest shadow-xl shadow-red-600/20"
          >
            <X className="w-4 h-4" /> End Voice Session
          </button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 px-2 mb-4 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                : 'bg-gray-900 text-gray-200 border border-gray-800 rounded-tl-none'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-3xl rounded-tl-none">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <input 
          type="text"
          placeholder={`Type in ${user.settings.language}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-4 pr-16 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-2xl"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg active:scale-90 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;