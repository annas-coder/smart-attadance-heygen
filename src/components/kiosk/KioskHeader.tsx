import { useState, useEffect } from 'react';
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
    <header className="flex items-center justify-between px-8 py-4 border-b border-border/40 glass-strong flex-shrink-0 relative z-10">
      {/* Logo + Event */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl gradient-border flex items-center justify-center kiosk-shadow-glow transition-transform duration-300 hover:scale-110"
          style={{ animation: 'glow-pulse 3s ease-in-out infinite' }}
        >
          <Zap size={17} className="text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[15px] tracking-tight leading-tight">FutureFin Expo 2026</span>
          <span className="font-mono-display text-[9px] tracking-[1.5px] uppercase text-muted-foreground/70">Smart Kiosk System</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground px-3 py-1.5 rounded-xl bg-muted/40 border border-border/40">
          <span
            className="w-2 h-2 rounded-full bg-success flex-shrink-0"
            style={{ animation: 'status-pulse 2s infinite' }}
          />
          <span className="tabular-nums">{time}</span>
        </div>
      </div>

      {/* Bottom gradient glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{
        background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3), transparent)',
      }} />
    </header>
  );
};

export default KioskHeader;
