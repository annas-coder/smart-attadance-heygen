import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ScanOverlayProps {
  visible: boolean;
  photo: string | null;
}

const ScanOverlay = ({ visible, photo }: ScanOverlayProps) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (visible) {
      setShowSuccess(false);
      const timer = setTimeout(() => setShowSuccess(true), 1400);
      return () => clearTimeout(timer);
    }
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
            background: 'rgba(8, 12, 24, 0.92)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(hsl(var(--warning) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--warning) / 0.5) 1px, transparent 1px)',
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
                className="absolute inset-0 rounded-full border border-warning/20"
                style={{
                  inset: `${-20 - ring * 20}px`,
                  animation: `scan-ring-expand 2s ease-out infinite ${ring * 0.4}s`,
                }}
              />
            ))}

            <div
              className="w-[200px] h-[200px] rounded-full border-[3px] border-warning/80 flex items-center justify-center relative overflow-hidden"
              style={{ animation: 'scan-pulse 1s infinite' }}
            >
              <img src={photo} alt="Scanning" className="w-[150px] h-[150px] rounded-full object-cover opacity-90" />
              {!showSuccess && (
                <div
                  className="absolute w-full h-[3px]"
                  style={{
                    background: 'linear-gradient(90deg, transparent, hsl(var(--warning)), transparent)',
                    animation: 'scan-line 0.85s ease-in-out infinite',
                    boxShadow: '0 0 16px hsl(var(--warning) / 0.5)',
                  }}
                />
              )}
              {/* Corner markers */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-warning/60 rounded-tl" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-warning/60 rounded-tr" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-warning/60 rounded-bl" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-warning/60 rounded-br" />
            </div>

            {/* Success check overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-success/90 flex items-center justify-center kiosk-shadow-glow">
                    <CheckCircle2 size={32} className="text-success-foreground" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2 text-[15px] font-semibold">
              {showSuccess ? (
                <span className="text-success flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Match Found!
                </span>
              ) : (
                <span className="text-warning flex items-center gap-2">
                  <ScanLine size={18} />
                  Identifying face...
                </span>
              )}
            </div>
            <div className="text-[13px] text-muted-foreground/60 font-mono-display tracking-wide">
              {showSuccess ? 'Loading profile...' : 'Please hold still'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-56 h-1.5 rounded-full bg-muted/10 overflow-hidden"
          >
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, hsl(var(--warning)), hsl(var(--success)))' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScanOverlay;
