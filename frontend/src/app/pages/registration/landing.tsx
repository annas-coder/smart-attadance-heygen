import { Link } from "react-router";
import { Calendar, MapPin, Users, Award, Building2, TrendingUp, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { events } from "../../../lib/api";

function computeTimeLeft(targetDate: Date) {
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function RegistrationLanding() {
  const [eventData, setEventData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    events.listPublic().then((list) => {
      if (list.length > 0) {
        setEventData(list[0]);
        setTimeLeft(computeTimeLeft(new Date(list[0].date)));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!eventData?.date) return;
    const target = new Date(eventData.date);
    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [eventData?.date]);

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#0F172A]">
            <Home className="w-5 h-5" />
            <span className="font-bold">Home</span>
          </Link>
          <p className="text-sm text-[#64748B]">
            Already registered?{" "}
            <Link to="/view-ticket" className="text-[#22D3EE] font-medium hover:underline">
              View your ticket
            </Link>
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#0B0F1A] via-[#101728] to-[#151D32] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
            {eventData?.name ?? "FutureFin Expo 2026"}
          </h1>
          <p className="text-xl text-[#94A3B8] mb-8 max-w-2xl mx-auto">
            {eventData?.description ?? "The Future of Financial Technology • Innovation • Investment"}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Calendar className="w-5 h-5 text-[#22D3EE]" />
              <span>
                {eventData?.date
                  ? new Date(eventData.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : "TBA"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <MapPin className="w-5 h-5 text-[#8B5CF6]" />
              <span>{eventData?.location ?? "TBA"}</span>
            </div>
          </div>

          {/* Countdown */}
          <div className="mb-12">
            <p className="text-sm text-[#94A3B8] mb-4">EVENT STARTS IN</p>
            <div className="flex justify-center gap-4">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#151D32] border border-[#1E293B] rounded-[14px] p-4 min-w-[80px]"
                >
                  <div className="text-3xl font-bold font-mono text-white mb-1">
                    {item.value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-[#94A3B8] font-medium">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/register/profile"
            className="inline-block bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#22D3EE]/30"
          >
            Register Now
          </Link>
        </div>
      </div>

      {/* Highlights */}
      <div className="py-16 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#22D3EE]/20 to-[#8B5CF6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-[#22D3EE]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] mb-1">3,200+</div>
              <div className="text-sm text-[#64748B]">Attendees</div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#8B5CF6]/20 to-[#22D3EE]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] mb-1">40+</div>
              <div className="text-sm text-[#64748B]">Sessions</div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#34D399]/20 to-[#FBBF24]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-[#34D399]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] mb-1">150+</div>
              <div className="text-sm text-[#64748B]">Exhibitors</div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FBBF24]/20 to-[#FB7185]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-[#FBBF24]" />
              </div>
              <div className="text-2xl font-bold text-[#0F172A] mb-1">$500K</div>
              <div className="text-sm text-[#64748B]">Startup Prize</div>
            </div>
          </div>
        </div>
      </div>

      {/* Speaker Spotlight */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-2 text-center">
            Featured Speakers
          </h2>
          <p className="text-[#64748B] mb-12 text-center">
            Learn from industry leaders and innovators
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Lisa Park", title: "CEO, FinTech Innovations" },
              { name: "James Wong", title: "VP of Product, PayCo" },
              { name: "Priya Sharma", title: "Director, Tech Solutions" },
              { name: "David Chen", title: "Lead Data Scientist, AI Corp" },
            ].map((speaker, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E2E8F0] rounded-[14px] p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                  {speaker.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h3 className="font-bold text-[#0F172A] mb-1">{speaker.name}</h3>
                <p className="text-sm text-[#64748B]">{speaker.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0B0F1A] text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#94A3B8] text-sm mb-2">
            © 2026 FutureFin Expo. All rights reserved.
          </p>
          <p className="text-[#64748B] text-xs">
            Powered by <span className="text-[#22D3EE]">TechnoCIT</span> & <span className="text-[#8B5CF6]">NFS Technologies</span>
          </p>
        </div>
      </footer>
    </div>
  );
}