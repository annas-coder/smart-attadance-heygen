import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, Armchair, CalendarDays, Navigation, CheckCircle2, Sparkles, Coffee, Wifi, Car, Calendar, Video, VideoOff, Timer, Send, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AudioBars from './AudioBars';
import { Person, fetchUserChatResponse } from '@/lib/kioskData';
import { heygenReady, startSession, closeSession, sendTextToAvatar, isSessionActive } from '@/lib/heygenService';
import { startListening, stopListening, isListening as isVoiceListening } from '@/lib/voiceService';
import { useChromaKey } from '@/hooks/useChromaKey';

interface ResultViewProps {
  person: Person;
  onBack: () => void;
}

interface ChatMessage {
  text: string;
  isUser: boolean;
}

const ResultView = ({ person, onBack }: ResultViewProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [heygenActive, setHeygenActive] = useState(false);
  const [heygenLoading, setHeygenLoading] = useState(false);
  const [timerText, setTimerText] = useState('');
  const [questionInput, setQuestionInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const accumulatedRef = useRef('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useChromaKey(videoRef, heygenActive);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = new Date().getHours();
    const gr = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    const welcomeText = `Welcome ${person.f}! Good ${gr}. Your hall is **${person.hl}**, ${person.fl}. ${person.ms} Need anything? Just ask!`;
    const timer = setTimeout(() => {
      setMessages([{ text: welcomeText, isUser: false }]);
      setIsTyping(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [person]);

  useEffect(() => {
    return () => {
      if (isVoiceListening()) stopListening();
      if (isSessionActive()) closeSession();
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (msgsRef.current) {
        msgsRef.current.scrollTo({ top: msgsRef.current.scrollHeight, behavior: 'smooth' });
      }
    });
  }, [messages]);

  const askQuestion = async (q: string) => {
    setMessages(prev => [...prev, { text: q, isUser: true }]);
    setIsTyping(true);
    try {
      const reply = await fetchUserChatResponse(q, person.nm);
      setMessages(prev => [...prev, { text: reply, isUser: false }]);
      if (isSessionActive()) sendTextToAvatar(reply, 'repeat');
    } catch {
      setMessages(prev => [...prev, { text: "I'm having trouble connecting right now. Please try again in a moment.", isUser: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendQuestion = () => {
    const q = questionInput.trim();
    if (!q || isTyping) return;
    setQuestionInput('');
    askQuestion(q);
  };

  const handleStartConversation = useCallback(async () => {
    if (!heygenReady() || heygenActive) return;
    setHeygenLoading(true);
    const h = new Date().getHours();
    const greeting = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    const personalWelcome = `Good ${greeting} ${person.f}! Welcome to FutureFin Expo 2026. I'm Nadim, your virtual assistant. Your hall is ${person.hl}, ${person.fl}. Feel free to ask me anything about the event, directions, or any help you need.`;
    try {
      await startSession(
        videoRef.current!,
        () => { setHeygenActive(true); setHeygenLoading(false); },
        () => { setHeygenActive(false); setTimerText(''); },
        (text) => setTimerText(text),
        () => handleStopConversation(),
        personalWelcome,
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
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const handleToggleMic = useCallback(() => {
    if (isRecording) {
      const finalText = stopListening();
      setIsRecording(false);
      const combined = (finalText + ' ' + partialTranscript).trim();
      setPartialTranscript('');
      accumulatedRef.current = '';
      if (combined) {
        askQuestion(combined);
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
  }, [isRecording, person.nm, partialTranscript]);

  const checkedInTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const gridCards = [
    { icon: Building2, label: 'Hall', value: person.hl, sub: person.hs, color: 'primary' },
    { icon: MapPin, label: 'Location', value: person.fl, sub: person.bl, color: 'secondary' },
    { icon: Armchair, label: 'Seat', value: person.st, sub: person.zn, color: 'success' },
    { icon: CalendarDays, label: 'Event', value: person.ev, sub: person.et, color: 'gold' },
  ];

  const quickQuestions = [
    { label: 'Coffee', key: 'coffee', icon: Coffee },
    { label: 'WiFi', key: 'wifi', icon: Wifi },
    { label: 'Parking', key: 'parking', icon: Car },
    { label: 'Schedule', key: 'schedule', icon: Calendar },
  ];

  const showHeygenButton = heygenReady() && !heygenActive;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-row overflow-hidden"
    >
      {/* Left panel — Person Details (420px, scrollable) */}
      <div className="w-[420px] flex-shrink-0 flex flex-col overflow-hidden border-r border-border/20 relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center 30%, hsl(var(--primary) / 0.04), transparent 70%)',
        }} />

        {/* Pinned profile header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative flex-shrink-0 px-6 pt-5 pb-4 border-b border-border/20 glass z-10"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-[3px] border-primary/20 kiosk-shadow-lg">
                <img src={person.photo} alt={person.nm} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-extrabold tracking-tight leading-tight gradient-text">{person.nm}</h3>
              <p className="text-xs text-muted-foreground/70 mt-0.5 font-medium font-mono-display">{person.dg}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg border font-mono text-[10px] tracking-[1px] font-bold whitespace-nowrap"
                  style={{
                    background: 'hsl(var(--success) / 0.08)',
                    borderColor: 'hsl(var(--success) / 0.2)',
                    color: 'hsl(var(--success))',
                  }}
                >
                  <CheckCircle2 size={10} />
                  CHECKED IN · {checkedInTime}
                </span>
                <span className="text-[10px] text-muted-foreground/40 font-medium font-mono-display">
                  ID: {person.id}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 kiosk-scroll">
          {/* Info grid — 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {gridCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                  className="group card-fintech p-4 flex flex-col gap-1.5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 gradient-border" />
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1 relative z-10"
                    style={{ background: `hsl(var(--${card.color}) / 0.1)`, color: `hsl(var(--${card.color}))` }}
                  >
                    <Icon size={15} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[2px] text-muted-foreground/60 font-bold font-mono-display relative z-10">{card.label}</span>
                  <span className="text-sm font-bold tracking-tight leading-snug relative z-10">{card.value}</span>
                  <span className="text-[11px] text-muted-foreground/60 font-medium relative z-10">{card.sub}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Directions timeline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="card-fintech p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}
              >
                <Navigation size={15} />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[2px] text-muted-foreground/60 font-bold block font-mono-display">Directions</span>
                <span className="text-[11px] text-muted-foreground/50">{person.dr.length} steps to your destination</span>
              </div>
            </div>
            <div className="flex flex-col gap-0 relative ml-4">
              <div className="absolute left-[9px] top-3 bottom-3 w-[2px] rounded-full" style={{
                background: 'linear-gradient(to bottom, hsl(var(--primary) / 0.3), hsl(var(--secondary) / 0.2))',
              }} />
              {person.dr.map((d, i) => (
                <div key={i} className="flex items-start gap-3 py-1.5 relative">
                  <div className="w-5 h-5 rounded-full gradient-border text-primary-foreground flex items-center justify-center text-[9px] font-bold flex-shrink-0 z-10">
                    {i + 1}
                  </div>
                  <span className="text-[12px] text-foreground/75 font-medium pt-0.5">{d}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Back button pinned at bottom */}
        <div className="p-4 pb-12 border-t border-border/20 flex-shrink-0 glass flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="py-2.5 px-7 rounded-xl card-fintech text-muted-foreground text-sm font-medium cursor-pointer inline-flex items-center gap-2 hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            Back to list
          </motion.button>
        </div>
      </div>

      {/* Right panel — Nadim Avatar + Chat */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Avatar area at top */}
        <div className="flex flex-col items-center px-6 pt-5 pb-3 flex-shrink-0 relative">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center 40%, hsl(var(--primary) / 0.04), transparent 70%)',
          }} />

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative mb-2 z-10"
          >
            <div className="absolute -inset-8 rounded-full" style={{
              background: 'radial-gradient(circle, hsl(var(--primary) / 0.05), transparent 70%)',
              animation: 'glow-pulse 4s ease-in-out infinite',
            }} />
            <div className="relative z-10 w-[100px] h-[100px] rounded-full gradient-ring">
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
                />
                <canvas
                  ref={canvasRef}
                  className={`absolute inset-0 w-full h-full object-cover object-[center_35%] ${heygenActive ? 'block' : 'hidden'}`}
                />
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2.5 py-0.5 rounded-full glass-card text-[9px] font-bold uppercase tracking-wider text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success" style={{ animation: 'status-pulse 2s infinite' }} />
              {heygenActive ? 'Live' : 'Online'}
            </div>
          </motion.div>

          {timerText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full glass-card text-[10px] font-mono text-warning font-medium"
            >
              <Timer size={11} />
              {timerText}
            </motion.div>
          )}

          <AudioBars active={isTyping || heygenActive} />
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <Sparkles size={11} className="text-primary" />
            <span className="gradient-text font-bold text-xs">Nadim</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="text-muted-foreground/70 text-[11px]">Assistant</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {showHeygenButton && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartConversation}
                disabled={heygenLoading}
                className="py-2 px-5 rounded-xl gradient-border text-primary-foreground font-semibold text-xs cursor-pointer transition-all duration-200 kiosk-shadow-glow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Video size={14} />
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
                className="py-2 px-4 rounded-xl border border-destructive/30 bg-destructive/8 text-destructive font-semibold text-xs cursor-pointer transition-all duration-200 hover:bg-destructive/15 kiosk-shadow flex items-center gap-2"
              >
                <VideoOff size={13} />
                End Session
              </motion.button>
            )}
          </div>
        </div>

        {/* Chat messages */}
        <div ref={msgsRef} className="flex-1 min-h-0 overflow-y-auto kiosk-scroll px-6 py-3 flex flex-col gap-3">
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="self-start rounded-[20px_20px_20px_6px] card-fintech px-5 py-4 flex items-center gap-2 relative overflow-hidden flex-shrink-0"
            >
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[20px]" style={{
                background: 'linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--secondary)))',
              }} />
              <div className="flex items-center gap-1.5 pl-1">
                <span className="w-2 h-2 rounded-full bg-primary/60" style={{ animation: 'typing-bounce 1.4s ease-in-out infinite' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60" style={{ animation: 'typing-bounce 1.4s ease-in-out 0.2s infinite' }} />
                <span className="w-2 h-2 rounded-full bg-primary/60" style={{ animation: 'typing-bounce 1.4s ease-in-out 0.4s infinite' }} />
              </div>
              <span className="text-[11px] text-muted-foreground/50 ml-1">Nadim is typing</span>
            </motion.div>
          )}
        </div>

        {/* Quick questions + Input bar */}
        <div className="px-6 pb-6 pt-3 border-t border-border/20 glass flex-shrink-0 flex flex-col gap-3">
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2 rounded-xl bg-primary/5 border border-primary/15 text-[12px] text-foreground/70 italic flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              {(accumulatedRef.current + (partialTranscript ? ' ' + partialTranscript : '')).trim() || 'Listening...'}
            </motion.div>
          )}
          <div className="flex gap-2 flex-wrap justify-center">
            {quickQuestions.map(q => {
              const Icon = q.icon;
              return (
                <motion.button
                  key={q.key}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => askQuestion(q.label)}
                  disabled={isTyping}
                  className="py-1.5 px-3.5 rounded-xl card-fintech text-muted-foreground text-[11px] font-medium cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon size={11} />
                  {q.label}
                </motion.button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative input-focus-glow rounded-2xl">
              <input
                value={questionInput}
                onChange={e => setQuestionInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendQuestion()}
                placeholder={isRecording ? 'Listening...' : 'Ask Nadim anything...'}
                disabled={isTyping || isRecording}
                className="w-full py-3.5 pl-5 pr-4 rounded-2xl border border-border/40 bg-card/60 text-foreground text-sm outline-none transition-all duration-300 focus:border-primary/30 placeholder:text-muted-foreground/40 kiosk-shadow disabled:opacity-50"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSendQuestion}
              disabled={isTyping || isRecording || !questionInput.trim()}
              className="h-[50px] px-6 rounded-2xl gradient-border text-primary-foreground font-semibold text-sm cursor-pointer transition-all duration-200 kiosk-shadow-glow flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                disabled={isTyping}
                className={`relative h-[50px] w-[50px] rounded-2xl font-semibold text-sm cursor-pointer transition-all duration-200 flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultView;
