import { useState, useCallback } from 'react';
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
      {/* Animated gradient bar at top */}
      <div className="animated-gradient-bar flex-shrink-0 relative z-20" />

      {/* Ambient animated background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Mesh blob 1 */}
        <div
          className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.12), transparent 60%)',
            filter: 'blur(80px)',
            animation: 'mesh-drift 12s ease-in-out infinite',
          }}
        />
        {/* Mesh blob 2 */}
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, hsl(var(--secondary) / 0.1), transparent 60%)',
            filter: 'blur(80px)',
            animation: 'mesh-drift 15s ease-in-out infinite reverse',
          }}
        />
        {/* Mesh blob 3 - center accent */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(var(--success) / 0.08), transparent 60%)',
            filter: 'blur(100px)',
            animation: 'mesh-drift 18s ease-in-out infinite 3s',
          }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Floating dots */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-[1] h-screen flex flex-col">
        <KioskHeader />
        <KioskTabs activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 0 && <GenericSection />}
          {activeTab === 1 && <PersonalisedSection />}
        </div>
        {/* Branding watermark */}
        <div className="fixed bottom-3 left-4 z-30 flex items-center gap-2.5 px-5 py-2 rounded-full bg-card/90 border border-border/40 backdrop-blur-md kiosk-shadow">
          <img src="/images/tcit_logo.svg" alt="Technocit" className="h-[18px] w-auto" />
          <span className="text-muted-foreground/30 font-light text-sm">×</span>
          <img src="/images/nfs_logo.jpg" alt="NFS Technologies" className="h-[18px] w-auto rounded-sm" />
        </div>
      </div>
    </div>
  );
};

export default Index;
