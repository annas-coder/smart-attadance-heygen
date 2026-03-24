import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Home, MessageCircle, Mic, X, Mail, Hash, ArrowRight, Scan, User, MapPin, Calendar, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { kiosk, events } from "../../../lib/api";
import * as heygenService from "../../../lib/heygenService";
import * as voiceService from "../../../lib/voiceService";
import { fetchGeneralChatResponse, fetchUserChatResponse, type UserProfile } from "../../../lib/kioskChat";
import { useChromaKey } from "../../hooks/useChromaKey";

/** HeyGen streaming avatar IDs — female uses default resolution chain when override omitted */
const MALE_AVATAR_HEYGEN_ID = "Graham_Black_Suit_public";
const MALE_VOICE_HEYGEN_ID = "61a4359785664d01a59664ceb87ce6d4";

type KioskVoiceLang = "en-US" | "ar";

function kioskChatWelcomeText(lang: KioskVoiceLang): string {
  if (lang === "ar") {
    return "مرحبًا بك في معرض فيوتشرفين 2026! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟";
  }
  return "Welcome to FutureFin Expo 2026! I'm your AI assistant. How can I help you today?";
}

function kioskWelcomeGreetingText(firstName: string, lang: KioskVoiceLang): string {
  if (lang === "ar") {
    return `مرحبًا ${firstName}! لقد تم تسجيل دخولك. كيف يمكنني مساعدتك؟`;
  }
  return `Hi ${firstName}! You're checked in. How can I help you?`;
}

function kioskTimeGreeting(lang: KioskVoiceLang): string {
  const hour = new Date().getHours();
  if (lang === "ar") {
    return hour < 12 ? "صباح الخير" : "مساء الخير";
  }
  return hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
}

const aiAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%2322D3EE'/%3E%3Cstop offset='100%25' stop-color='%238B5CF6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='200' height='200' fill='url(%23g)'/%3E%3Ctext x='100' y='115' text-anchor='middle' font-size='64' fill='white' font-family='sans-serif'%3EAI%3C/text%3E%3C/svg%3E";

function SmileyLoader() {
  const PARTICLES = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const radius = 130;
    return { x: 150 + Math.cos(angle) * radius, y: 150 + Math.sin(angle) * radius, delay: i * 0.25 };
  });

  const SPARKLES = [
    { x: 60, y: 40, size: 3, delay: 0 },
    { x: 240, y: 60, size: 2.5, delay: 0.8 },
    { x: 40, y: 200, size: 2, delay: 1.6 },
    { x: 250, y: 220, size: 3.5, delay: 0.4 },
    { x: 150, y: 20, size: 2, delay: 1.2 },
    { x: 270, y: 140, size: 2.5, delay: 2.0 },
    { x: 30, y: 120, size: 2, delay: 1.4 },
    { x: 180, y: 270, size: 3, delay: 0.6 },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-0 overflow-hidden bg-gradient-to-br from-[#0d0d1a] via-[#111128] to-[#0a0a1e] relative">
      {/* Ambient glow blobs - Simplified for TV */}
      <div className="absolute w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.1), transparent 70%)" }} />
      <div className="absolute w-72 h-72 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)" }} />

      {/* Main content - scales to fit card */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center flex-1 min-h-0 min-w-0 w-full"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
      >
        {/* Outer spinning ring - constrained to fit */}
        <div className="relative w-full max-w-full aspect-square max-h-[55%] flex-shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, transparent, #22D3EE, transparent, #8B5CF6, transparent)",
              padding: "2px",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner glow ring */}
          <motion.div
            className="absolute inset-3 rounded-full"
            style={{
              background: "conic-gradient(from 180deg, transparent, rgba(139,92,246,0.3), transparent, rgba(34,211,238,0.3), transparent)",
              padding: "1.5px",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />

          {/* SVG face inside */}
          <div className="absolute inset-6 flex items-center justify-center">
            <motion.svg
              viewBox="0 0 300 300"
              className="w-full h-full drop-shadow-[0_0_40px_rgba(34,211,238,0.2)]"
            >
              <defs>
                <radialGradient id="faceGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(34,211,238,0.08)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <linearGradient id="eyeGradL" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#67E8F9" />
                </linearGradient>
                <linearGradient id="eyeGradR" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
                <linearGradient id="smileGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Face background glow */}
              <circle cx="150" cy="150" r="120" fill="url(#faceGlow)" />

              {/* Face outline - double ring */}
              <motion.circle
                cx="150" cy="150" r="110"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
                animate={{ r: [110, 112, 110] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Left eye - with glow and pupil */}
              <motion.ellipse
                cx="112" cy="125"
                fill="url(#eyeGradL)"
                filter="url(#glow)"
                animate={{
                  ry: [16, 2, 2, 16, 16, 16],
                  rx: [13, 13, 13, 13, 13, 13],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.06, 0.1, 0.16, 0.5, 1],
                  ease: "easeInOut",
                }}
              />
              {/* Left eye highlight */}
              <motion.circle
                cx="117" cy="120" r="4"
                fill="white"
                opacity="0.9"
                animate={{
                  opacity: [0.9, 0, 0, 0.9, 0.9, 0.9],
                  r: [4, 0, 0, 4, 4, 4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.06, 0.1, 0.16, 0.5, 1],
                }}
              />

              {/* Right eye - with glow and pupil */}
              <motion.ellipse
                cx="188" cy="125"
                fill="url(#eyeGradR)"
                filter="url(#glow)"
                animate={{
                  ry: [16, 2, 2, 16, 16, 16],
                  rx: [13, 13, 13, 13, 13, 13],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.06, 0.1, 0.16, 0.5, 1],
                  ease: "easeInOut",
                }}
              />
              {/* Right eye highlight */}
              <motion.circle
                cx="193" cy="120" r="4"
                fill="white"
                opacity="0.9"
                animate={{
                  opacity: [0.9, 0, 0, 0.9, 0.9, 0.9],
                  r: [4, 0, 0, 4, 4, 4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.06, 0.1, 0.16, 0.5, 1],
                }}
              />

              {/* Smile - thick, glowing, gradient */}
              <motion.path
                fill="none"
                stroke="url(#smileGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#softGlow)"
                animate={{
                  d: [
                    "M 95 175 Q 150 220 205 175",
                    "M 90 178 Q 150 235 210 178",
                    "M 95 175 Q 150 220 205 175",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Rosy cheeks */}
              <motion.circle
                cx="78" cy="165" r="16"
                fill="#22D3EE"
                animate={{ opacity: [0.04, 0.12, 0.04] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.circle
                cx="222" cy="165" r="16"
                fill="#8B5CF6"
                animate={{ opacity: [0.04, 0.12, 0.04] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />

              {/* Sparkle stars around face */}
              {SPARKLES.map((s, i) => (
                <motion.g key={i} transform={`translate(${s.x}, ${s.y})`}>
                  <motion.path
                    d={`M 0 ${-s.size} L ${s.size * 0.3} ${-s.size * 0.3} L ${s.size} 0 L ${s.size * 0.3} ${s.size * 0.3} L 0 ${s.size} L ${-s.size * 0.3} ${s.size * 0.3} L ${-s.size} 0 L ${-s.size * 0.3} ${-s.size * 0.3} Z`}
                    fill="white"
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.2, 0.5],
                      rotate: [0, 90, 180],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: s.delay,
                      ease: "easeInOut",
                    }}
                  />
                </motion.g>
              ))}
            </motion.svg>
          </div>

          {/* Orbiting particles - scale with container */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: i % 2 === 0 ? "#22D3EE" : "#8B5CF6",
                boxShadow: `0 0 8px ${i % 2 === 0 ? "#22D3EE" : "#8B5CF6"}`,
                left: "50%",
                top: "50%",
              }}
              animate={{
                x: [
                  Math.cos((i / 12) * Math.PI * 2) * 115,
                  Math.cos(((i + 4) / 12) * Math.PI * 2) * 115,
                  Math.cos(((i + 8) / 12) * Math.PI * 2) * 115,
                  Math.cos((i / 12) * Math.PI * 2) * 115,
                ],
                y: [
                  Math.sin((i / 12) * Math.PI * 2) * 115,
                  Math.sin(((i + 4) / 12) * Math.PI * 2) * 115,
                  Math.sin(((i + 8) / 12) * Math.PI * 2) * 115,
                  Math.sin((i / 12) * Math.PI * 2) * 115,
                ],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: p.delay,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Loading section - compact so it fits in card */}
        <motion.div
          className="mt-2 flex flex-col items-center flex-shrink-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {/* Glowing progress bar */}
          <div className="w-24 max-w-full h-1 rounded-full bg-white/5 overflow-hidden relative mb-2">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, #22D3EE, #8B5CF6, #22D3EE)",
                backgroundSize: "200% 100%",
              }}
              animate={{
                width: ["0%", "100%", "0%"],
                backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full blur-sm"
              style={{ background: "linear-gradient(90deg, #22D3EE, #8B5CF6)" }}
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Text */}
          <div className="flex items-center">
            <motion.span
              className="text-[10px] font-semibold tracking-wider uppercase text-[#22D3EE] mr-0.5"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Assistant is loading
            </motion.span>
            <span className="flex">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="text-[10px] font-semibold text-[#22D3EE] mx-[1px]"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3 }}
                >
                  .
                </motion.span>
              ))}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

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

