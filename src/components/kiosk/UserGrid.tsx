import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PEOPLE } from '@/lib/kioskData';
import { ScanLine, ScanFace, Search } from 'lucide-react';

interface UserGridProps {
  onSelect: (index: number) => void;
}

const EVENT_COLORS: Record<string, string> = {
  'Tech Summit 2026': 'primary',
  'Q1 Strategy Review': 'secondary',
  'Partnership Discussion': 'gold',
  'Design Sprint': 'warning',
  'Security Briefing': 'destructive',
};

function getEventColor(ev: string) {
  return EVENT_COLORS[ev] ?? 'primary';
}

const COLS = 5;

const UserGrid = ({ onSelect }: UserGridProps) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return PEOPLE.map((u, i) => ({ user: u, idx: i }));
    const q = search.toLowerCase();
    return PEOPLE
      .map((u, i) => ({ user: u, idx: i }))
      .filter(({ user }) => user.nm.toLowerCase().includes(q) || user.dg.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-8 pt-6 overflow-y-auto kiosk-scroll">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-6"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-2xl gradient-border flex items-center justify-center mb-4 kiosk-shadow-glow"
        >
          <ScanLine size={24} className="text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-extrabold mb-1.5 text-center tracking-tight">
          Who's <span className="gradient-text">checking in</span>?
        </h2>
        <p className="text-sm text-muted-foreground/70 text-center max-w-[420px] leading-relaxed">
          Tap your face to begin identification and view your personalised event details
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="w-full max-w-[960px] mb-6"
      >
        <div className="relative max-w-[320px] mx-auto">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or role..."
            className="w-full py-2.5 pl-9 pr-4 rounded-xl border border-border/50 bg-card text-foreground text-xs outline-none transition-all duration-300 focus:border-primary/30 placeholder:text-muted-foreground/40 kiosk-shadow"
          />
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.035, delayChildren: 0.15 } },
        }}
        className="grid grid-cols-5 gap-4 max-w-[960px] w-full"
      >
        {filtered.map(({ user, idx }, vi) => {
          const evColor = getEventColor(user.ev);
          const row = Math.floor(vi / COLS);
          const col = vi % COLS;
          const staggerDelay = (row * 0.06) + (col * 0.03);

          return (
            <motion.div
              key={user.id}
              variants={{
                hidden: { opacity: 0, y: 16, scale: 0.95 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut', delay: staggerDelay } },
              }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(idx)}
              className="group flex flex-col items-center gap-2.5 p-4 pb-3.5 card-fintech cursor-pointer text-center relative overflow-hidden card-shine"
            >
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[2] pointer-events-none rounded-2xl"
                style={{ background: `hsl(var(--${evColor}) / 0.04)` }}
              >
                <ScanFace size={26} className="text-primary/20" />
              </div>

              {/* Left accent bar on hover */}
              <div
                className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `hsl(var(--${evColor}))` }}
              />

              {/* Avatar */}
              <div className="relative">
                <div className="w-[68px] h-[68px] rounded-full overflow-hidden border-2 border-border/40 transition-all duration-300 group-hover:border-transparent relative">
                  <img
                    src={user.photo}
                    alt={user.nm}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
                    background: `conic-gradient(from 0deg, hsl(var(--${evColor})), hsl(var(--secondary)), hsl(var(--${evColor})))`,
                    WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px))',
                    mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px))',
                  }} />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-card border-2 border-card flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-success/50 group-hover:bg-success transition-colors duration-300" />
                </div>
              </div>

              {/* Info */}
              <div className="w-full">
                <div className="text-[13px] font-bold leading-tight mb-0.5 text-foreground/90 group-hover:text-foreground transition-colors truncate">{user.nm}</div>
                <div className="text-[10px] text-muted-foreground/60 leading-tight font-medium font-mono-display truncate">{user.dg}</div>
                <div className="text-[10px] text-muted-foreground/45 leading-tight mt-0.5 truncate">{user.hl}</div>
              </div>

              {/* Event badge */}
              <div
                className="px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide truncate max-w-full"
                style={{
                  background: `hsl(var(--${evColor}) / 0.08)`,
                  color: `hsl(var(--${evColor}))`,
                  border: `1px solid hsl(var(--${evColor}) / 0.15)`,
                }}
              >
                {user.ev}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-sm text-muted-foreground/60"
        >
          No attendees match "{search}"
        </motion.p>
      )}

      {filtered.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-[11px] text-muted-foreground/40 font-mono-display tracking-wider uppercase"
        >
          Tap any profile to begin identification
        </motion.p>
      )}
    </div>
  );
};

export default UserGrid;
