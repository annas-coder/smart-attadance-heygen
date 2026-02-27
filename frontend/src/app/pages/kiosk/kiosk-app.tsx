import { useState } from "react";
import { Link } from "react-router";
import { GenericAvatar } from "../../components/kiosk/generic-avatar";
import { PersonalizedAvatar } from "../../components/kiosk/personalized-avatar";
import { Home } from "lucide-react";

export function KioskApp() {
  const [activeTab, setActiveTab] = useState<"generic" | "personalized">("generic");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useState(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  });

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-['Plus_Jakarta_Sans']">
      {/* Header Bar */}
      <div className="border-b border-[#1E293B] bg-[#101728]">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[#94A3B8] hover:text-white">
              <Home className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
                FutureFin Expo 2026
              </h1>
              <p className="text-xs text-[#94A3B8] font-mono">KIOSK STATION</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></div>
              <span className="text-sm text-[#94A3B8]">Online</span>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-xs text-[#94A3B8]">
                {currentTime.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-[#1E293B] bg-[#0B0F1A]">
        <div className="container mx-auto px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("generic")}
              className={`py-4 px-6 font-medium transition-colors relative ${
                activeTab === "generic"
                  ? "text-[#22D3EE]"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Generic Avatar
              {activeTab === "generic" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22D3EE]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("personalized")}
              className={`py-4 px-6 font-medium transition-colors relative ${
                activeTab === "personalized"
                  ? "text-[#22D3EE]"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              Personalised Avatar
              {activeTab === "personalized" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22D3EE]"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 py-12">
        {activeTab === "generic" ? <GenericAvatar /> : <PersonalizedAvatar />}
      </div>
    </div>
  );
}