type KioskState = "menu" | "face-scanning" | "manual-checkin" | "chat" | "welcome" | "face-not-recognized";

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
  const navigate = useNavigate();
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
  const [voiceLang, setVoiceLang] = useState<'ar' | 'en-US'>('en-US');
  const [avatarGender, setAvatarGender] = useState<"female" | "male">("female");
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const heygenVideoRef = useRef<HTMLVideoElement>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const chromaCanvasRef = useChromaKey(heygenVideoRef, heygenActive);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const welcomeScrollRef = useRef<HTMLDivElement>(null);
  const scanningInProgressRef = useRef(false);

  // Resolve event ID: prefer sessionStorage, fallback to first public event
  useEffect(() => {
    const stored = sessionStorage.getItem("eventId");
    if (stored) {
      setActiveEventId(stored);
      return;
    }
    events.listPublic().then((list) => {
      if (list.length > 0) {
        const id = list[0]._id;
        setActiveEventId(id);
        sessionStorage.setItem("eventId", id);
      } else {
        console.warn("Kiosk: No public events available for face recognition");
      }
    }).catch((err) => console.error("Kiosk: Failed to fetch events:", err));
  }, []);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat and welcome conversations to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [conversation, isSpeaking, voiceTranscript, isListening]);

  useEffect(() => {
    if (welcomeScrollRef.current) {
      welcomeScrollRef.current.scrollTo({ top: welcomeScrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [welcomeConversation, isSpeaking, voiceTranscript, isListening]);

  // Pre-resolve Salma avatar candidates (logs all available avatars to console for debugging)
  useEffect(() => {
    if (!heygenService.heygenReady()) return;
    heygenService.resolveSalmaAvatarCandidates().catch(() => {});
  }, []);

  // Auto-start camera when in face scanning mode
  useEffect(() => {
    if (state === "face-scanning") {
      scanningInProgressRef.current = false;
      setScanMessage(null);
      setScanProgress(0);
      setIsScanning(false);
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [state]);

  // Start/stop HeyGen session when entering/leaving chat or welcome states (or avatar gender changes)
  useEffect(() => {
    const shouldConnect = (state === "chat" || state === "welcome") && heygenService.heygenReady() && heygenVideoRef.current;

    let cancelled = false;

    if (shouldConnect) {
      const chatWelcome = kioskChatWelcomeText(voiceLang);
      const welcomeGreeting = userData
        ? kioskWelcomeGreetingText(userData.fullName.split(" ")[0], voiceLang)
        : chatWelcome;

      const customWelcome = state === "welcome" ? welcomeGreeting : chatWelcome;
      const avatarIdOverride = avatarGender === "male" ? MALE_AVATAR_HEYGEN_ID : undefined;
      const voiceIdOverride = avatarGender === "male" ? MALE_VOICE_HEYGEN_ID : undefined;

      void (async () => {
        await heygenService.closeSession().catch(() => { });
        if (cancelled || !heygenVideoRef.current) return;
        await heygenService.startSession(
          heygenVideoRef.current,
          () => setHeygenActive(true),
          () => setHeygenActive(false),
          () => { },
          () => { heygenService.closeSession().catch(() => { }); setHeygenActive(false); },
          customWelcome,
          avatarIdOverride,
          voiceIdOverride,
        ).catch(console.error);
      })();
    }

    return () => {
      cancelled = true;
      if (shouldConnect) {
        heygenService.closeSession().catch(() => { });
        setHeygenActive(false);
      }
    };
  }, [state, userData, avatarGender, voiceLang]);

  // Auto-start / sync chat welcome message with language toggle
  useEffect(() => {
    if (state !== "chat") return;
    const greeting = kioskChatWelcomeText(voiceLang);
    setConversation([{ type: "assistant", text: greeting, timestamp: new Date() }]);
  }, [state, voiceLang]);

  // Auto-start / sync welcome conversation with language toggle
  useEffect(() => {
    if (state !== "welcome" || !userData) return;
    const greeting = kioskWelcomeGreetingText(userData.fullName.split(" ")[0], voiceLang);
    setWelcomeConversation([{ type: "assistant", text: greeting, timestamp: new Date() }]);
  }, [state, userData, voiceLang]);

  const sendGeneralMessage = useCallback(async (message: string) => {
    heygenService.interruptAvatar();
    setIsSpeaking(false);
    setConversation(prev => [...prev, { type: "user", text: message, timestamp: new Date() }]);
    setIsSpeaking(true);
    try {
      const response = await fetchGeneralChatResponse(message, voiceLang);
      setConversation(prev => [...prev, { type: "assistant", text: response, timestamp: new Date() }]);
      heygenService.sendTextToAvatar(response);
    } catch {
      const fallback = "I'm sorry, I couldn't process that request right now. Please try again.";
      setConversation(prev => [...prev, { type: "assistant", text: fallback, timestamp: new Date() }]);
    } finally {
      setIsSpeaking(false);
    }
  }, [voiceLang]);

  const sendWelcomeMessage = useCallback(async (message: string) => {
    heygenService.interruptAvatar();
    setIsSpeaking(false);
    setWelcomeConversation(prev => [...prev, { type: "user", text: message, timestamp: new Date() }]);
    setIsSpeaking(true);
    try {
      const profile: UserProfile = {
        fullName: userData?.fullName || "Guest",
        designation: userData?.designation,
        company: userData?.company,
        email: userData?.email,
        registrationId: userData?.registrationId,
        agenda: userData?.agenda?.currentSession
          ? [userData.agenda.currentSession]
          : undefined,
      };
      const response = await fetchUserChatResponse(message, profile, voiceLang);
      setWelcomeConversation(prev => [...prev, { type: "assistant", text: response, timestamp: new Date() }]);
      heygenService.sendTextToAvatar(response);
    } catch {
      const fallback = "I'm sorry, I couldn't process that request right now. Please try again.";
      setWelcomeConversation(prev => [...prev, { type: "assistant", text: fallback, timestamp: new Date() }]);
    } finally {
      setIsSpeaking(false);
    }
  }, [userData, voiceLang]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1920, height: 1080 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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

  // Attach stream to video element once it renders
  useEffect(() => {
    if (state === "face-scanning" && videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
    }
  });

  const captureFrameAsBase64 = (): string | null => {
    const video = videoRef.current;
    const canvas = scanCanvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return dataUrl.split(",")[1];
  };

  /** Wait for video to have valid dimensions, then capture (with retries). */
  const captureFrameWithRetry = (): Promise<string | null> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 25; // ~2.5s
      const tryCapture = () => {
        const base64 = captureFrameAsBase64();
        if (base64) {
          resolve(base64);
          return;
        }
        attempts += 1;
        if (attempts >= maxAttempts) {
          resolve(null);
          return;
        }
        setTimeout(tryCapture, 100);
      };
      tryCapture();
    });
  };

  const handleFaceScan = () => {
    if (scanningInProgressRef.current) return;
    scanningInProgressRef.current = true;
    setIsScanning(true);
    setScanProgress(0);
    setScanMessage(null);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          recognizeUser();
          return 100;
        }
        return prev + 2;
      });
    }, 120);
  };

  const recognizeUser = async () => {
    const imageBase64 = await captureFrameWithRetry();

    if (!activeEventId) {
      scanningInProgressRef.current = false;
      console.error("Kiosk: No eventId available for face recognition");
      setScanMessage("Kiosk not configured — no event selected");
      setIsScanning(false);
      setState("face-not-recognized");
      return;
    }

    if (!imageBase64) {
      scanningInProgressRef.current = false;
      console.error("Kiosk: Failed to capture camera frame (video may not be ready)");
      setScanMessage("Camera not ready — please try again");
      setIsScanning(false);
      setState("face-not-recognized");
      return;
    }

    try {
      const result = await kiosk.faceIdentify(imageBase64, activeEventId);

      if (result.matched && result.guest) {
        const g = result.guest;
        const user: UserData = {
          fullName: g.fullName,
          designation: g.designation || "",
          company: g.company || "",
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
        scanningInProgressRef.current = false;
        setIsScanning(false);
        setState("welcome");
        return;
      }

      console.warn("Kiosk: Face not matched. Reason:", result.reason, "Score:", result.score);
      setScanMessage(result.reason || "Face not recognized");
    } catch (err) {
      console.error("Kiosk: Face identify API error:", err);
      setScanMessage("Face recognition service unavailable");
    }

    // Fallback: try email lookup if registration data exists in session
    const storedData = sessionStorage.getItem("registrationData");
    if (storedData) {
      const data = JSON.parse(storedData);
      try {
        const result = await kiosk.lookup(data.email, "email");
        const g = result.guest;
        try { await kiosk.checkin(g._id); } catch { /* 409 = already checked in */ }
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
        scanningInProgressRef.current = false;
        setIsScanning(false);
        setState("welcome");
        return;
      } catch (err) {
        console.error("Kiosk: Email lookup fallback failed:", err);
      }
    }

    scanningInProgressRef.current = false;
    setIsScanning(false);
    setState("face-not-recognized");
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
      setManualError(null);
    } catch {
      setManualError("No registration found. Please check your details or visit the Registration Desk.");
    }
  };

  const handleReset = useCallback(() => {
    try { voiceService.stopListening(); } catch { }
    heygenService.closeSession().catch(() => { });
    setHeygenActive(false);
    setIsSpeaking(false);
    setIsListening(false);
    setVoiceTranscript("");
    setConversation([]);
    setCurrentResponse("");
    setWelcomeConversation([]);
    setUserData(null);
    setManualInput("");
    setManualError(null);
    setScanMessage(null);
    setScanProgress(0);
    setIsScanning(false);
    setAvatarGender("female");
    setVoiceLang("en-US");
    setState("menu");
  }, []);

  return (
    <>
      <div className="fixed inset-0 w-full h-full bg-[#1a1a2e] text-white font-['Plus_Jakarta_Sans'] overflow-hidden pointer-events-auto" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 50%, #16213e 100%)' }}>
        {/* Ambient Background Effects - Scaled for large screens */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.15 }}>
          <div className="absolute top-0 left-1/4 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)' }}></div>
          <div className="absolute bottom-0 right-1/4 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }}></div>
        </div>

        {/* Header - Compact */}
        <div className="absolute top-0 left-0 right-0 z-[100] border-b border-white pointer-events-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#000000' }}>
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-[#cccccc] hover:text-white transition-colors relative z-[110] pointer-events-auto cursor-pointer mr-4 bg-transparent border-none p-1"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Home className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-[#22D3EE] tracking-tight">
                  FutureFin Expo 2026
                </h1>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-base md:text-lg font-bold text-white/90">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Hidden HeyGen video element (always in DOM for stable stream) */}
        <video ref={heygenVideoRef} autoPlay playsInline className="hidden" />
        <canvas ref={scanCanvasRef} className="hidden" />

        {/* ==================== MENU - Plain div for legacy browser + touch/kiosk click compatibility ==================== */}
        <div
          style={{
            display: state === 'menu' ? 'flex' : 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 80,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '52px 24px 8px 24px',
            pointerEvents: state === 'menu' ? 'auto' : 'none',
            touchAction: 'manipulation',
            isolation: 'isolate',
          }}
        >
          <div style={{ width: '100%', maxWidth: '1200px', textAlign: 'center', position: 'relative', zIndex: 1, pointerEvents: 'auto' }}>
            <h1 style={{ fontSize: 'min(2.5rem, 4vw)', fontWeight: 900, color: '#22D3EE', marginBottom: '12px', lineHeight: 1.1 }}>Welcome to FutureFin Summit 2026!</h1>
            <p style={{ fontSize: 'min(1.1rem, 1.8vw)', color: '#ffffff', marginBottom: '24px', opacity: 0.8 }}>How would you like to proceed?</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 2 }}>
              <button
                type="button"
                onClick={() => { setState("face-scanning"); }}
                onTouchEnd={(e) => { e.preventDefault(); setState("face-scanning"); }}
                style={{
                  backgroundColor: 'rgba(30,41,59,0.95)',
                  border: '2px solid rgba(34,211,238,0.5)',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  cursor: 'pointer',
                  width: 'min(240px, 22vw)',
                  margin: '0',
                  position: 'relative',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                  color: '#ffffff',
                  fontFamily: 'inherit',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Scan style={{ width: '32px', height: '32px', color: '#22D3EE' }} />
                  </div>
                  <h3 style={{ fontSize: 'min(1.1rem, 1.6vw)', fontWeight: 900, marginBottom: '8px' }}>Face Recognition</h3>
                  <p style={{ fontSize: 'min(0.8rem, 1.2vw)', color: '#cccccc' }}>Quick &amp; secure check-in</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setState("manual-checkin"); }}
                onTouchEnd={(e) => { e.preventDefault(); setState("manual-checkin"); }}
                style={{
                  backgroundColor: 'rgba(30,41,59,0.95)',
                  border: '2px solid rgba(139,92,246,0.5)',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  cursor: 'pointer',
                  width: 'min(240px, 22vw)',
                  margin: '0',
                  position: 'relative',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                  color: '#ffffff',
                  fontFamily: 'inherit',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <User style={{ width: '32px', height: '32px', color: '#8B5CF6' }} />
                  </div>
                  <h3 style={{ fontSize: 'min(1.1rem, 1.6vw)', fontWeight: 900, marginBottom: '8px' }}>Manual Check-In</h3>
                  <p style={{ fontSize: 'min(0.8rem, 1.2vw)', color: '#cccccc' }}>Enter credentials</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setState("chat"); }}
                onTouchEnd={(e) => { e.preventDefault(); setState("chat"); }}
                style={{
                  backgroundColor: 'rgba(30,41,59,0.95)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  cursor: 'pointer',
                  width: 'min(240px, 22vw)',
                  margin: '0',
                  position: 'relative',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  touchAction: 'manipulation',
                  color: '#ffffff',
                  fontFamily: 'inherit',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <MessageCircle style={{ width: '32px', height: '32px', color: '#ffffff' }} />
                  </div>
                  <h3 style={{ fontSize: 'min(1.1rem, 1.6vw)', fontWeight: 900, marginBottom: '8px' }}>Chat Assistant</h3>
                  <p style={{ fontSize: 'min(0.8rem, 1.2vw)', color: '#cccccc' }}>Ask any queries</p>
                </div>
              </button>
            </div>
          </div>
        </div>


        <div className="absolute inset-0 z-[40] overflow-hidden flex flex-col" style={{ pointerEvents: state === 'menu' ? 'none' : 'auto', paddingBottom: (state !== 'chat' && state !== 'welcome') ? '3.5rem' : 0 }}>
          <AnimatePresence mode="wait">

            {/* ==================== FACE SCANNING ==================== */}
            {
              state === "face-scanning" && (
                <motion.div
                  key="face-scanning"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full min-h-0 flex flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-6"
                >
                  <div className="w-full max-w-[min(92vw,420px)] flex flex-col gap-3 items-center shrink-0">
                    {/* Status badge: above video so it never overlaps the frame */}
                    <div className="flex justify-center shrink-0">
                      <div className="flex items-center bg-black/80 px-3 py-1.5 rounded-full border border-white/20">
                        <div className={`w-2 h-2 rounded-full mr-2 ${isScanning ? 'bg-[#22D3EE] animate-pulse' : 'bg-[#34D399]'}`} />
                        <span className="text-xs font-bold text-white">{isScanning ? `Scanning ${scanProgress}%` : 'Ready'}</span>
                      </div>
                    </div>

                    {/* Portrait frame sized for face alignment only — not full viewport */}
                    <div className="relative w-full aspect-[320/420] max-h-[min(58vh,520px)] rounded-[20px] overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.3)] border border-white/10">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

                      {/* Face alignment guide: centered, scales with card so it's not small/zoomed on wide screens */}
                      <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[24px] border-2 border-dashed border-white/40 bg-transparent"
                        style={{
                          width: 'min(90%, 420px)',
                          aspectRatio: '320 / 420',
                          maxHeight: 'min(65vh, 85%)',
                        }}
                      >
                        <div className="absolute -top-0.5 -left-0.5 w-12 h-12 border-t-4 border-l-4 border-[#22D3EE] rounded-tl-[24px]" />
                        <div className="absolute -top-0.5 -right-0.5 w-12 h-12 border-t-4 border-r-4 border-[#22D3EE] rounded-tr-[24px]" />
                        <div className="absolute -bottom-0.5 -left-0.5 w-12 h-12 border-b-4 border-l-4 border-[#22D3EE] rounded-bl-[24px]" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-12 h-12 border-b-4 border-r-4 border-[#22D3EE] rounded-br-[24px]" />
                      </div>

                      {isScanning && (
                        <div className="absolute inset-0 pointer-events-none">
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
                          {/* Scanning border: same position/size as alignment guide */}
                          <div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[24px] border-2 border-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.5)] bg-transparent"
                            style={{
                              width: 'min(90%, 420px)',
                              aspectRatio: '320 / 420',
                              maxHeight: 'min(65vh, 85%)',
                            }}
                          />
                          <motion.div
                            animate={{ y: ['-50%', '150%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                          />
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-4 z-[60] pointer-events-auto">
                        <h2 className="text-xl font-black text-center mb-1 drop-shadow-lg">
                          {isScanning ? 'Identifying...' : 'Position Your Face'}
                        </h2>
                        <p className="text-sm text-white/90 text-center font-medium drop-shadow-md">
                          {isScanning ? 'Please hold still' : 'Align your face within the frame, then tap Start Scan'}
                        </p>
                        {scanMessage && !isScanning && (
                          <p className="text-xs text-[#FB7185] text-center font-medium mt-1 drop-shadow-md">
                            {scanMessage}
                          </p>
                        )}
                        {!isScanning && (
                          <div className="flex justify-center mt-2">
                            <button
                              type="button"
                              onClick={handleFaceScan}
                              onTouchEnd={(e) => { e.preventDefault(); handleFaceScan(); }}
                              className="px-6 py-2.5 bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] rounded-full font-black text-white text-sm shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] transition-all flex items-center cursor-pointer pointer-events-auto"
                              style={{ touchAction: 'manipulation' }}
                            >
                              <Scan className="w-4 h-4 mr-2" />
                              Start Scan
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-center shrink-0 -mt-1 mb-0 relative z-[70] pointer-events-auto">
                      <button
                        type="button"
                        onClick={handleReset}
                        onTouchEnd={(e) => { e.preventDefault(); handleReset(); }}
                        className="px-4 py-1.5 bg-[#1e293b] border border-white/20 rounded-full text-xs font-bold hover:bg-white/20 transition-all cursor-pointer"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', touchAction: 'manipulation' }}
                      >
                        ← Back to Menu
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            }

            {/* ==================== MANUAL CHECK-IN ==================== */}
            {
              state === "manual-checkin" && (
                <motion.div
                  key="manual-checkin"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full flex flex-col items-center justify-center px-6 pt-14 pb-4 relative z-10"
                >
                  <div className="w-full max-w-2xl relative z-20">
                    <div className="bg-[#1e293b] border border-white/10 rounded-[24px] p-5" style={{ backgroundColor: 'rgba(30,41,59,0.95)' }}>
                      <h2 className="text-2xl font-black text-center mb-4 text-[#22D3EE]">
                        Manual Check-In
                      </h2>
                      <p className="text-base text-white/80 text-center mb-6">Enter your credentials</p>

                      <div className="flex mb-4">
                        <button
                          onClick={() => setManualMethod("email")}
                          className={`flex-1 px-4 py-2 rounded-[12px] font-bold flex items-center justify-center border-2 transition-all mr-3 ${manualMethod === "email"
                            ? "bg-[#22D3EE] border-[#22D3EE] text-white"
                            : "bg-white/5 border-white/20 hover:border-[#22D3EE]"
                            }`}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          EMAIL
                        </button>
                        <button
                          onClick={() => setManualMethod("id")}
                          className={`flex-1 px-4 py-2 rounded-[12px] font-bold flex items-center justify-center border-2 transition-all ${manualMethod === "id"
                            ? "bg-[#8B5CF6] border-[#8B5CF6] text-white"
                            : "bg-white/5 border-white/20 hover:border-[#8B5CF6]"
                            }`}
                        >
                          <Hash className="w-4 h-4 mr-2" />
                          ID
                        </button>
                      </div>

                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => { setManualInput(e.target.value); setManualError(null); }}
                        onKeyPress={(e) => e.key === "Enter" && processManualCheckIn()}
                        placeholder={manualMethod === "email" ? "Enter your email" : "Enter ID (FF2026-XXXXX)"}
                        className="w-full px-4 py-2 rounded-[12px] bg-white/5 border-2 border-white/10 focus:border-[#22D3EE] focus:outline-none text-white placeholder-white/40 mb-4"
                      />

                      {manualError && (
                        <p className="text-sm text-[#FB7185] text-center font-medium mb-4">
                          {manualError}
                        </p>
                      )}

                      <button
                        onClick={processManualCheckIn}
                        disabled={!manualInput.trim()}
                        className="w-full px-6 py-2 rounded-[12px] bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] font-black flex items-center justify-center gap-2 disabled:opacity-50 mb-3"
                      >
                        CHECK IN
                        <ArrowRight className="w-5 h-5" />
                      </button>

                      <button
                        onClick={handleReset}
                        className="w-full px-4 py-1.5 bg-white/5 border border-white/20 rounded-[10px] text-sm font-bold hover:bg-white/10 transition-all"
                      >
                        ← Back
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            }

            {/* ==================== CHAT ==================== */}
            {
              state === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full flex items-center justify-center pt-14 pb-3"
                >
                  <div className="w-full h-full max-w-[1400px] flex flex-col lg:flex-row px-6 md:px-12">
                    <div className="w-full lg:w-1/2 lg:pr-6 h-[45%] lg:h-full flex flex-col min-h-0">
                      {/* LEFT: Avatar Display - Cinematic */}
                      <div className="flex flex-col h-full py-2 lg:py-4 overflow-hidden relative">
                        <motion.div
                          initial={{ opacity: 1 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, type: "spring" }}
                          className="relative flex-1 min-h-0"
                        >
                          {/* Avatar Frame with Dynamic Border */}
                          <motion.div
                            className="relative w-full h-full rounded-[32px] overflow-hidden border-2"
                            animate={{
                              borderColor: isSpeaking
                                ? ["rgba(34, 211, 238, 0.3)", "rgba(34, 211, 238, 0.6)", "rgba(34, 211, 238, 0.3)"]
                                : isListening
                                  ? ["rgba(139, 92, 246, 0.3)", "rgba(139, 92, 246, 0.6)", "rgba(139, 92, 246, 0.3)"]
                                  : "rgba(255, 255, 255, 0.1)",
                              boxShadow: isSpeaking
                                ? ["0 0 15px rgba(34, 211, 238, 0.1)", "0 0 25px rgba(34, 211, 238, 0.2)", "0 0 15px rgba(34, 211, 238, 0.1)"]
                                : isListening
                                  ? ["0 0 15px rgba(139, 92, 246, 0.1)", "0 0 25px rgba(139, 92, 246, 0.2)", "0 0 15px rgba(139, 92, 246, 0.1)"]
                                  : "0 0 10px rgba(255, 255, 255, 0.05)"
                            }}
                            transition={{
                              duration: isSpeaking || isListening ? 2 : 0.3,
                              repeat: isSpeaking || isListening ? Infinity : 0,
                              ease: "easeInOut"
                            }}
                          >
                            {heygenActive ? (
                              <canvas ref={chromaCanvasRef} className="h-full w-full max-h-full object-cover" style={{ background: '#0f1729' }} />
                            ) : (
                              <SmileyLoader />
                            )}

                            {/* Dynamic Gradient Overlay */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 pointer-events-none"
                              animate={{
                                opacity: isSpeaking ? [0.8, 1, 0.8] : heygenActive ? 1 : 0
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
                                className="flex items-center bg-black/90 px-4 py-2.5 rounded-full border shadow-lg"
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
                                  className="w-2.5 h-2.5 rounded-full mr-2"
                                />
                                <span className="text-xs font-black text-white tracking-wider">
                                  {isSpeaking ? "SPEAKING" : isListening ? "LISTENING" : "READY"}
                                </span>
                              </motion.div>
                            </div>
                          </motion.div>

                        </motion.div>

                        {/* Sound Wave Visualization */}
                        <div className="flex items-center justify-center mt-3 flex-shrink-0">
                          {[...Array(9)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 rounded-full mx-[3px]"
                              animate={{
                                height: isSpeaking
                                  ? [3, 14, 3]
                                  : isListening
                                    ? [3, 12, 3]
                                    : [4, 8, 4],
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
                              style={{
                                filter: `drop-shadow(0 0 ${isSpeaking ? 8 : isListening ? 6 : 4}px currentColor)`
                              }}
                            />
                          ))}
                        </div>

                        {/* Avatar gender — below avatar, left column */}
                        <div className="flex justify-start mt-2 flex-shrink-0">
                          <div className="h-11 rounded-[20px] border-2 border-white/20 flex items-center p-0.5 shrink-0 overflow-hidden" title="Avatar">
                            <button
                              type="button"
                              onClick={() => setAvatarGender("female")}
                              onTouchEnd={(e) => { e.preventDefault(); e.currentTarget.click(); }}
                              className={`h-full px-2.5 rounded-[16px] font-black text-sm leading-none transition-all cursor-pointer ${avatarGender === "female" ? "bg-white/20 text-white" : "text-white/40"}`}
                              style={{ touchAction: "manipulation" }}
                              aria-label="Female avatar"
                            >F</button>
                            <button
                              type="button"
                              onClick={() => setAvatarGender("male")}
                              onTouchEnd={(e) => { e.preventDefault(); e.currentTarget.click(); }}
                              className={`h-full px-2.5 rounded-[16px] font-black text-sm leading-none transition-all cursor-pointer ${avatarGender === "male" ? "bg-white/20 text-white" : "text-white/40"}`}
                              style={{ touchAction: "manipulation" }}
                              aria-label="Male avatar"
                            >M</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Conversation & Controls */}
                    <div className="w-full lg:w-1/2 lg:pl-6 flex flex-col pt-4 h-1/2 lg:h-full overflow-hidden">

                      {/* Conversation Display */}
                      <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 min-h-0 mb-4 rounded-[32px] bg-[#1e293b]/95 border border-white/10 p-3 overflow-hidden flex flex-col relative z-0"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                          <h3 className="text-sm font-black text-white/70 uppercase tracking-wider">Conversation</h3>
                          <div className="flex items-center">
                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isSpeaking ? 'bg-[#22D3EE]' : isListening ? 'bg-[#8B5CF6]' : 'bg-white/30'}`}></div>
                            <span className="text-xs font-mono text-white/50">
                              {conversation.length} {conversation.length === 1 ? 'message' : 'messages'}
                            </span>
                          </div>
                        </div>

                        {/* Messages */}
                        <div ref={chatScrollRef} className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
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
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[80%] rounded-[20px] px-4 py-3 ${msg.type === 'user'
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

                          {isListening && voiceTranscript && (
                            <div className="flex justify-end">
                              <div className="max-w-[80%] rounded-[20px] px-4 py-3 bg-gradient-to-r from-[#8B5CF6]/60 to-[#A78BFA]/60 border border-[#8B5CF6]/30 text-white/80">
                                <p className="text-sm leading-relaxed italic">{voiceTranscript}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-1 h-1 rounded-full bg-[#8B5CF6]" />
                                  <span className="text-[10px] opacity-60">listening...</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Typing Indicator */}
                          {isSpeaking && (
                            <motion.div
                              initial={{ opacity: 1 }}
                              animate={{ opacity: 1 }}
                              className="flex justify-start"
                            >
                              <div className="bg-white/10 border border-white/20 rounded-[20px] px-4 py-3">
                                <div className="flex">
                                  {[0, 1, 2].map((i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ opacity: [0.3, 1, 0.3] }}
                                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                      className="w-2 h-2 rounded-full bg-[#22D3EE] mx-[2px]"
                                    />
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>

                      {/* Quick Suggestions */}
                      <div className="mb-2 flex-shrink-0 relative z-30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <p className={`text-[10px] text-white/40 font-black tracking-widest ${voiceLang === 'ar' ? '' : 'uppercase'}`}>
                            {voiceLang === 'ar' ? 'سؤال سريع' : 'Quick Ask'}
                          </p>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { icon: Calendar, en: "Event Schedule", ar: "جدول الفعالية" },
                            { icon: MapPin, en: "Venue Map", ar: "خريطة المكان" },
                            { icon: User, en: "Speakers", ar: "المتحدثون" },
                            { icon: Navigation, en: "WiFi Details", ar: "تفاصيل الواي فاي" }
                          ].map((item, i) => {
                            const label = voiceLang === 'ar' ? item.ar : item.en;
                            return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => sendGeneralMessage(label)}
                              className="flex items-center px-3 py-1.5 bg-white/5 border border-white/20 rounded-[14px] text-xs font-bold text-white/80 hover:bg-white/10 hover:scale-[1.02] transition-all cursor-pointer m-1"
                            >
                              <item.icon className="w-3.5 h-3.5 mr-2" />
                              {label}
                            </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-2 flex-shrink-0 relative z-20"
                      >
                        <div className="h-11 rounded-[20px] border-2 border-white/20 flex items-center p-0.5 shrink-0 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setVoiceLang('en-US')}
                            onTouchEnd={(e) => { e.preventDefault(); e.currentTarget.click(); }}
                            className={`h-full px-2.5 rounded-[16px] font-black text-[10px] transition-all cursor-pointer ${voiceLang === 'en-US' ? 'bg-white/20 text-white' : 'text-white/40'}`}
                            style={{ touchAction: 'manipulation' }}
                          >EN</button>
                          <button
                            type="button"
                            onClick={() => setVoiceLang('ar')}
                            onTouchEnd={(e) => { e.preventDefault(); e.currentTarget.click(); }}
                            className={`h-full px-2.5 rounded-[16px] font-black text-[10px] transition-all cursor-pointer ${voiceLang === 'ar' ? 'bg-white/20 text-white' : 'text-white/40'}`}
                            style={{ touchAction: 'manipulation' }}
                          >عربي</button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            heygenService.interruptAvatar();
                            setIsSpeaking(false);
                            if (isListening) {
                              voiceService.stopListening();
                              setIsListening(false);
                              setVoiceTranscript("");
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
                              }, voiceLang);
                            }
                          }}
                          onTouchEnd={(e) => { e.preventDefault(); e.currentTarget.click(); }}
                          className="flex-1 h-11 rounded-[20px] bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center gap-3 font-black text-white text-sm shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] transition-all relative overflow-hidden cursor-pointer pointer-events-auto"
                          style={{ touchAction: 'manipulation' }}
                        >
                          {isListening && (
                            <motion.div
                              className="absolute inset-0 bg-white/20"
                              animate={{ opacity: [0.1, 0.3, 0.1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                          <Mic className={`w-5 h-5 relative z-10 ${isListening ? 'animate-pulse' : ''}`} />
                          <span className="relative z-10">{isListening ? "LISTENING..." : "TAP TO SPEAK"}</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleReset}
                          className="w-11 h-11 rounded-[20px] bg-gradient-to-br from-[#DC2626] to-[#B91C1C] border-2 border-white/10 flex items-center justify-center hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </motion.div>

                    </div>
                  </div>
                </motion.div>
              )
            }

            {/* ==================== WELCOME - AVATAR INTERFACE ==================== */}
            {
              state === "welcome" && userData && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full flex items-center justify-center pt-14 pb-3"
                >
                  <div className="w-full h-full max-w-[1400px] flex flex-col lg:flex-row px-6 md:px-12">
                    <div className="w-full lg:w-1/2 lg:pr-6 h-[40%] lg:h-full flex flex-col min-h-0">
                      {/* LEFT: Avatar Display - Cinematic */}
                      <div className="flex flex-col h-full py-2 lg:py-4 overflow-hidden relative">
                        <motion.div
                          initial={{ opacity: 1 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, type: "spring" }}
                          className="relative flex-1 min-h-0"
                        >
                          {/* Avatar Frame with Success Glow */}
                          <motion.div
                            className="relative w-full h-full rounded-[32px] overflow-hidden border-2 border-[#34D399]/40"
                            animate={{
                              boxShadow: ["0 0 20px rgba(52, 211, 153, 0.1)", "0 0 30px rgba(52, 211, 153, 0.2)", "0 0 20px rgba(52, 211, 153, 0.1)"]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            {heygenActive ? (
                              <canvas ref={chromaCanvasRef} className="h-full w-full max-h-full object-cover" style={{ background: '#0f1729' }} />
                            ) : (
                              <SmileyLoader />
                            )}

                            {/* Dynamic Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50 pointer-events-none ${heygenActive ? '' : 'opacity-0'}`} />

                            {/* Success Badge */}
                            <div className="absolute top-6 right-6">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="flex items-center bg-black/90 px-4 py-2.5 rounded-full border border-[#34D399] shadow-lg"
                              >
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="w-2.5 h-2.5 rounded-full bg-[#34D399] mr-2"
                                />
                                <span className="text-xs font-black text-[#34D399] tracking-wider">CHECKED IN</span>
                              </motion.div>
                            </div>
                          </motion.div>

                        </motion.div>

                        {/* Sound Wave Visualization - Success Theme */}
                        <div className="flex items-center justify-center mt-3 flex-shrink-0">
                          {[...Array(9)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 rounded-full mx-[3px]"
                              animate={{
                                height: [4, 16, 4],
                                backgroundColor: ["#34D399", "#22D3EE", "#34D399"]
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: "easeInOut"
                              }}
                              style={{
                                filter: "drop-shadow(0 0 6px currentColor)"
                              }}
                            />
                          ))}
                        </div>

                        {/* Avatar gender — below avatar, left column */}
                        <div className="flex justify-start mt-2 flex-shrink-0">
                          <div className="h-11 rounded-[20px] border-2 border-white/20 flex items-center p-0.5 shrink-0 overflow-hidden" title="Avatar">
                            <button
                              type="button"
                              onClick={() => setAvatarGender("female")}
                              onTouchEnd={(e) => { e.preventDefault(); e.currentTarget.click(); }}
                              className={`h-full px-2.5 rounded-[16px] font-black text-sm leading-none transition-all cursor-pointer ${avatarGender === "female" ? "bg-white/20 text-white" : "text-white/40"}`}
                              style={{ touchAction: "manipulation" }}
                              aria-label="Female avatar"
                            >F</button>
                            <button
                              type="button"
                              onClick={() => setAvatarGender("male")}
                              onTouchEnd={(e) => { e.preventDefault(); e.currentTarget.click(); }}
                              className={`h-full px-2.5 rounded-[16px] font-black text-sm leading-none transition-all cursor-pointer ${avatarGender === "male" ? "bg-white/20 text-white" : "text-white/40"}`}
                              style={{ touchAction: "manipulation" }}
                              aria-label="Male avatar"
                            >M</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Conversation & Controls */}
                    <div className="w-full lg:w-1/2 lg:pl-6 flex flex-col pt-4 h-1/2 lg:h-full overflow-hidden">

                      {/* Greeting Header */}
                      <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        className="mb-2 flex-shrink-0"
                        dir={voiceLang === "ar" ? "rtl" : "ltr"}
                      >
                        <h3 className="text-xl font-black text-[#22D3EE] mb-1 leading-tight">
                          {voiceLang === "ar"
                            ? `${kioskTimeGreeting(voiceLang)}، ${userData.fullName.split(" ")[0]}!`
                            : `${kioskTimeGreeting(voiceLang)}, ${userData.fullName.split(" ")[0]}!`}
                        </h3>
                        <p className="text-[#ffffff] opacity-60 text-sm font-medium">
                          {voiceLang === "ar"
                            ? "مرحبًا بك في معرض فيوتشرفين 2026 • تم تسجيل الدخول بنجاح"
                            : "Welcome to FutureFin Expo 2026 • Check-in successful"}
                        </p>
                      </motion.div>

                      {/* Conversation Panel */}
                      <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex-1 min-h-0 mb-4 rounded-[32px] bg-[#1e293b] border border-white/10 overflow-hidden flex flex-col relative z-10"
                        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      >
                        {/* Conversation Header */}
                        <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse mr-3"></div>
                            <h4 className="text-sm font-black text-white/70 uppercase tracking-wider">Live Conversation</h4>
                          </div>
                          <span className="text-xs font-mono text-white/50">
                            {welcomeConversation.length} {welcomeConversation.length === 1 ? 'message' : 'messages'}
                          </span>
                        </div>

                        {/* Messages Area */}
                        <div ref={welcomeScrollRef} className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
                          {welcomeConversation.map((msg, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 1 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.3 }}
                              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[85%] rounded-[24px] px-5 py-3.5 ${msg.type === 'user'
                                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white'
                                : 'bg-[#1e293b]/80 border border-white/20'
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

                          {isListening && voiceTranscript && (
                            <div className="flex justify-end">
                              <div className="max-w-[85%] rounded-[24px] px-5 py-3.5 bg-gradient-to-r from-[#8B5CF6]/60 to-[#A78BFA]/60 border border-[#8B5CF6]/30 text-white/80">
                                <p className="text-sm leading-relaxed italic">{voiceTranscript}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-1 h-1 rounded-full bg-[#8B5CF6]" />
                                  <span className="text-[10px] opacity-60">listening...</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Typing Indicator */}
                          {isSpeaking && (
                            <motion.div
                              initial={{ opacity: 1 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex justify-start"
                            >
                              <div className="bg-white/10 border border-white/20 rounded-[24px] px-5 py-3.5">
                                <div className="flex">
                                  {[0, 1, 2].map((i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                      className="w-2 h-2 rounded-full bg-[#34D399] mx-[3px]"
                                    />
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Empty State */}
                          {welcomeConversation.length === 0 && !isSpeaking && !isListening && (
                            <div className={`flex flex-col items-center justify-center h-full text-center py-12 ${voiceLang === "ar" ? "rtl" : ""}`}>
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#34D399]/20 to-[#22D3EE]/20 border border-white/10 flex items-center justify-center mb-4">
                                <Mic className="w-7 h-7 text-[#34D399]" />
                              </div>
                              <p className="text-white/60 text-sm font-medium mb-1">
                                {voiceLang === "ar" ? "المساعد الذكي جاهز" : "AI Assistant is ready"}
                              </p>
                              <p className="text-white/40 text-xs">
                                {voiceLang === "ar" ? "اضغط على الميكروفون أدناه لبدء المحادثة" : "Tap to speak below to start the conversation"}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>

                      {/* Quick Suggestions */}
                      <div className="mb-2 flex-shrink-0 relative z-50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                          <p className={`text-[10px] text-white/40 font-black tracking-widest ${voiceLang === 'ar' ? '' : 'uppercase'}`}>
                            {voiceLang === 'ar' ? 'سؤال سريع' : 'Quick Ask'}
                          </p>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { icon: Navigation, en: "Where is my hall?", ar: "أين قاعتي؟" },
                            { icon: Calendar, en: "My event schedule", ar: "جدول فعاليتي" },
                            { icon: MapPin, en: "Where do I find parking?", ar: "أين أجد موقف السيارات؟" },
                            { icon: User, en: "WiFi Details", ar: "تفاصيل الواي فاي" }
                          ].map((item, i) => {
                            const label = voiceLang === 'ar' ? item.ar : item.en;
                            return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => sendWelcomeMessage(label)}
                              className="flex items-center px-3 py-1.5 bg-[#1e293b] border border-white/20 rounded-[14px] text-xs font-bold text-white/80 transition-all cursor-pointer pointer-events-auto m-1"
                              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                            >
                              <item.icon className="w-3.5 h-3.5 mr-2" />
                              {label}
                            </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-2 flex-shrink-0 relative z-20"
                      >
                        <div className="h-11 rounded-[20px] border-2 border-white/20 flex items-center p-0.5 shrink-0 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setVoiceLang('en-US')}
                            onTouchEnd={(e) => { e.preventDefault(); e.currentTarget.click(); }}
                            className={`h-full px-2.5 rounded-[16px] font-black text-[10px] transition-all cursor-pointer ${voiceLang === 'en-US' ? 'bg-white/20 text-white' : 'text-white/40'}`}
                            style={{ touchAction: 'manipulation' }}
                          >EN</button>
                          <button
                            type="button"
                            onClick={() => setVoiceLang('ar')}
                            onTouchEnd={(e) => { e.preventDefault(); e.currentTarget.click(); }}
                            className={`h-full px-2.5 rounded-[16px] font-black text-[10px] transition-all cursor-pointer ${voiceLang === 'ar' ? 'bg-white/20 text-white' : 'text-white/40'}`}
                            style={{ touchAction: 'manipulation' }}
                          >عربي</button>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            heygenService.interruptAvatar();
                            setIsSpeaking(false);
                            if (isListening) {
                              voiceService.stopListening();
                              setIsListening(false);
                              setVoiceTranscript("");
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
                              }, voiceLang);
                            }
                          }}
                          onTouchEnd={(e) => { e.preventDefault(); e.currentTarget.click(); }}
                          className="flex-1 h-11 rounded-[20px] bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center gap-3 font-black text-white text-sm shadow-[0_0_40px_rgba(34,211,238,0.3)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)] transition-all relative overflow-hidden cursor-pointer pointer-events-auto"
                          style={{ touchAction: 'manipulation' }}
                        >
                          {isListening && (
                            <motion.div
                              className="absolute inset-0 bg-white/20"
                              animate={{ opacity: [0.1, 0.3, 0.1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                          <Mic className={`w-5 h-5 relative z-10 ${isListening ? 'animate-pulse' : ''}`} />
                          <span className="relative z-10">
                            {isListening ? "LISTENING..." : isSpeaking ? "SPEAKING..." : "TAP TO SPEAK"}
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleReset}
                          className="w-11 h-11 rounded-[20px] bg-gradient-to-br from-[#DC2626] to-[#B91C1C] border-2 border-white/10 flex items-center justify-center hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </motion.div>

                    </div>
                  </div>
                </motion.div>
              )
            }
            {/* ==================== FACE NOT RECOGNIZED ==================== */}
            {
              state === "face-not-recognized" && (
                <motion.div
                  key="face-not-recognized"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full flex flex-col items-center justify-center px-6 pt-14 pb-4 relative z-10"
                >
                  <div className="w-full max-w-2xl relative z-20">
                    <div className="bg-[#1e293b] border border-white/10 rounded-[24px] p-5 text-center" style={{ backgroundColor: 'rgba(30,41,59,0.95)' }}>
                      <div className="w-14 h-14 rounded-full bg-[#FB7185]/20 flex items-center justify-center mx-auto mb-3">
                        <X className="w-7 h-7 text-[#FB7185]" />
                      </div>
                      <h2 className="text-2xl font-black mb-3 text-white">
                        Face Not Recognized
                      </h2>
                      <p className="text-base text-white/70 mb-4">
                        We couldn't match your face. Please try again or use manual check-in.
                      </p>

                      <div className="flex flex-col">
                        <button
                          onClick={() => { setScanMessage(null); setState("face-scanning"); }}
                          className="w-full px-6 py-2.5 rounded-[14px] bg-[#22D3EE] font-black text-white flex items-center justify-center cursor-pointer pointer-events-auto mb-3"
                        >
                          <Scan className="w-5 h-5 mr-2" />
                          Try Again
                        </button>
                        <button
                          onClick={() => setState("manual-checkin")}
                          className="w-full px-6 py-2.5 rounded-[14px] bg-[#1e293b] border border-white font-black text-white flex items-center justify-center cursor-pointer pointer-events-auto mb-3"
                          style={{ borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                        >
                          <User className="w-5 h-5 mr-2" />
                          Manual Check-In
                        </button>
                        <button
                          onClick={handleReset}
                          className="w-full px-4 py-2 rounded-[10px] text-sm font-bold cursor-pointer pointer-events-auto"
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          ← Back to Menu
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            }
          </AnimatePresence>
        </div>

        {/* Footer - hidden during chat/welcome to avoid overlapping controls; z-[50] so it's above overlay and logo links are clickable */}
        {
          state !== "chat" && state !== "welcome" && (
            <div className="absolute bottom-0 left-0 right-0 z-[90] py-2 pointer-events-auto" style={{ backgroundColor: 'rgba(0,0,0,0.8)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center justify-center flex-wrap gap-4 px-4">
                <span className="text-xs text-gray-400 font-bold tracking-wider uppercase">Powered by</span>
                <a href="https://technocit.com/" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:opacity-70 transition-opacity pointer-events-auto">
                  <img src="/images/tcit_logo.svg" alt="TechnoCIT" className="h-6 object-contain" />
                </a>
                <span className="text-xs text-gray-400 font-bold">&</span>
                <a href="https://www.nfs.ae/" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:opacity-70 transition-opacity pointer-events-auto">
                  <img src="/images/nfs_logo.jpg" alt="NFS Technologies" className="h-6 object-contain" />
                </a>
              </div>
            </div>
          )
        }
      </div>
    </>
  );
}

export default KioskMain;