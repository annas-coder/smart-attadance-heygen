import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, MapPin, Armchair, CalendarDays, Navigation, CheckCircle2, Sparkles, Coffee, Wifi, Car, Calendar, Video, VideoOff, Timer } from 'lucide-react';
import AudioBars from './AudioBars';
import { Person, NADIM_AVATAR, getResponse } from '@/lib/kioskData';
import { heygenReady, startSession, closeSession, sendTextToAvatar, isSessionActive } from '@/lib/heygenService';

interface ResultViewProps {
  person: Person;
  onBack: () => void;
}

const ResultView = ({ person, onBack }: ResultViewProps) => {
  const [speechText, setSpeechText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [heygenActive, setHeygenActive] = useState(false);
  const [heygenLoading, setHeygenLoading] = useState(false);
  const [timerText, setTimerText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const h = new Date().getHours();
    const gr = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    const text = `Welcome ${person.f}! Good ${gr}. Your hall is ${person.hl}, ${person.fl}. ${person.ms} Need anything? Just ask!`;
    typeText(text);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [person]);

  useEffect(() => {
    return () => {
      if (isSessionActive()) closeSession();
    };
  }, []);

  const typeText = (text: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSpeechText('');
    setIsSpeaking(true);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setSpeechText(text.slice(0, i));
      if (i >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsSpeaking(false);
      }
    }, 14);
  };

  const askQuestion = (q: string) => {
    const reply = getResponse(q);
    typeText(reply);
    if (isSessionActive()) sendTextToAvatar(reply, 'repeat');
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
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const checkedInTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const gridCards = [
    { icon: Building2, label: 'Hall', value: person.hl, sub: person.hs, iconBg: 'bg-primary/10 text-primary' },
    { icon: MapPin, label: 'Location', value: person.fl, sub: person.bl, iconBg: 'bg-secondary/10 text-secondary' },
    { icon: Armchair, label: 'Seat', value: person.st, sub: person.zn, iconBg: 'bg-success/10 text-success' },
    { icon: CalendarDays, label: 'Event', value: person.ev, sub: person.et, iconBg: 'bg-warning/10 text-warning' },
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
      {/* Left panel - Avatar & Speech */}
      <div className="w-[380px] flex-shrink-0 flex flex-col items-center justify-center px-6 py-6 pb-14 border-r border-border/30 relative overflow-hidden">
        {/* Gradient banner bg */}
        <div className="absolute top-0 left-0 right-0 h-40 opacity-60 pointer-events-none" style={{
          background: 'linear-gradient(180deg, hsl(var(--primary) / 0.06), transparent)',
        }} />
        {/* Particle dots */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-3 z-10"
        >
          <div className="absolute -inset-6 rounded-full" style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)',
            animation: 'glow-pulse 3s ease-in-out infinite',
          }} />
          <div className="relative z-10 w-[130px] h-[130px] rounded-full gradient-ring">
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
              />
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-success/20 kiosk-shadow text-[9px] font-bold uppercase tracking-wider text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success" style={{ animation: 'status-pulse 2s infinite' }} />
            {heygenActive ? 'Live' : 'Online'}
          </div>
        </motion.div>

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

        <AudioBars active={isSpeaking || heygenActive} />
        <div className="text-xs text-muted-foreground mb-3 mt-1.5 flex items-center gap-1.5">
          <Sparkles size={11} className="text-primary" />
          <span className="gradient-text font-bold">Nadim</span>
          <span className="text-muted-foreground/30">·</span>
          <span>Assistant</span>
        </div>

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

        {/* Speech bubble */}
        <div className="bg-card border border-border/40 rounded-2xl rounded-bl-md p-4 w-full max-w-[300px] text-[13px] leading-[1.65] relative min-h-[50px] kiosk-shadow-md overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl gradient-border" />
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl" style={{
            background: 'linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--accent)))',
          }} />
          <span className="text-foreground/85">{speechText}</span>
          {isSpeaking && (
            <span className="inline-block w-[2px] h-[14px] bg-primary ml-0.5 align-text-bottom rounded-full" style={{ animation: 'cursor-blink 0.7s infinite' }} />
          )}
        </div>

        {/* Quick questions */}
        <div className="flex gap-2 flex-wrap mt-3 w-full max-w-[300px] justify-center">
          {quickQuestions.map(q => {
            const Icon = q.icon;
            return (
              <button
                key={q.key}
                onClick={() => askQuestion(q.key)}
                className="py-1.5 px-3 rounded-xl border border-border/40 bg-card text-muted-foreground text-[11px] font-medium cursor-pointer transition-all duration-200 hover:border-primary/30 hover:text-primary hover:bg-primary/5 kiosk-shadow flex items-center gap-1.5"
              >
                <Icon size={11} />
                {q.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel - Person Details */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background/30">
        <div className="flex-1 p-6 pb-14 overflow-y-auto flex flex-col gap-4 kiosk-scroll">
          {/* Profile card with gradient banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-card border border-border/30 rounded-2xl kiosk-shadow-md overflow-hidden"
          >
            {/* Gradient banner */}
            <div className="h-16 w-full" style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--accent) / 0.1))',
            }} />
            <div className="flex items-start gap-4 p-5 -mt-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-3 border-card kiosk-shadow-lg">
                  <img src={person.photo} alt={person.nm} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-2">
                <h3 className="text-lg font-extrabold tracking-tight leading-tight gradient-text">{person.nm}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium font-mono-display">{person.dg}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-success/8 border border-success/15 font-mono text-[9px] text-success tracking-[1px] font-bold whitespace-nowrap">
                    <CheckCircle2 size={10} />
                    CHECKED IN · {checkedInTime}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/70 font-medium mt-1.5 leading-relaxed font-mono-display">
                  ID: {person.id} · {person.dp} · Reports to: {person.rp}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Info grid - 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {gridCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.4 }}
                  className="group bg-card border border-border/30 rounded-2xl p-4 flex flex-col gap-1.5 kiosk-shadow transition-all duration-300 hover:kiosk-shadow-hover relative overflow-hidden"
                >
                  {/* Gradient border on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary) / 0.05), hsl(var(--accent) / 0.05))',
                  }} />
                  <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 gradient-border" />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg} mb-1 relative z-10`}>
                    <Icon size={15} />
                  </div>
                  <span className="text-[9px] uppercase tracking-[2px] text-muted-foreground font-bold font-mono-display relative z-10">{card.label}</span>
                  <span className="text-sm font-bold tracking-tight leading-snug relative z-10">{card.value}</span>
                  <span className="text-[11px] text-muted-foreground font-medium relative z-10">{card.sub}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Directions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="bg-card border border-border/30 rounded-2xl p-5 kiosk-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Navigation size={15} />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-[2px] text-muted-foreground font-bold block font-mono-display">Directions</span>
                <span className="text-[11px] text-muted-foreground">{person.dr.length} steps to your destination</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {person.dr.map((d, i) => (
                <div key={i} className="inline-flex items-center gap-2 py-1.5 px-3 bg-muted/50 border border-border/40 rounded-xl text-[11px] text-foreground/80 font-medium">
                  <span className="w-5 h-5 rounded-md gradient-border text-primary-foreground flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {d}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Back */}
        <div className="p-4 border-t border-border/30 flex-shrink-0 glass flex items-center justify-center">
          <button
            onClick={onBack}
            className="py-2.5 px-7 rounded-xl border border-border/40 bg-card text-muted-foreground text-[13px] font-medium cursor-pointer transition-all duration-200 hover:border-primary/30 hover:text-primary kiosk-shadow inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            Back to list
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultView;
