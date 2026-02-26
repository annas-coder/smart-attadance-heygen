import { motion } from 'framer-motion';
import { PEOPLE } from '@/lib/kioskData';
import { ScanLine, ScanFace } from 'lucide-react';

interface UserGridProps {
  onSelect: (index: number) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.93, rotate: -1 },
  show: { opacity: 1, y: 0, scale: 1, rotate: 0 }
};

const UserGrid = ({ onSelect }: UserGridProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto kiosk-scroll">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-14 h-14 rounded-2xl gradient-border flex items-center justify-center mb-4 kiosk-shadow-glow" style={{ animation: 'float 3s ease-in-out infinite' }}>
          <ScanLine size={24} className="text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2 text-center tracking-tight">
          Select to <span className="gradient-text">Check In</span>
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-[360px]">
          Tap a person to simulate face recognition and view their event details
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-5 gap-5 max-w-[900px] w-full"
      >
        {PEOPLE.map((user, i) => (
          <motion.div
            key={user.id}
            variants={item}
            whileHover={{ y: -6, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(i)}
            className="group flex flex-col items-center gap-3 p-5 border border-border/40 rounded-2xl bg-card cursor-pointer transition-all duration-300 text-center hover:border-primary/40 kiosk-shadow hover:kiosk-shadow-hover card-shine relative overflow-hidden"
          >
            {/* Scan icon overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/5 z-[2] pointer-events-none rounded-2xl">
              <ScanFace size={32} className="text-primary/30" />
            </div>

            <div className="relative">
              {/* Gradient ring on hover */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border/50 transition-all duration-300 group-hover:border-transparent relative">
                <img
                  src={user.photo}
                  alt={user.nm}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Gradient ring overlay */}
                <div className="absolute -inset-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{
                  background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
                  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px))',
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #fff calc(100% - 2px))',
                }} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-card border-2 border-card flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-success/60 group-hover:bg-success transition-colors" />
              </div>
            </div>
            <div>
              <div className="text-[12px] font-bold leading-tight mb-0.5 group-hover:gradient-text transition-all">{user.nm}</div>
              <div className="text-[10px] text-muted-foreground leading-tight font-medium font-mono-display">{user.dg}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UserGrid;
