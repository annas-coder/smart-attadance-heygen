import { Link } from "react-router";
import { UserCheck, Monitor } from "lucide-react";

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#101728] to-[#151D32] text-white font-['Plus_Jakarta_Sans']">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
            FutureFin Expo 2026
          </h1>
          <p className="text-xl text-[#94A3B8] font-mono font-bold">
            Event Registration & Kiosk Experience
          </p>
          <p className="text-[#94A3B8] mt-2">
            Grand Meridian Convention Center, Dubai • March 15, 2026
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            to="/register"
            className="group bg-[#151D32] border border-[#1E293B] rounded-[14px] p-8 hover:border-[#8B5CF6] transition-all duration-300 hover:shadow-lg hover:shadow-[#8B5CF6]/20 hover:-translate-y-1"
          >
            <div className="bg-gradient-to-br from-[#8B5CF6]/20 to-[#22D3EE]/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserCheck className="w-8 h-8 text-[#8B5CF6]" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Registration Portal</h2>
            <p className="text-[#94A3B8] mb-4">
              RSVP to the event, setup your profile, capture face photo, and get your digital ticket
            </p>
            <div className="flex items-center gap-2 text-sm text-[#22D3EE] font-medium">
              <span>Start Registration</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            to="/kiosk"
            className="group bg-[#151D32] border border-[#1E293B] rounded-[14px] p-8 hover:border-[#34D399] transition-all duration-300 hover:shadow-lg hover:shadow-[#34D399]/20 hover:-translate-y-1"
          >
            <div className="bg-gradient-to-br from-[#34D399]/20 to-[#FBBF24]/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Monitor className="w-8 h-8 text-[#34D399]" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Kiosk Application</h2>
            <p className="text-[#94A3B8] mb-4">
              On-site check-in with face recognition and AI avatar assistant for wayfinding
            </p>
            <div className="flex items-center gap-2 text-sm text-[#34D399] font-medium">
              <span>Launch Kiosk</span>
              <span>→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}