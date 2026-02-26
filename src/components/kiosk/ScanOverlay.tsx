import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, CheckCircle2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

interface ScanOverlayProps {
  visible: boolean;
  photo: string | null;
  personName?: string;
}

const ScanOverlay = ({ visible, photo, personName }: ScanOverlayProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      setShowSuccess(false);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) { clearInterval(progressInterval); return 100; }
          return prev + 2;
        });
      }, 35);

      const successTimer = setTimeout(() => setShowSuccess(true), 1400);
      return () => { clearTimeout(successTimer); clearInterval(progressInterval); };
    }
  }, [visible]);

  const dataChars = useMemo(() => {
    const chars = '0123456789ABCDEF';
    const chunk = Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return chunk + ' ' + chunk;
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center flex-col gap-6"
          style={{
            background: 'hsl(var(--background) / 0.92)',
            backdropFilter: 'blur(32px) saturate(1.4)',
          }}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          <motion.div
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative"
          >
            {/* Concentric rings */}
            {[0, 1, 2].map(ring => (
              <div
                key={ring}
                className="absolute inset-0 rounded-full"
                style={{
                  inset: `${-24 - ring * 24}px`,
                  border: '1px solid hsl(var(--primary) / 0.2)',
                  animation: `scan-ring-expand 2.2s ease-out infinite ${ring * 0.4}s`,
                }}
              />
            ))}

            <div
              className="w-[220px] h-[220px] rounded-full border-[3px] border-primary/50 flex items-center justify-center relative overflow-hidden bg-card kiosk-shadow-lg"
              style={{ animation: 'scan-pulse 1.2s infinite' }}
            >
              <img src={photo} alt="Scanning" className="w-[170px] h-[170px] rounded-full object-cover" />

              {/* Dual scan lines */}
              {!showSuccess && (
                <>
                  <div
                    className="absolute w-full h-[3px]"
                    style={{
                      background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
                      animation: 'scan-line 0.9s ease-in-out infinite',
                      boxShadow: '0 0 24px hsl(var(--primary) / 0.4)',
                    }}
                  />
                  <div
                    className="absolute w-full h-[2px]"
                    style={{
                      background: 'linear-gradient(90deg, transparent, hsl(var(--secondary) / 0.6), transparent)',
                      animation: 'scan-line 0.9s ease-in-out infinite reverse',
                      boxShadow: '0 0 16px hsl(var(--secondary) / 0.3)',
                    }}
                  />
                </>
              )}

              {/* Corner markers */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-primary/40 rounded-tl" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-primary/40 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary/40 rounded-bl" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-primary/40 rounded-br" />
            </div>

            {/* Success overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {/* Haptic pulse ring */}
                  <div
                    className="absolute w-20 h-20 rounded-full"
                    style={{
                      border: '2px solid hsl(var(--success) / 0.3)',
                      animation: 'scan-ring-expand 1.5s ease-out forwards',
                    }}
                  />
                  <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center"
                    style={{ boxShadow: '0 0 40px hsl(var(--success) / 0.3)' }}
                  >
                    <CheckCircle2 size={32} className="text-success-foreground" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Scrolling data readout */}
          <div className="overflow-hidden max-w-[320px]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              className="font-mono text-[10px] text-primary/50 tracking-[4px] whitespace-nowrap"
              style={{ animation: 'ticker-scroll 8s linear infinite' }}
            >
              {dataChars}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2 text-base font-semibold">
              {showSuccess ? (
                <span className="text-success flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Match Found
                </span>
              ) : (
                <span className="text-primary flex items-center gap-2">
                  <ScanLine size={18} />
                  Identifying face...
                </span>
              )}
            </div>

            {/* Name reveal on success */}
            <AnimatePresence>
              {showSuccess && personName ? (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
                  className="text-lg font-extrabold tracking-tight gradient-text"
                >
                  Welcome, {personName}!
                </motion.div>
              ) : (
                <div className="text-xs text-muted-foreground font-mono-display tracking-wide">
                  Please hold still
                </div>
              )}
            </AnimatePresence>

            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-muted-foreground font-mono-display tracking-wide"
              >
                Loading profile...
              </motion.div>
            )}
          </motion.div>

          {/* Progress bar with percentage */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-56 h-1.5 rounded-full overflow-hidden bg-muted"
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--success)))' }}
              />
            </motion.div>
            <span className="font-mono text-[11px] text-muted-foreground w-10 text-right tabular-nums">
              {Math.min(progress, 100)}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScanOverlay;
