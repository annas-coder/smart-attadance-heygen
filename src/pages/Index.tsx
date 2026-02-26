import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import KioskHeader from '@/components/kiosk/KioskHeader';
import KioskTabs from '@/components/kiosk/KioskTabs';
import GenericSection from '@/components/kiosk/GenericSection';
import PersonalisedSection from '@/components/kiosk/PersonalisedSection';
import { closeSession, isSessionActive } from '@/lib/heygenService';

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = useCallback((tab: number) => {
    if (isSessionActive()) {
      closeSession();
    }
    setActiveTab(tab);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background relative">
      <div className="animated-gradient-bar flex-shrink-0 relative z-20" />

      {/* Ambient background layers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Primary teal orb */}
        <div
          className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full opacity-[0.12]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)), transparent 60%)',
            filter: 'blur(100px)',
            animation: 'mesh-drift 14s ease-in-out infinite',
          }}
        />
        {/* Violet orb */}
        <div
          className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full opacity-[0.08]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--secondary)), transparent 60%)',
            filter: 'blur(100px)',
            animation: 'mesh-drift 18s ease-in-out infinite reverse',
          }}
        />
        {/* Gold accent orb */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--gold)), transparent 60%)',
            filter: 'blur(120px)',
            animation: 'mesh-drift 20s ease-in-out infinite 4s',
          }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Dot field */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--primary) / 0.6) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="relative z-[1] flex-1 min-h-0 flex flex-col">
        <KioskHeader />
        <KioskTabs activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="generic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <GenericSection />
              </motion.div>
            )}
            {activeTab === 1 && (
              <motion.div
                key="personalised"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <PersonalisedSection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Branding watermark */}
        <div className="fixed bottom-3 left-4 z-30 flex items-center gap-3 px-5 py-2.5 rounded-2xl glass-card kiosk-shadow">
          <img src="/images/tcit_logo.svg" alt="Technocit" className="h-[16px] w-auto opacity-60" />
          <span className="text-muted-foreground/40 font-semibold text-[10px]">x</span>
          <img src="/images/nfs_logo.jpg" alt="NFS Technologies" className="h-[16px] w-auto rounded-sm opacity-60" />
        </div>
      </div>
    </div>
  );
};

export default Index;
