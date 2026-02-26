import { MessageCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface KioskTabsProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
}

const tabs = [
  { icon: MessageCircle, label: 'Generic Avatar' },
  { icon: User, label: 'Personalised Avatar' },
];

const KioskTabs = ({ activeTab, onTabChange }: KioskTabsProps) => {
  return (
    <nav className="flex gap-2 border-b border-border/30 flex-shrink-0 glass px-6 py-2">
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = activeTab === i;
        return (
          <button
            key={i}
            onClick={() => onTabChange(i)}
            className={`
              relative flex items-center justify-center gap-2.5 py-2.5 px-6
              transition-all duration-300 cursor-pointer rounded-xl
              font-semibold text-sm
              ${isActive
                ? 'text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground/70 hover:bg-muted/40'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-bg"
                className="absolute inset-0 rounded-xl gradient-border kiosk-shadow-glow"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className={`relative z-10 p-1 rounded-lg transition-all duration-300`}>
              <Icon size={16} className={`transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`} />
            </div>
            <span className="relative z-10">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default KioskTabs;
