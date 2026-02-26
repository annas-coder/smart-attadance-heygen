import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const KioskHeader = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const n = new Date();
      setTime(
        n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' · ' +
        n.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center justify-between px-8 py-3.5 border-b border-border/30 glass-strong flex-shrink-0 relative z-10">
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl gradient-border flex items-center justify-center kiosk-shadow-glow cursor-pointer"
          style={{ animation: 'float 4s ease-in-out infinite' }}
        >
          <Zap size={18} className="text-primary-foreground" />
        </motion.div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight leading-tight gradient-text">
            FutureFin Expo 2026
          </span>
          <span className="font-mono-display text-[10px] tracking-[2px] uppercase text-muted-foreground/60">
            Smart Kiosk System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-card text-xs">
          <span
            className="w-2 h-2 rounded-full bg-success flex-shrink-0"
            style={{ animation: 'status-pulse 2s infinite' }}
          />
          <span className="text-success font-semibold text-[10px] uppercase tracking-wider">Active</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground/80 px-4 py-2 rounded-xl glass-card">
          <span className="tabular-nums">{time}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
        background: 'linear-gradient(90deg, transparent 5%, hsl(var(--primary) / 0.4) 30%, hsl(var(--secondary) / 0.3) 50%, hsl(var(--gold) / 0.2) 70%, transparent 95%)',
      }} />
    </header>
  );
};

export default KioskHeader;
