import { MessageCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface KioskTabsProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

const tabs = [
  { icon: MessageCircle, label: 'General Avatar', subtitle: 'Ask anything about the expo' },
  { icon: User, label: 'Personalised Avatar', subtitle: 'Face ID check-in experience' },
];

const KioskTabs = ({ activeTab, onTabChange }: KioskTabsProps) => {
  return (
    <nav className="flex gap-1.5 border-b border-border/20 flex-shrink-0 glass px-6 py-2">
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = activeTab === i;
        return (
          <motion.button
            key={i}
            onClick={() => onTabChange(i)}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex items-center gap-3 py-2.5 px-6
              transition-all duration-300 cursor-pointer rounded-xl
              ${isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/70 hover:bg-muted/20'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-bg"
                className="absolute inset-0 rounded-xl border border-primary/20 kiosk-shadow-glow"
                style={{ background: 'hsl(var(--primary) / 0.06)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative z-10 w-8 h-8 rounded-lg flex items-center justify-center"
              style={isActive ? { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' } : {}}
            >
              <Icon size={15} className={isActive ? 'text-primary-foreground' : 'text-muted-foreground/50'} />
            </div>
            <div className="relative z-10 flex flex-col items-start">
              <span className={`text-sm font-semibold leading-tight ${isActive ? 'text-foreground' : ''}`}>
                {tab.label}
              </span>
              <span className="text-[10px] text-muted-foreground/50 leading-tight mt-0.5">
                {tab.subtitle}
              </span>
            </div>
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};

export default KioskTabs;
