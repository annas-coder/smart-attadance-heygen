import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import { Home, MessageCircle, Mic, X, Mail, Hash, ArrowRight, Scan, User, MapPin, Calendar, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { kiosk } from "../../../lib/api";
import * as heygenService from "../../../lib/heygenService";
import * as voiceService from "../../../lib/voiceService";
import { fetchGeneralChatResponse, fetchUserChatResponse } from "../../../lib/kioskChat";
import { useChromaKey } from "../../hooks/useChromaKey";
const aiAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2322D3EE'/%3E%3Cstop offset='100%25' stop-color='%238B5CF6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23g)'/%3E%3Ctext x='100' y='115' text-anchor='middle' font-size='64' fill='white' font-family='sans-serif'%3EAI%3C/text%3E%3C/svg%3E";

const DEMO_PEOPLE = [
  { id: "EMP001", nm: "Arun Krishnan", dg: "Sr. Software Engineer", dp: "Engineering", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", ev: "Tech Summit 2026", et: "10 AM–4 PM", hl: "Hall A — Auditorium", fl: "Ground Floor", st: "A-142" },
  { id: "EMP024", nm: "Sarah Mitchell", dg: "Product Manager", dp: "Product", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face", ev: "Q1 Strategy Review", et: "9:30 AM–12 PM", hl: "Hall C — Board Room", fl: "3rd Floor", st: "C-08" },
  { id: "VIS-087", nm: "Ravi Menon", dg: "Visitor · Client", dp: "TechNova Inc.", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face", ev: "Partnership Discussion", et: "11 AM–1 PM", hl: "Hall B — Conf Room 3", fl: "2nd Floor", st: "B3-22" },
  { id: "EMP042", nm: "Priya Sharma", dg: "Engineering Director", dp: "Engineering", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face", ev: "Tech Summit 2026", et: "10 AM–4 PM", hl: "Hall A — Auditorium", fl: "Ground Floor", st: "A-001" },
  { id: "EMP055", nm: "James Wong", dg: "VP of Product", dp: "Product", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face", ev: "Q1 Strategy Review", et: "9:30 AM–12 PM", hl: "Hall C — Board Room", fl: "3rd Floor", st: "C-01" },
  { id: "EMP061", nm: "Anita Desai", dg: "UX Design Lead", dp: "Design", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face", ev: "Design Sprint", et: "2 PM–5 PM", hl: "Hall D — Design Lab", fl: "1st Floor", st: "D-12" },
  { id: "EMP078", nm: "David Chen", dg: "Data Scientist", dp: "Analytics", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face", ev: "Tech Summit 2026", et: "10 AM–4 PM", hl: "Hall A — Auditorium", fl: "Ground Floor", st: "A-088" },
  { id: "EMP090", nm: "Fatima Al-Said", dg: "Security Architect", dp: "InfoSec", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face", ev: "Security Briefing", et: "8:30–10 AM", hl: "Hall E — Secure Room", fl: "Basement B1", st: "E-05" },
  { id: "INT-003", nm: "Tom Baker", dg: "Summer Intern", dp: "Engineering", photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face", ev: "Tech Summit 2026", et: "10 AM–4 PM", hl: "Hall A — Auditorium", fl: "Ground Floor", st: "A-200" },
  { id: "VIS-102", nm: "Lisa Park", dg: "Keynote Speaker", dp: "External · AI Labs", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face", ev: "Tech Summit 2026", et: "10 AM–4 PM", hl: "Hall A — Auditorium", fl: "Ground Floor", st: "STAGE" },
];

type KioskState = "menu" | "face-scanning" | "manual-checkin" | "chat" | "welcome";

interface UserData {
  fullName: string;
  designation: string;
  company: string;
  email: string;
  registrationId: string;
  faceImage?: string;
  agenda?: {
    currentSession?: {
      title: string;
      location: string;
      time: string;
    };
  };
}

interface ConversationMessage {
  type: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export function KioskMain() {
  const [state, setState] = useState<KioskState>("menu");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [manualInput, setManualInput] = useState("");
  const [manualMethod, setManualMethod] = useState<"email" | "id">("email");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [welcomeConversation, setWelcomeConversation] = useState<ConversationMessage[]>([]);
  
  const [heygenActive, setHeygenActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const heygenVideoRef = useRef<HTMLVideoElement>(null);
  const chromaCanvasRef = useChromaKey(heygenVideoRef, heygenActive);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-start camera when in face scanning mode
  useEffect(() => {
    if (state === "face-scanning") {
      startCamera();
      setTimeout(() => handleFaceScan(), 500);
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [state]);

  // Start/stop HeyGen session when entering/leaving chat or welcome states
  useEffect(() => {
    const shouldConnect = (state === "chat" || state === "welcome") && heygenService.heygenReady() && heygenVideoRef.current;

    if (shouldConnect) {
      const customWelcome = state === "welcome" && userData
        ? `Welcome ${userData.fullName.split(" ")[0]}! I'm your AI assistant for FutureFin Expo 2026. Your check-in is complete and you're all set for today's sessions.`
        : undefined;

      heygenService.startSession(
        heygenVideoRef.current!,
        () => setHeygenActive(true),
        () => setHeygenActive(false),
        () => {},
        () => { heygenService.closeSession().catch(() => {}); setHeygenActive(false); },
        customWelcome,
      ).catch(console.error);
    }

    return () => {
      if (shouldConnect) {
        heygenService.closeSession().catch(() => {});
        setHeygenActive(false);
      }
    };
  }, [state]);

  // Auto-start welcome conversation when user checks in
  useEffect(() => {
    if (state === "welcome" && userData && welcomeConversation.length === 0) {
      const greeting = `Welcome ${userData.fullName.split(" ")[0]}! I'm your AI assistant for FutureFin Expo 2026. Your check-in is complete and you're all set for today's sessions.`;
      setIsSpeaking(true);
      setWelcomeConversation([{ type: "assistant", text: greeting, timestamp: new Date() }]);
      heygenService.sendTextToAvatar(greeting);

      const fetchFollowUp = async () => {
        try {
          const followUp = await fetchUserChatResponse(
            `I just checked in. My next session is "${userData.agenda?.currentSession?.title}" at ${userData.agenda?.currentSession?.location}. Give me a brief welcome and tell me about my next session.`,
            userData.fullName,
          );
          setWelcomeConversation(prev => [...prev, { type: "assistant", text: followUp, timestamp: new Date() }]);
          heygenService.sendTextToAvatar(followUp);
        } catch {
          const fallback = `Your next session "${userData.agenda?.currentSession?.title}" is happening now at ${userData.agenda?.currentSession?.location}. Would you like directions or have any questions?`;
          setWelcomeConversation(prev => [...prev, { type: "assistant", text: fallback, timestamp: new Date() }]);
          heygenService.sendTextToAvatar(fallback);
        } finally {
          setIsSpeaking(false);
        }
      };
      fetchFollowUp();
    }
  }, [state, userData]);

  const sendGeneralMessage = useCallback(async (message: string) => {
    heygenService.interruptAvatar();
    setConversation(prev => [...prev, { type: "user", text: message, timestamp: new Date() }]);
    setIsSpeaking(true);
    try {
      const response = await fetchGeneralChatResponse(message);
      setConversation(prev => [...prev, { type: "assistant", text: response, timestamp: new Date() }]);
      heygenService.sendTextToAvatar(response);
    } catch {
      const fallback = "I'm sorry, I couldn't process that request right now. Please try again.";
      setConversation(prev => [...prev, { type: "assistant", text: fallback, timestamp: new Date() }]);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const sendWelcomeMessage = useCallback(async (message: string) => {
    heygenService.interruptAvatar();
    setWelcomeConversation(prev => [...prev, { type: "user", text: message, timestamp: new Date() }]);
    setIsSpeaking(true);
    try {
      const response = await fetchUserChatResponse(message, userData?.fullName || "Guest");
      setWelcomeConversation(prev => [...prev, { type: "assistant", text: response, timestamp: new Date() }]);
      heygenService.sendTextToAvatar(response);
    } catch {
      const fallback = "I'm sorry, I couldn't process that request right now. Please try again.";
      setWelcomeConversation(prev => [...prev, { type: "assistant", text: fallback, timestamp: new Date() }]);
    } finally {
      setIsSpeaking(false);
    }
  }, [userData]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1920, height: 1080 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.log("Camera not available");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleFaceScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          recognizeUser();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const recognizeUser = async () => {
    const storedData = sessionStorage.getItem("registrationData");
    const storedImage = sessionStorage.getItem("faceImage");

    let data;
    if (storedData) {
      data = JSON.parse(storedData);
      try {
        const result = await kiosk.lookup(data.email, "email");
        const g = result.guest;
        try { await kiosk.checkin(g._id); } catch { /* 409 = already checked in, proceed */ }
        const user: UserData = {
          fullName: g.fullName,
          designation: g.designation || data.designation,
          company: g.company || data.company,
          email: g.email,
          registrationId: g.registrationId || "FF2026-SCAN",
          faceImage: undefined,
          agenda: {
            currentSession: g.agenda?.sessions?.[0] || {
              title: "Keynote: Future of Financial Technology",
              location: "Grand Ballroom, Floor 2",
              time: "2:00 PM - 3:00 PM",
            },
          },
        };
        setUserData(user);
        setState("welcome");
        return;
      } catch (err) {
        console.error("Kiosk lookup failed:", err);
      }
    }

    const person = DEMO_PEOPLE[Math.floor(Math.random() * DEMO_PEOPLE.length)];
    const user: UserData = {
      fullName: person.nm,
      designation: person.dg,
      company: person.dp,
      email: `${person.nm.toLowerCase().replace(/\s+/g, ".")}@demo.com`,
      faceImage: undefined,
      registrationId: person.id,
      agenda: {
        currentSession: {
          title: person.ev,
          location: `${person.hl}, ${person.fl}`,
          time: person.et,
        },
      },
    };
    setUserData(user);
    setState("welcome");
  };

  const processManualCheckIn = async () => {
    if (!manualInput.trim()) return;

    try {
      const result = await kiosk.lookup(manualInput, manualMethod === "email" ? "email" : "id");
      const g = result.guest;
      try { await kiosk.checkin(g._id); } catch { /* 409 = already checked in, proceed */ }

      const user: UserData = {
        fullName: g.fullName,
        designation: g.designation || "",
        company: g.company || "",
        email: g.email,
        registrationId: g.registrationId || "FF2026-MANUAL",
        faceImage: undefined,
        agenda: {
          currentSession: g.agenda?.sessions?.[0] || {
            title: "Keynote: Future of Financial Technology",
            location: "Grand Ballroom, Floor 2",
            time: "2:00 PM - 3:00 PM",
          },
        },
      };

      setUserData(user);
      setState("welcome");
      setManualInput("");
    } catch {
      const input = manualInput.trim().toLowerCase();
      const person = DEMO_PEOPLE.find(p =>
        p.id.toLowerCase() === input ||
        `${p.nm.toLowerCase().replace(/\s+/g, ".")}@demo.com` === input
      ) || DEMO_PEOPLE[Math.floor(Math.random() * DEMO_PEOPLE.length)];

      const user: UserData = {
        fullName: person.nm,
        designation: person.dg,
        company: person.dp,
        email: `${person.nm.toLowerCase().replace(/\s+/g, ".")}@demo.com`,
        faceImage: undefined,
        registrationId: person.id,
        agenda: {
          currentSession: {
            title: person.ev,
            location: `${person.hl}, ${person.fl}`,
            time: person.et,
          },
        },
      };

      setUserData(user);
      setState("welcome");
      setManualInput("");
    }
  };

  const handleReset = useCallback(() => {
    try { voiceService.stopListening(); } catch {}
    heygenService.closeSession().catch(() => {});
    setHeygenActive(false);
    setIsSpeaking(false);
    setIsListening(false);
    setVoiceTranscript("");
    setConversation([]);
    setCurrentResponse("");
    setWelcomeConversation([]);
    setUserData(null);
    setManualInput("");
    setScanProgress(0);
    setIsScanning(false);
    setState("menu");
  }, []);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1e] to-[#16213e] text-white font-['Plus_Jakarta_Sans'] relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#22D3EE] rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8B5CF6] rounded-full blur-[150px]"></div>
      </div>

      {/* Header - Compact */}
      <div className="absolute top-0 left-0 right-0 z-20 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/60 hover:text-white transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
                FutureFin Expo 2026
              </h1>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm font-bold text-white">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Hidden HeyGen video element (always in DOM for stable stream) */}
      <video ref={heygenVideoRef} autoPlay playsInline className="hidden" />

      <AnimatePresence mode="wait">
        {/* ==================== MENU ==================== */}
        {state === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full flex flex-col items-center justify-center px-6 pt-16 pb-6"
          >
            <div className="w-full max-w-4xl flex flex-col h-full justify-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
                  Welcome!
                </h1>
                <p className="text-xl text-white/80 font-medium">
                  How would you like to proceed?
                </p>
              </motion.div>

              <div className="grid grid-cols-3 gap-6">
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => setState("face-scanning")}
                  className="group bg-white/5 backdrop-blur-xl border-2 border-[#22D3EE]/30 hover:border-[#22D3EE] rounded-[20px] p-6 transition-all hover:bg-white/10"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#22D3EE]/20 to-[#8B5CF6]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Scan className="w-10 h-10 text-[#22D3EE]" />
                    </div>
                    <h3 className="text-xl font-black mb-2">Face Recognition</h3>
                    <p className="text-sm text-white/60 font-medium">Quick & secure check-in</p>
                  </div>
                </motion.button>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setState("manual-checkin")}
                  className="group bg-white/5 backdrop-blur-xl border-2 border-[#8B5CF6]/30 hover:border-[#8B5CF6] rounded-[20px] p-6 transition-all hover:bg-white/10"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#22D3EE]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <User className="w-10 h-10 text-[#8B5CF6]" />
                    </div>
                    <h3 className="text-xl font-black mb-2">Manual Check-In</h3>
                    <p className="text-sm text-white/60 font-medium">Enter credentials</p>
                  </div>
                </motion.button>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => setState("chat")}
                  className="group bg-white/5 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 rounded-[20px] p-6 transition-all hover:bg-white/10"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-black mb-2">Chat Assistant</h3>
                    <p className="text-sm text-white/60 font-medium">Ask any queries</p>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== FACE SCANNING ==================== */}
        {state === "face-scanning" && (
          <motion.div
            key="face-scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full flex flex-col items-center justify-center px-6 pt-16 pb-6"
          >
            <div className="w-full max-w-3xl h-full flex flex-col justify-center">
              <div className="relative rounded-[24px] overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.3)] border border-white/10 flex-1 max-h-[calc(100vh-180px)]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>

                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `
                          linear-gradient(0deg, transparent 24%, rgba(34, 211, 238, 0.1) 25%, rgba(34, 211, 238, 0.1) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, 0.1) 75%, rgba(34, 211, 238, 0.1) 76%, transparent 77%, transparent),
                          linear-gradient(90deg, transparent 24%, rgba(34, 211, 238, 0.1) 25%, rgba(34, 211, 238, 0.1) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, 0.1) 75%, rgba(34, 211, 238, 0.1) 76%, transparent 77%, transparent)
                        `,
                        backgroundSize: '50px 50px'
                      }}
                    />
                    <motion.div
                      animate={{ y: ['-50%', '150%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                    />
                    <div className="w-64 h-80 border-2 border-[#22D3EE] rounded-[20px] relative">
                      <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-[#22D3EE] rounded-tl-[20px]"></div>
                      <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-[#22D3EE] rounded-tr-[20px]"></div>
                      <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-[#22D3EE] rounded-bl-[20px]"></div>
                      <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-[#22D3EE] rounded-br-[20px]"></div>
                    </div>
                  </div>
                )}

                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-3 py-2 rounded-full border border-white/10">
                    <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-[#22D3EE] animate-pulse' : 'bg-[#34D399]'}`}></div>
                    <span className="text-xs font-bold">{isScanning ? `Scanning ${scanProgress}%` : 'Ready'}</span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-2xl font-black text-center mb-2 drop-shadow-lg">
                    {isScanning ? 'Identifying...' : 'Position Your Face'}
                  </h2>
                  <p className="text-base text-white/90 text-center font-medium drop-shadow-md">
                    {isScanning ? 'Please hold still' : 'Look at the camera'}
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-sm font-bold hover:bg-white/20 transition-all"
                >
                  ← Back to Menu
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== MANUAL CHECK-IN ==================== */}
        {state === "manual-checkin" && (
          <motion.div
            key="manual-checkin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full flex flex-col items-center justify-center px-6 pt-16 pb-6"
          >
            <div className="w-full max-w-xl">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-8">
                <h2 className="text-3xl font-black text-center mb-4 bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
                  Manual Check-In
                </h2>
                <p className="text-base text-white/80 text-center mb-6">Enter your credentials</p>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setManualMethod("email")}
                    className={`flex-1 px-4 py-3 rounded-[12px] font-bold flex items-center justify-center gap-2 border-2 transition-all ${
                      manualMethod === "email"
                        ? "bg-[#22D3EE] border-[#22D3EE] text-white"
                        : "bg-white/5 border-white/20 hover:border-[#22D3EE]"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    EMAIL
                  </button>
                  <button
                    onClick={() => setManualMethod("id")}
                    className={`flex-1 px-4 py-3 rounded-[12px] font-bold flex items-center justify-center gap-2 border-2 transition-all ${
                      manualMethod === "id"
                        ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                        : "bg-white/5 border-white/20 hover:border-[#8B5CF6]"
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    ID
                  </button>
                </div>

                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && processManualCheckIn()}
                  placeholder={manualMethod === "email" ? "Enter your email" : "Enter ID (FF2026-XXXXX)"}
                  className="w-full px-4 py-3 rounded-[12px] bg-white/5 border-2 border-white/10 focus:border-[#22D3EE] focus:outline-none text-white placeholder-white/40 mb-4"
                />

                <button
                  onClick={processManualCheckIn}
                  disabled={!manualInput.trim()}
                  className="w-full px-6 py-3 rounded-[12px] bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] font-black flex items-center justify-center gap-2 disabled:opacity-50 mb-3"
                >
                  CHECK IN
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-[10px] text-sm font-bold hover:bg-white/10 transition-all"
                >
                  ← Back
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== CHAT ==================== */}
        {state === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full flex items-center justify-center pt-12 pb-4"
          >
            <div className="w-full h-full max-w-5xl grid grid-cols-2 gap-8 px-8">
              
              {/* LEFT: Avatar Display - Cinematic */}
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="relative w-full"
                >
                  {/* Avatar Frame with Dynamic Border */}
                  <motion.div 
                    className="relative w-full aspect-[3/4] rounded-[40px] overflow-hidden border-4"
                    animate={{
                      borderColor: isSpeaking 
                        ? ["rgba(34, 211, 238, 0.5)", "rgba(34, 211, 238, 1)", "rgba(34, 211, 238, 0.5)"]
                        : isListening
                        ? ["rgba(139, 92, 246, 0.5)", "rgba(139, 92, 246, 1)", "rgba(139, 92, 246, 0.5)"]
                        : "rgba(255, 255, 255, 0.1)",
                      boxShadow: isSpeaking
                        ? ["0 0 40px rgba(34, 211, 238, 0.3)", "0 0 80px rgba(34, 211, 238, 0.6)", "0 0 40px rgba(34, 211, 238, 0.3)"]
                        : isListening
                        ? ["0 0 40px rgba(139, 92, 246, 0.3)", "0 0 80px rgba(139, 92, 246, 0.6)", "0 0 40px rgba(139, 92, 246, 0.3)"]
                        : "0 0 20px rgba(255, 255, 255, 0.1)"
                    }}
                    transition={{
                      duration: isSpeaking || isListening ? 1.5 : 0.3,
                      repeat: isSpeaking || isListening ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    {heygenActive ? (
                      <canvas ref={chromaCanvasRef} className="w-full h-full object-cover object-top" />
                    ) : (
                      <img
                        src={aiAvatar}
                        alt="AI Assistant"
                        className="w-full h-full object-cover object-top"
                      />
                    )}
                    
                    {/* Dynamic Gradient Overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50"
                      animate={{
                        opacity: isSpeaking ? [0.8, 1, 0.8] : 1
                      }}
                      transition={{
                        duration: 2,
                        repeat: isSpeaking ? Infinity : 0
                      }}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-6 right-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 bg-black/80 backdrop-blur-xl px-4 py-2.5 rounded-full border shadow-lg"
                        style={{
                          borderColor: isSpeaking ? "#22D3EE" : isListening ? "#8B5CF6" : "rgba(52, 211, 153, 0.5)"
                        }}
                      >
                        <motion.div
                          animate={{ 
                            scale: isSpeaking || isListening ? [1, 1.3, 1] : 1,
                            backgroundColor: isSpeaking ? "#22D3EE" : isListening ? "#8B5CF6" : "#34D399"
                          }}
                          transition={{ duration: 1, repeat: isSpeaking || isListening ? Infinity : 0 }}
                          className="w-2.5 h-2.5 rounded-full"
                        />
                        <span className="text-xs font-black text-white tracking-wider">
                          {isSpeaking ? "SPEAKING" : isListening ? "LISTENING" : "READY"}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Sound Wave Visualization - Dynamic */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-2 h-12">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: isSpeaking 
                            ? ["20%", "100%", "20%"]
                            : isListening
                            ? ["15%", "60%", "15%"]
                            : ["20%", "40%", "20%"],
                          backgroundColor: isSpeaking
                            ? ["#22D3EE", "#8B5CF6", "#22D3EE"]
                            : isListening
                            ? ["#8B5CF6", "#22D3EE", "#8B5CF6"]
                            : ["#22D3EE", "#22D3EE", "#22D3EE"]
                        }}
                        transition={{
                          duration: isSpeaking ? 0.6 : isListening ? 0.8 : 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                        className="w-2 rounded-full"
                        style={{
                          filter: `drop-shadow(0 0 ${isSpeaking ? 8 : isListening ? 6 : 4}px currentColor)`
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Avatar Name & Status */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mt-12"
                >
                  <h2 className="text-2xl font-black bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent mb-1">
                    AI Assistant
                  </h2>
                  <p className="text-white/50 text-sm font-medium">Your Event Companion</p>
                </motion.div>
              </div>

              {/* RIGHT: Conversation & Controls */}
              <div className="flex flex-col h-full py-4 overflow-hidden">
                
                {/* Conversation Display */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 min-h-0 mb-6 rounded-[32px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl p-6 overflow-hidden flex flex-col relative z-0"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <h3 className="text-sm font-black text-white/70 uppercase tracking-wider">Conversation</h3>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-[#22D3EE]' : isListening ? 'bg-[#8B5CF6]' : 'bg-white/30'}`}></div>
                      <span className="text-xs font-mono text-white/50">
                        {conversation.length} {conversation.length === 1 ? 'message' : 'messages'}
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {conversation.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#22D3EE]/20 to-[#8B5CF6]/20 flex items-center justify-center mb-4">
                          <MessageCircle className="w-8 h-8 text-white/40" />
                        </div>
                        <p className="text-white/60 text-sm font-medium mb-2">Start a conversation</p>
                        <p className="text-white/40 text-xs">Tap the microphone to speak</p>
                      </div>
                    ) : (
                      conversation.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] rounded-[20px] px-4 py-3 ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white'
                              : 'bg-white/10 border border-white/20 text-white/90'
                          }`}>
                            <div className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                            <p className="text-[10px] mt-1 opacity-60">
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      ))
                    )}

                    {/* Typing Indicator */}
                    {isSpeaking && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white/10 border border-white/20 rounded-[20px] px-4 py-3">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                className="w-2 h-2 rounded-full bg-[#22D3EE]"
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Quick Suggestions */}
                <div className="mb-4 flex-shrink-0 relative z-30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Quick Ask</p>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Calendar, label: "Event Schedule" },
                      { icon: MapPin, label: "Venue Map" },
                      { icon: User, label: "Speakers" },
                      { icon: Navigation, label: "WiFi Details" }
                    ].map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendGeneralMessage(item.label)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/20 rounded-[14px] text-xs font-bold text-white/80 hover:bg-white/10 hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control Buttons */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 flex-shrink-0 relative z-20"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (isListening) {
                        const finalText = voiceService.stopListening();
                        setIsListening(false);
                        setVoiceTranscript("");
                        if (finalText.trim()) {
                          sendGeneralMessage(finalText.trim());
                        }
                      } else {
                        setIsListening(true);
                        setVoiceTranscript("");
                        voiceService.startListening({
                          onPartial: (text) => setVoiceTranscript(text),
                          onCommitted: (text) => {
                            setVoiceTranscript("");
                            voiceService.stopListening();
                            setIsListening(false);
                            if (text.trim()) {
                              sendGeneralMessage(text.trim());
                            }
                          },
                          onError: () => { setIsListening(false); setVoiceTranscript(""); },
                          onStateChange: (listening) => setIsListening(listening),
                        });
                      }
                    }}
                    className="flex-1 h-16 rounded-[20px] bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center gap-3 font-black text-white shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] transition-all relative overflow-hidden"
                  >
                    {isListening && (
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <Mic className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} />
                    <span className="relative z-10">{isListening ? "LISTENING..." : "TAP TO SPEAK"}</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#DC2626] to-[#B91C1C] border-2 border-white/10 flex items-center justify-center hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== WELCOME - AVATAR INTERFACE ==================== */}
        {state === "welcome" && userData && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full flex items-center justify-center pt-12 pb-4"
          >
            <div className="w-full h-full max-w-5xl grid grid-cols-2 gap-8 px-8">
              
              {/* LEFT: Avatar Display - Cinematic */}
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="relative w-full"
                >
                  {/* Avatar Frame with Success Glow */}
                  <motion.div 
                    className="relative w-full aspect-[3/4] rounded-[40px] overflow-hidden border-4"
                    animate={{
                      borderColor: ["rgba(52, 211, 153, 0.5)", "rgba(52, 211, 153, 1)", "rgba(52, 211, 153, 0.5)"],
                      boxShadow: ["0 0 40px rgba(52, 211, 153, 0.3)", "0 0 80px rgba(52, 211, 153, 0.6)", "0 0 40px rgba(52, 211, 153, 0.3)"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {heygenActive ? (
                      <canvas ref={chromaCanvasRef} className="w-full h-full object-cover object-top" />
                    ) : (
                      <img
                        src={aiAvatar}
                        alt="AI Assistant"
                        className="w-full h-full object-cover object-top"
                      />
                    )}
                    
                    {/* Dynamic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />
                    
                    {/* Success Badge */}
                    <div className="absolute top-6 right-6">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="flex items-center gap-2 bg-black/80 backdrop-blur-xl px-4 py-2.5 rounded-full border border-[#34D399] shadow-lg"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2.5 h-2.5 rounded-full bg-[#34D399]"
                        />
                        <span className="text-xs font-black text-[#34D399] tracking-wider">CHECKED IN</span>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Sound Wave Visualization - Success Theme */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-end gap-2 h-12">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: ["20%", "70%", "20%"],
                          backgroundColor: ["#34D399", "#22D3EE", "#34D399"]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                        className="w-2 rounded-full"
                        style={{
                          filter: "drop-shadow(0 0 6px currentColor)"
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* User Info */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mt-12"
                >
                  <h2 className="text-2xl font-black bg-gradient-to-r from-[#34D399] to-[#22D3EE] bg-clip-text text-transparent mb-1">
                    Your AI Assistant
                  </h2>
                  <p className="text-white/60 text-sm font-medium">
                    Here to guide your event experience
                  </p>
                </motion.div>
              </div>

              {/* RIGHT: Conversation & Controls */}
              <div className="flex flex-col py-4 h-full overflow-hidden">
                
                {/* Greeting Header */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 flex-shrink-0"
                >
                  <h3 className="text-3xl font-black bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent mb-1">
                    {(() => {
                      const hour = new Date().getHours();
                      return hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
                    })()}, {userData.fullName.split(" ")[0]}!
                  </h3>
                  <p className="text-white/50 text-xs font-medium">
                    Welcome to FutureFin Expo 2026 • Check-in successful
                  </p>
                </motion.div>

                {/* Conversation Panel */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1 min-h-0 mb-4 rounded-[32px] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl overflow-hidden flex flex-col relative z-0"
                >
                  {/* Conversation Header */}
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></div>
                      <h4 className="text-sm font-black text-white/70 uppercase tracking-wider">Live Conversation</h4>
                    </div>
                    <span className="text-xs font-mono text-white/50">
                      {welcomeConversation.length} {welcomeConversation.length === 1 ? 'message' : 'messages'}
                    </span>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                    {welcomeConversation.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.3 }}
                        className="flex justify-start"
                      >
                        <div className={`max-w-[85%] rounded-[24px] px-5 py-3.5 backdrop-blur-sm ${
                          msg.type === 'user'
                            ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white'
                            : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20'
                        }`}>
                          <div className="text-sm leading-relaxed text-white/90 mb-2 prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                          <p className="text-[10px] text-white/40 font-mono">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {isSpeaking && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm rounded-[24px] px-5 py-3.5">
                          <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                className="w-2 h-2 rounded-full bg-[#34D399]"
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Empty State */}
                    {welcomeConversation.length === 0 && !isSpeaking && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#34D399]/20 to-[#22D3EE]/20 border border-white/10 flex items-center justify-center mb-4">
                          <Mic className="w-7 h-7 text-[#34D399]" />
                        </div>
                        <p className="text-white/60 text-sm font-medium mb-1">AI Assistant is ready</p>
                        <p className="text-white/40 text-xs">Tap to speak below to start the conversation</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Quick Suggestions */}
                <div className="mb-4 flex-shrink-0 relative z-30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Quick Ask</p>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Navigation, label: "Where is my hall?" },
                      { icon: Calendar, label: "My event schedule" },
                      { icon: MapPin, label: "Where do I find parking?" },
                      { icon: User, label: "WiFi Details" }
                    ].map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sendWelcomeMessage(item.label)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/20 rounded-[14px] text-xs font-bold text-white/80 hover:bg-white/10 hover:scale-[1.02] transition-all cursor-pointer"
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control Buttons */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 flex-shrink-0 relative z-20"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (isSpeaking) return;
                      if (isListening) {
                        const finalText = voiceService.stopListening();
                        setIsListening(false);
                        setVoiceTranscript("");
                        if (finalText.trim()) {
                          sendWelcomeMessage(finalText.trim());
                        }
                      } else {
                        setIsListening(true);
                        setVoiceTranscript("");
                        voiceService.startListening({
                          onPartial: (text) => setVoiceTranscript(text),
                          onCommitted: (text) => {
                            setVoiceTranscript("");
                            voiceService.stopListening();
                            setIsListening(false);
                            if (text.trim()) {
                              sendWelcomeMessage(text.trim());
                            }
                          },
                          onError: () => { setIsListening(false); setVoiceTranscript(""); },
                          onStateChange: (listening) => setIsListening(listening),
                        });
                      }
                    }}
                    disabled={isSpeaking}
                    className="flex-1 h-16 rounded-[20px] bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center gap-3 font-black text-white shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] transition-all relative overflow-hidden disabled:opacity-70"
                  >
                    {isListening && (
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <Mic className={`w-6 h-6 relative z-10 ${isListening ? 'animate-pulse' : ''}`} />
                    <span className="relative z-10">
                      {isListening ? "LISTENING..." : isSpeaking ? "SPEAKING..." : "TAP TO SPEAK"}
                    </span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#DC2626] to-[#B91C1C] border-2 border-white/10 flex items-center justify-center hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="absolute bottom-1 left-0 right-0 text-center z-10 pointer-events-none">
        <p className="text-[10px] text-white/30 font-medium">
          Powered by <span className="text-[#22D3EE]">TechnoCIT</span> & <span className="text-[#8B5CF6]">NFS Technologies</span>
        </p>
      </div>
    </div>
  );
}