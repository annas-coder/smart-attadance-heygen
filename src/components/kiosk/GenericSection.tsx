import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Video, VideoOff, Timer } from 'lucide-react';
import AudioBars from './AudioBars';
import { getResponse } from '@/lib/kioskData';
import { heygenReady, startSession, closeSession, sendTextToAvatar, isSessionActive } from '@/lib/heygenService';

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
  const msgsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (isSessionActive()) {
        closeSession();
      }
    };
  }, []);

  const send = (text?: string) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { text: q, isUser: true }]);
    setIsTyping(true);
    setTimeout(() => {
      const reply = getResponse(q);
      setMessages(prev => [...prev, { text: reply, isUser: false }]);
      setIsTyping(false);
      if (isSessionActive()) {
        sendTextToAvatar(reply, 'repeat');
      }
    }, 600 + Math.random() * 400);
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
    await closeSession();
    setHeygenActive(false);
    setTimerText('');
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const showHeygenButton = heygenReady() && !heygenActive;

  return (
    <div className="flex-1 flex flex-row overflow-hidden">
      {/* Left panel - Avatar */}
      <div className="w-[380px] flex-shrink-0 flex flex-col items-center justify-center px-6 py-6 border-r border-border/30 relative overflow-hidden">
        {/* Particle dot pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-3 flex-shrink-0"
        >
          <div
            className="absolute -inset-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)',
              animation: 'glow-pulse 3s ease-in-out infinite',
            }}
          />
          {/* Animated gradient ring */}
          <div className="relative z-10 w-[180px] h-[190px] rounded-full gradient-ring">
            <div className="w-full h-full rounded-full overflow-hidden bg-card kiosk-shadow-lg relative">
              <img
                src="/images/nadim-avatar.png"
                alt="Nadim"
                className={`w-full h-full object-cover ${heygenActive ? 'hidden' : ''}`}
              />
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover object-[center_35%] ${heygenActive ? 'block' : 'hidden'}`}
                autoPlay
                playsInline
                width={158}
                height={166}
              />
            </div>
          </div>
          {/* Status badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-success/20 kiosk-shadow text-[9px] font-bold uppercase tracking-wider text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success" style={{ animation: 'status-pulse 2s infinite' }} />
            {heygenActive ? 'Live' : 'Online'}
          </div>
        </motion.div>

        {/* Timer */}
        {timerText && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5 mt-1 mb-1 px-3 py-1 rounded-full bg-warning/8 border border-warning/20 text-[11px] font-mono text-warning font-medium"
          >
            <Timer size={12} />
            {timerText}
          </motion.div>
        )}

        <div className="flex items-center gap-2 mt-2 mb-1">
          <AudioBars active={isTyping || heygenActive} />
        </div>
        <div className="text-xs text-muted-foreground mb-3 flex-shrink-0 flex items-center gap-1.5">
          <Sparkles size={12} className="text-primary" />
          <span className="gradient-text font-bold">Nadim</span>
          <span className="text-muted-foreground/40">·</span>
          <span>Virtual Assistant</span>
        </div>

        {/* Start Conversation Button */}
        {showHeygenButton && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartConversation}
            disabled={heygenLoading}
            className="mb-3 flex-shrink-0 py-2.5 px-6 rounded-xl gradient-border text-primary-foreground font-semibold text-[13px] cursor-pointer transition-all duration-200 kiosk-shadow-glow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Video size={16} />
            {heygenLoading ? 'Connecting...' : 'Start Conversation'}
          </motion.button>
        )}

        {heygenActive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStopConversation}
            className="mb-3 py-2 px-5 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive font-semibold text-[12px] cursor-pointer transition-all duration-200 hover:bg-destructive/10 kiosk-shadow flex items-center gap-2"
          >
            <VideoOff size={14} />
            Stop
          </motion.button>
        )}

        {/* Quick suggestions */}
        {messages.length <= 1 && !heygenActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 flex-wrap justify-center mt-2 w-full max-w-[320px] flex-shrink-0"
          >
            {quickSuggestions.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="py-2 px-3.5 rounded-full border border-border/60 bg-card text-muted-foreground text-[11px] font-medium cursor-pointer transition-all duration-200 hover:border-primary hover:text-primary hover:bg-primary/5 kiosk-shadow"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Right panel - Chat */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background/30">
        {/* Messages */}
        <div ref={msgsRef} className="flex-1 overflow-y-auto kiosk-scroll p-6 flex flex-col gap-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`
                  max-w-[85%] text-[14px] leading-relaxed
                  ${msg.isUser
                    ? 'self-end rounded-[20px_20px_6px_20px] bg-kiosk-bubble-user border border-primary/15 px-5 py-3.5'
                    : 'self-start rounded-[20px_20px_20px_6px] bg-card border border-border/50 kiosk-shadow-md px-5 py-3.5 relative overflow-hidden'
                  }
                `}
              >
                {!msg.isUser && (
                  <>
                    {/* Gradient accent bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[20px]" style={{
                      background: 'linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--accent)))',
                    }} />
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="w-4 h-4 rounded-full gradient-border flex items-center justify-center">
                        <Sparkles size={8} className="text-primary-foreground" />
                      </span>
                      <span className="font-mono-display text-[9px] font-bold uppercase tracking-wider gradient-text">Nadim</span>
                    </div>
                  </>
                )}
                <span className={msg.isUser ? 'text-foreground/90' : ''}>{msg.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="self-start rounded-[20px_20px_20px_6px] bg-card border border-border/50 px-5 py-4 kiosk-shadow-md"
            >
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input row */}
        <div className="p-4 pb-10 border-t border-border/30 glass flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex-1 relative input-focus-glow rounded-2xl">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask Nadim anything..."
                className="w-full py-3.5 pl-5 pr-4 rounded-2xl border border-border/50 bg-card text-foreground text-[14px] outline-none transition-all duration-300 focus:border-primary/40 placeholder:text-muted-foreground/50 kiosk-shadow"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => send()}
              className="h-[50px] px-6 rounded-2xl gradient-border text-primary-foreground font-semibold text-sm cursor-pointer transition-all duration-200 kiosk-shadow-glow flex items-center gap-2"
            >
              <Send size={15} />
              Send
            </motion.button>
            {heygenActive && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStopConversation}
                className="h-[50px] px-5 rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-destructive/10 kiosk-shadow flex items-center gap-2"
              >
                <VideoOff size={15} />
                Stop
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericSection;
