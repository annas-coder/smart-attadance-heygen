import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Video, VideoOff, Timer, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AudioBars from './AudioBars';
import { fetchGeneralChatResponse } from '@/lib/kioskData';
import { heygenReady, startSession, closeSession, sendTextToAvatar, isSessionActive } from '@/lib/heygenService';
import { startListening, stopListening, isListening as isVoiceListening } from '@/lib/voiceService';
import { useChromaKey } from '@/hooks/useChromaKey';

interface Message {
  text: string;
  isUser: boolean;
}

const quickSuggestions = ['What events are today?', 'WiFi password', 'Where can I eat?', 'Parking info'];

const GenericSection = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Good evening and welcome to FutureFin Expo 2026. I'm Nadim, your virtual assistant. I can help you with check-in, finding your way around the venue, session schedules, speaker information, dining options, and much more.",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [heygenActive, setHeygenActive] = useState(false);
  const [heygenLoading, setHeygenLoading] = useState(false);
  const [timerText, setTimerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const accumulatedRef = useRef('');
  const msgsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useChromaKey(videoRef, heygenActive);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (msgsRef.current) {
        msgsRef.current.scrollTo({ top: msgsRef.current.scrollHeight, behavior: 'smooth' });
      }
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (isVoiceListening()) stopListening();
      if (isSessionActive()) closeSession();
    };
  }, []);

  const send = async (text?: string) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { text: q, isUser: true }]);
    setIsTyping(true);
    try {
      const reply = await fetchGeneralChatResponse(q);
      setMessages(prev => [...prev, { text: reply, isUser: false }]);
      if (isSessionActive()) {
        sendTextToAvatar(reply, 'repeat');
      }
    } catch {
      setMessages(prev => [...prev, { text: "I'm having trouble connecting right now. Please try again in a moment.", isUser: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartConversation = useCallback(async () => {
    if (!heygenReady() || heygenActive) return;
    setHeygenLoading(true);
    try {
      await startSession(
        videoRef.current!,
        () => { setHeygenActive(true); setHeygenLoading(false); },
        () => { setHeygenActive(false); setTimerText(''); },
        (text) => setTimerText(text),
        () => handleStopConversation(),
      );
    } catch (e) {
      console.warn('HeyGen session failed:', e);
      setHeygenLoading(false);
      setHeygenActive(false);
    }
  }, [heygenActive]);

  const handleStopConversation = useCallback(async () => {
    if (isVoiceListening()) {
      stopListening();
      setIsRecording(false);
      setPartialTranscript('');
    }
    await closeSession();
    setHeygenActive(false);
    setTimerText('');
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleToggleMic = useCallback(() => {
    if (isRecording) {
      const finalText = stopListening();
      setIsRecording(false);
      const combined = (finalText + ' ' + partialTranscript).trim();
      setPartialTranscript('');
      accumulatedRef.current = '';
      if (combined) {
        send(combined);
      }
    } else {
      accumulatedRef.current = '';
      setPartialTranscript('');
      startListening({
        onPartial: (text) => setPartialTranscript(text),
        onCommitted: (text) => {
          accumulatedRef.current = text;
          setPartialTranscript('');
        },
        onError: (err) => {
          console.warn('Voice error:', err);
          setIsRecording(false);
          setPartialTranscript('');
          accumulatedRef.current = '';
        },
        onStateChange: (listening) => setIsRecording(listening),
      });
    }
  }, [isRecording, send, partialTranscript]);

  const showHeygenButton = heygenReady() && !heygenActive;

  return (
    <div className="flex-1 flex flex-row overflow-hidden">
      {/* Left panel — Avatar */}
      <div className="w-[420px] flex-shrink-0 flex flex-col items-center justify-center px-8 py-6 border-r border-border/20 relative overflow-hidden">
        {/* Subtle radial glow behind avatar */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center 40%, hsl(var(--primary) / 0.06), transparent 70%)',
        }} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-4 flex-shrink-0"
        >
          <div
            className="absolute -inset-10 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.06), transparent 70%)',
              animation: 'glow-pulse 4s ease-in-out infinite',
            }}
          />
          <div className="relative z-10 w-[160px] h-[160px] rounded-full gradient-ring">
            <div className="w-full h-full rounded-full overflow-hidden bg-card kiosk-shadow-lg relative" style={{ background: '#0f1729' }}>
              <img
                src="/images/nadim-avatar.png"
                alt="Nadim"
                className={`w-full h-full object-cover ${heygenActive ? 'hidden' : ''}`}
              />
              <video
                ref={videoRef}
                className="hidden"
                autoPlay
                playsInline
                width={160}
                height={160}
              />
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full object-cover object-[center_35%] ${heygenActive ? 'block' : 'hidden'}`}
              />
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full glass-card text-[10px] font-bold uppercase tracking-wider text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success" style={{ animation: 'status-pulse 2s infinite' }} />
            {heygenActive ? 'Live' : 'Online'}
          </div>
        </motion.div>

        {timerText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 mt-1 mb-1 px-3 py-1 rounded-full glass-card text-[11px] font-mono text-warning font-medium"
          >
            <Timer size={12} />
            {timerText}
          </motion.div>
        )}

        <div className="flex items-center gap-2 mt-2 mb-1">
          <AudioBars active={isTyping || heygenActive} />
        </div>
        <div className="text-xs text-muted-foreground mb-4 flex-shrink-0 flex items-center gap-2">
          <Sparkles size={12} className="text-primary" />
          <span className="gradient-text font-bold text-sm">Nadim</span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-muted-foreground/70">Virtual Assistant</span>
        </div>

        {showHeygenButton && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartConversation}
            disabled={heygenLoading}
            className="mb-4 flex-shrink-0 py-2.5 px-7 rounded-xl gradient-border text-primary-foreground font-semibold text-sm cursor-pointer transition-all duration-200 kiosk-shadow-glow flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Video size={16} />
            {heygenLoading ? 'Connecting...' : 'Start Conversation'}
          </motion.button>
        )}

        {heygenActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStopConversation}
            className="mb-4 py-2 px-5 rounded-xl border border-destructive/30 bg-destructive/8 text-destructive font-semibold text-xs cursor-pointer transition-all duration-200 hover:bg-destructive/15 kiosk-shadow flex items-center gap-2"
          >
            <VideoOff size={14} />
            End Session
          </motion.button>
        )}

        {messages.length <= 1 && !heygenActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 flex-wrap justify-center mt-2 w-full max-w-[340px] flex-shrink-0"
          >
            {quickSuggestions.map(s => (
              <motion.button
                key={s}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => send(s)}
                className="py-2 px-4 rounded-xl card-fintech text-muted-foreground text-xs font-medium cursor-pointer"
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Right panel — Chat */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div ref={msgsRef} className="flex-1 min-h-0 overflow-y-auto kiosk-scroll p-6 flex flex-col gap-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`
                  max-w-[85%] text-sm leading-relaxed flex-shrink-0 break-words
                  ${msg.isUser
                    ? 'self-end rounded-[20px_20px_6px_20px] px-5 py-3.5 border border-primary/15'
                    : 'self-start rounded-[20px_20px_20px_6px] card-fintech px-5 py-3.5 relative overflow-hidden'
                  }
                `}
                style={msg.isUser ? { background: 'hsl(var(--kiosk-bubble-user))' } : undefined}
              >
                {!msg.isUser && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[20px]" style={{
                      background: 'linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--secondary)))',
                    }} />
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="w-5 h-5 rounded-full gradient-border flex items-center justify-center">
                        <Sparkles size={9} className="text-primary-foreground" />
                      </span>
                      <span className="font-mono-display text-[10px] font-bold uppercase tracking-wider gradient-text">Nadim</span>
                    </div>
                  </>
                )}
                {msg.isUser ? (
                  <span className="text-foreground/90">{msg.text}</span>
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-strong:text-foreground prose-a:text-primary">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="self-start rounded-2xl card-fintech px-6 py-3 max-w-[200px]"
            >
              <div className="h-2 rounded-full shimmer-bg" />
            </motion.div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-4 pb-5 border-t border-border/20 glass flex-shrink-0">
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/15 text-[12px] text-foreground/70 italic flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              {(accumulatedRef.current + (partialTranscript ? ' ' + partialTranscript : '')).trim() || 'Listening...'}
            </motion.div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative input-focus-glow rounded-2xl">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder={isRecording ? 'Listening...' : 'Ask Nadim anything about the expo...'}
                disabled={isRecording}
                className="w-full py-3.5 pl-5 pr-4 rounded-2xl border border-border/40 bg-card/60 text-foreground text-sm outline-none transition-all duration-300 focus:border-primary/30 placeholder:text-muted-foreground/40 kiosk-shadow disabled:opacity-50"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => send()}
              disabled={isRecording}
              className="h-[50px] px-6 rounded-2xl gradient-border text-primary-foreground font-semibold text-sm cursor-pointer transition-all duration-200 kiosk-shadow-glow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={15} />
              Send
            </motion.button>
            {heygenActive && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleMic}
                className={`relative h-[50px] w-[50px] rounded-2xl font-semibold text-sm cursor-pointer transition-all duration-200 flex items-center justify-center flex-shrink-0 ${
                  isRecording
                    ? 'bg-red-500/15 border-2 border-red-500/50 text-red-500'
                    : 'border border-border/40 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary kiosk-shadow'
                }`}
              >
                {isRecording && (
                  <span className="absolute inset-0 rounded-2xl border-2 border-red-500/40 animate-ping" />
                )}
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </motion.button>
            )}
            {heygenActive && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStopConversation}
                className="h-[50px] px-5 rounded-2xl border border-destructive/30 bg-destructive/8 text-destructive font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-destructive/15 kiosk-shadow flex items-center gap-2"
              >
                <VideoOff size={15} />
                End
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericSection;
