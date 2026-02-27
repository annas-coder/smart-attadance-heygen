import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Home, Camera, Mic, MicOff, User, MapPin, Calendar, Users, Clock, CheckCircle2, X, AlertCircle, Mail, Hash } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type KioskState = "scanning" | "recognized" | "manual-checkin";

interface UserData {
  fullName: string;
  designation: string;
  company: string;
  email: string;
  registrationId: string;
  faceImage?: string;
  checkedIn?: boolean;
  agenda?: {
    currentSession?: {
      title: string;
      location: string;
      time: string;
      speaker: string;
    };
    upcomingMeetings?: {
      title: string;
      time: string;
      location: string;
      attendees?: string[];
    }[];
    registeredSessions?: {
      title: string;
      time: string;
      location: string;
    }[];
  };
}

type ContentView = "welcome" | "schedule" | "meetings" | "map" | "networking";

export function KioskMain() {
  const [state, setState] = useState<KioskState>("scanning");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentView, setCurrentView] = useState<ContentView>("welcome");
  const [avatarMessage, setAvatarMessage] = useState("Scanning for face recognition...");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scanProgress, setScanProgress] = useState(0);
  const [manualInput, setManualInput] = useState("");
  const [manualMethod, setManualMethod] = useState<"email" | "id">("email");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Start camera
  const startCamera = async () => {
    // For prototype: simulate camera without actual permissions
    setCameraError(null);
    setState("scanning");
    simulateFaceRecognition();
    
    // Optional: Try to get real camera but don't block if it fails
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      // Silently fail - continue with simulated experience
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Simulate face recognition
  const simulateFaceRecognition = () => {
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          recognizeUser();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Recognize user (mock)
  const recognizeUser = () => {
    // Get data from sessionStorage (for demo)
    const storedData = sessionStorage.getItem("registrationData");
    const storedImage = sessionStorage.getItem("faceImage");

    if (storedData) {
      const data = JSON.parse(storedData);
      
      // Generate personalized agenda
      const currentHour = new Date().getHours();
      const agenda = {
        currentSession: {
          title: "Future of Fintech Keynote",
          location: "Main Auditorium, Floor 2",
          time: "1:00 PM - 2:00 PM",
          speaker: "Dr. Sarah Chen, CEO of FinTech Innovations"
        },
        upcomingMeetings: [
          {
            title: "1-on-1 Meeting with TechVentures",
            time: "3:00 PM - 3:30 PM",
            location: "Meeting Room B",
            attendees: ["John Smith - TechVentures", "You"]
          },
          {
            title: "Investor Networking Session",
            time: "4:30 PM - 5:30 PM",
            location: "Networking Lounge, Floor 3",
            attendees: ["15+ Investors"]
          }
        ],
        registeredSessions: [
          {
            title: "AI & Machine Learning Workshop",
            time: "2:00 PM - 4:00 PM",
            location: "Hall B, Floor 2"
          },
          {
            title: "Blockchain & Web3 Panel",
            time: "2:30 PM - 3:30 PM",
            location: "Hall A, Floor 1"
          },
          {
            title: "Digital Banking Innovation",
            time: "4:00 PM - 5:00 PM",
            location: "Hall C, Floor 1"
          }
        ]
      };
      
      const user: UserData = {
        ...data,
        faceImage: storedImage || undefined,
        registrationId: "FF2026-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        checkedIn: true,
        agenda: agenda
      };
      
      setUserData(user);
      setState("recognized");
      
      // Create personalized greeting
      const firstName = user.fullName.split(" ")[0];
      const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
      
      setAvatarMessage(`${greeting}, ${firstName}! Welcome to FutureFin Expo 2026. You're successfully checked in!`);
      
      stopCamera();
    } else {
      setAvatarMessage("Face not recognized. Please check in manually.");
      setTimeout(() => {
        setState("manual-checkin");
        stopCamera();
      }, 3000);
    }
  };

  // Start voice listening
  const startListening = () => {
    setIsListening(true);
    setState("listening");
    setAvatarMessage("I'm listening... Please ask your question.");
    
    // Simulate voice recognition after 3 seconds
    setTimeout(() => {
      simulateVoiceInput();
    }, 3000);
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);
    setState("recognized");
  };

  // Simulate voice input
  const simulateVoiceInput = () => {
    const sampleQueries = [
      "Where is the AI workshop?",
      "What sessions are happening now?",
      "Where can I find the networking area?",
      "Show me the event schedule",
      "Where is the startup exhibition?",
    ];
    
    const query = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    setVoiceQuery(query);
    setIsListening(false);
    setState("responding");
    
    processVoiceQuery(query);
  };

  // Process voice query and show recommendations
  const processVoiceQuery = (query: string) => {
    setAvatarMessage("Let me help you with that...");
    
    setTimeout(() => {
      let response = "";
      let recs: any[] = [];

      if (query.toLowerCase().includes("workshop") || query.toLowerCase().includes("ai")) {
        response = "The AI & Machine Learning workshop is in Hall B, starting at 2 PM.";
        recs = [
          {
            type: "session",
            title: "AI & Machine Learning Workshop",
            location: "Hall B, Floor 2",
            time: "2:00 PM - 4:00 PM",
            icon: "🤖",
          },
          {
            type: "session",
            title: "Deep Learning Fundamentals",
            location: "Hall B, Floor 2",
            time: "4:30 PM - 6:00 PM",
            icon: "🧠",
          },
        ];
      } else if (query.toLowerCase().includes("session") || query.toLowerCase().includes("schedule")) {
        response = "Here are the current and upcoming sessions for you.";
        recs = [
          {
            type: "session",
            title: "Future of Fintech Keynote",
            location: "Main Auditorium",
            time: "1:00 PM - 2:00 PM",
            icon: "🎤",
            status: "Now",
          },
          {
            type: "session",
            title: "Blockchain & Web3",
            location: "Hall A, Floor 1",
            time: "2:30 PM - 3:30 PM",
            icon: "⛓️",
          },
          {
            type: "session",
            title: "Digital Banking Innovation",
            location: "Hall C, Floor 1",
            time: "4:00 PM - 5:00 PM",
            icon: "🏦",
          },
        ];
      } else if (query.toLowerCase().includes("networking")) {
        response = "The networking area is on Floor 3, Lounge Area. You'll find refreshments and seating there.";
        recs = [
          {
            type: "location",
            title: "Networking Lounge",
            location: "Floor 3, West Wing",
            description: "Coffee, refreshments & seating",
            icon: "☕",
          },
          {
            type: "location",
            title: "Exhibition Hall",
            location: "Floor 1, East Wing",
            description: "150+ exhibitor booths",
            icon: "🏢",
          },
        ];
      } else if (query.toLowerCase().includes("startup") || query.toLowerCase().includes("exhibition")) {
        response = "The startup exhibition is in the East Wing, Floor 1. Over 50 innovative startups showcasing!";
        recs = [
          {
            type: "location",
            title: "Startup Exhibition",
            location: "Floor 1, East Wing",
            description: "50+ innovative fintech startups",
            icon: "🚀",
          },
          {
            type: "event",
            title: "Startup Pitch Competition",
            location: "Stage Area, Floor 1",
            time: "5:00 PM - 7:00 PM",
            icon: "🏆",
          },
        ];
      } else {
        response = "Here are some popular locations and sessions you might be interested in.";
        recs = [
          {
            type: "session",
            title: "Future of Fintech Keynote",
            location: "Main Auditorium",
            time: "1:00 PM - 2:00 PM",
            icon: "🎤",
          },
          {
            type: "location",
            title: "Networking Lounge",
            location: "Floor 3, West Wing",
            description: "Coffee & refreshments",
            icon: "☕",
          },
          {
            type: "location",
            title: "Startup Exhibition",
            location: "Floor 1, East Wing",
            description: "50+ startups",
            icon: "🚀",
          },
        ];
      }

      setAvatarMessage(response);
      setRecommendations(recs);
      setState("recognized");
    }, 1500);
  };

  // Reset to idle
  const handleReset = () => {
    setState("scanning");
    setUserData(null);
    setVoiceQuery("");
    setRecommendations([]);
    setAvatarMessage("Scanning for face recognition...");
    startCamera();
  };

  // Manual check-in
  const handleManualCheckIn = () => {
    setState("manual-checkin");
    setAvatarMessage("Please enter your email or registration ID to check in manually.");
  };

  // Process manual check-in
  const processManualCheckIn = () => {
    // Get data from sessionStorage (for demo)
    const storedData = sessionStorage.getItem("registrationData");
    const storedImage = sessionStorage.getItem("faceImage");

    if (storedData) {
      const data = JSON.parse(storedData);
      
      // Check if input matches email or registration ID
      if (
        (manualMethod === "email" && data.email?.toLowerCase() === manualInput.toLowerCase()) ||
        (manualMethod === "id" && manualInput.toUpperCase().includes("FF2026"))
      ) {
        // Generate personalized agenda
        const currentHour = new Date().getHours();
        const agenda = {
          currentSession: {
            title: "Future of Fintech Keynote",
            location: "Main Auditorium, Floor 2",
            time: "1:00 PM - 2:00 PM",
            speaker: "Dr. Sarah Chen, CEO of FinTech Innovations"
          },
          upcomingMeetings: [
            {
              title: "1-on-1 Meeting with TechVentures",
              time: "3:00 PM - 3:30 PM",
              location: "Meeting Room B",
              attendees: ["John Smith - TechVentures", "You"]
            },
            {
              title: "Investor Networking Session",
              time: "4:30 PM - 5:30 PM",
              location: "Networking Lounge, Floor 3",
              attendees: ["15+ Investors"]
            }
          ],
          registeredSessions: [
            {
              title: "AI & Machine Learning Workshop",
              time: "2:00 PM - 4:00 PM",
              location: "Hall B, Floor 2"
            },
            {
              title: "Blockchain & Web3 Panel",
              time: "2:30 PM - 3:30 PM",
              location: "Hall A, Floor 1"
            },
            {
              title: "Digital Banking Innovation",
              time: "4:00 PM - 5:00 PM",
              location: "Hall C, Floor 1"
            }
          ]
        };
        
        const user: UserData = {
          ...data,
          faceImage: storedImage || undefined,
          registrationId: "FF2026-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          checkedIn: true,
          agenda: agenda
        };
        
        setUserData(user);
        setState("recognized");
        setManualInput("");
        
        // Create personalized greeting
        const firstName = user.fullName.split(" ")[0];
        const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
        
        setAvatarMessage(`${greeting}, ${firstName}! Welcome to FutureFin Expo 2026. You're successfully checked in!`);
      } else {
        setAvatarMessage("Invalid email or registration ID. Please try again.");
        setTimeout(() => {
          setManualInput("");
        }, 2000);
      }
    } else {
      setAvatarMessage("No registration found. Please register first.");
      setTimeout(() => {
        setState("scanning");
        setManualInput("");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#101728] to-[#151D32] text-white font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <div className="border-b border-[#1E293B] bg-[#0B0F1A]/80 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-[#94A3B8] hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
                FutureFin Expo 2026
              </h1>
              <p className="text-xs text-[#94A3B8] font-mono">CHECK-IN KIOSK</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
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

      {/* Main Content */}
      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 h-[calc(100vh-150px)]">
          {/* Left Side: Static Avatar */}
          <div className="flex flex-col gap-6">
            {/* Avatar Card */}
            <div className="bg-[#151D32] border border-[#1E293B] rounded-[20px] p-8 flex-1 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {userData ? (
                  // Personalized Avatar
                  <motion.div
                    key="personalized"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="text-center w-full"
                  >
                    {userData.faceImage ? (
                      <img
                        src={userData.faceImage}
                        alt={userData.fullName}
                        className="w-48 h-48 rounded-full object-cover border-4 border-[#22D3EE] mx-auto mb-6"
                      />
                    ) : (
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] mx-auto mb-6 flex items-center justify-center text-6xl font-bold">
                        {userData.fullName.split(" ").map(n => n[0]).join("")}
                      </div>
                    )}

                    <div className="mb-4">
                      <h2 className="text-3xl font-bold mb-2">{userData.fullName}</h2>
                      <p className="text-lg text-[#94A3B8]">{userData.designation}</p>
                      <p className="text-md text-[#94A3B8]">{userData.company}</p>
                    </div>

                    {/* Check-in badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#34D399]/20 border border-[#34D399] rounded-full text-[#34D399] font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      Checked In
                    </div>

                    {/* Listening indicator */}
                    {isListening && (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="mt-6"
                      >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center mx-auto">
                          <div className="w-16 h-16 rounded-full bg-[#151D32] flex items-center justify-center">
                            <Mic className="w-8 h-8 text-[#22D3EE]" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  // Generic AI Avatar
                  <motion.div
                    key="generic"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="text-center w-full"
                  >
                    <motion.div
                      animate={state === "scanning" ? { 
                        boxShadow: [
                          "0 0 20px rgba(34, 211, 238, 0.3)",
                          "0 0 40px rgba(139, 92, 246, 0.5)",
                          "0 0 20px rgba(34, 211, 238, 0.3)"
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-48 h-48 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] mx-auto mb-6 flex items-center justify-center relative"
                    >
                      <div className="w-44 h-44 rounded-full bg-[#151D32] flex items-center justify-center">
                        <User className="w-24 h-24 text-white" />
                      </div>
                      
                      {/* Pulsing ring when scanning */}
                      {state === "scanning" && (
                        <motion.div
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0, 0.5]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full border-4 border-[#22D3EE]"
                        />
                      )}
                    </motion.div>

                    <h2 className="text-3xl font-bold mb-2">AI Assistant</h2>
                    <p className="text-lg text-[#94A3B8]">FutureFin Expo 2026</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar Message Bubble */}
            <div className="bg-[#151D32] border border-[#1E293B] rounded-[20px] p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">
                      {userData ? userData.fullName.split(" ")[0] : "AI Assistant"}
                    </h3>
                    {state === "responding" && (
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-[#22D3EE]"></motion.div>
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-[#22D3EE]"></motion.div>
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-[#22D3EE]"></motion.div>
                      </div>
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={avatarMessage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-[#94A3B8]"
                    >
                      {avatarMessage}
                    </motion.p>
                  </AnimatePresence>
                  
                  {voiceQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-[#0B0F1A] rounded-lg border border-[#1E293B]"
                    >
                      <p className="text-sm text-[#64748B] mb-1">You asked:</p>
                      <p className="text-white">"{voiceQuery}"</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Dynamic Content Area */}
          <div className="flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {state === "scanning" && (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#151D32] border border-[#1E293B] rounded-[20px] overflow-hidden flex-1 relative"
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#0B0F1A]/50 to-[#0B0F1A]/80">
                    <div className="relative">
                      {/* Face Detection Box */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-80 h-96 border-4 border-[#22D3EE] rounded-[20px] relative"
                      >
                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#22D3EE] rounded-tl-[20px]"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#22D3EE] rounded-tr-[20px]"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#22D3EE] rounded-bl-[20px]"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#22D3EE] rounded-br-[20px]"></div>
                        
                        {/* Scanning line */}
                        <motion.div
                          animate={{ y: [0, 384, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="absolute bottom-8 left-0 right-0 px-12">
                    <div className="bg-[#0B0F1A]/90 backdrop-blur-sm rounded-[20px] p-6 border border-[#1E293B]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold">Scanning Face...</span>
                        <span className="text-2xl font-mono font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
                          {scanProgress}%
                        </span>
                      </div>
                      <div className="h-3 bg-[#1E293B] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${scanProgress}%` }}
                          className="h-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6]"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {state === "manual-checkin" && (
                <motion.div
                  key="manual-checkin"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#151D32] border border-[#1E293B] rounded-[20px] p-12 flex-1 flex flex-col items-center justify-center"
                >
                  <div className="max-w-md w-full">
                    <h2 className="text-4xl font-bold mb-4 text-center">Manual Check-In</h2>
                    <p className="text-xl text-[#94A3B8] mb-8 text-center">
                      Enter your email or registration ID
                    </p>

                    {/* Method selector */}
                    <div className="flex items-center gap-4 mb-6">
                      <button
                        onClick={() => setManualMethod("email")}
                        className={`flex-1 px-6 py-4 rounded-[14px] font-medium flex items-center justify-center gap-2 transition-all ${
                          manualMethod === "email"
                            ? "bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] hover:opacity-90"
                            : "bg-[#0B0F1A] border border-[#1E293B] hover:border-[#22D3EE]"
                        }`}
                      >
                        <Mail className="w-5 h-5" />
                        Email
                      </button>
                      <button
                        onClick={() => setManualMethod("id")}
                        className={`flex-1 px-6 py-4 rounded-[14px] font-medium flex items-center justify-center gap-2 transition-all ${
                          manualMethod === "id"
                            ? "bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] hover:opacity-90"
                            : "bg-[#0B0F1A] border border-[#1E293B] hover:border-[#22D3EE]"
                        }`}
                      >
                        <Hash className="w-5 h-5" />
                        Registration ID
                      </button>
                    </div>

                    {/* Input field */}
                    <div className="mb-6">
                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && processManualCheckIn()}
                        placeholder={manualMethod === "email" ? "Enter your email address" : "Enter your registration ID"}
                        className="w-full px-6 py-4 rounded-[14px] bg-[#0B0F1A] border border-[#1E293B] focus:border-[#22D3EE] focus:outline-none text-lg"
                        autoFocus
                      />
                    </div>

                    {/* Check-in button */}
                    <button
                      onClick={processManualCheckIn}
                      disabled={!manualInput.trim()}
                      className="w-full px-8 py-4 rounded-[14px] bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      Check In
                    </button>
                  </div>
                </motion.div>
              )}

              {(state === "recognized" || state === "listening" || state === "responding") && userData && (
                <motion.div
                  key="recognized"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col gap-6 flex-1"
                >
                  {/* Controls */}
                  <div className="bg-[#151D32] border border-[#1E293B] rounded-[20px] p-6">
                    <h3 className="font-bold mb-4 text-xl">How can I help you?</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={state === "responding"}
                        className={`px-6 py-4 rounded-[14px] font-medium flex items-center justify-center gap-2 transition-all ${
                          isListening
                            ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                            : "bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] hover:opacity-90"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-5 h-5" />
                            Stop Listening
                          </>
                        ) : (
                          <>
                            <Mic className="w-5 h-5" />
                            Ask Question
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-6 py-4 rounded-[14px] border border-[#1E293B] hover:bg-[#1E293B] font-medium flex items-center justify-center gap-2 transition-all"
                      >
                        <X className="w-5 h-5" />
                        End Session
                      </button>
                    </div>
                  </div>

                  {/* Agenda & Recommendations */}
                  <div className="bg-[#151D32] border border-[#1E293B] rounded-[20px] p-6 flex-1 overflow-auto">
                    <h3 className="font-bold mb-4 text-xl">Your Schedule & Recommendations</h3>
                    
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {recommendations.length > 0 ? (
                          recommendations.map((rec, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-[#0B0F1A] border border-[#1E293B] rounded-[14px] p-5 hover:border-[#22D3EE] transition-all cursor-pointer"
                            >
                              <div className="flex items-start gap-4">
                                <div className="text-4xl">{rec.icon}</div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-bold text-lg">{rec.title}</h4>
                                    {rec.status && (
                                      <span className="px-3 py-1 bg-[#34D399] text-white text-xs rounded-full font-medium whitespace-nowrap">
                                        {rec.status}
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-2 text-sm text-[#94A3B8]">
                                    {rec.location && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span>{rec.location}</span>
                                      </div>
                                    )}
                                    {rec.time && (
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                        <span>{rec.time}</span>
                                      </div>
                                    )}
                                    {rec.speaker && (
                                      <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 flex-shrink-0" />
                                        <span>{rec.speaker}</span>
                                      </div>
                                    )}
                                    {rec.attendees && (
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 flex-shrink-0" />
                                        <span>{rec.attendees.join(", ")}</span>
                                      </div>
                                    )}
                                    {rec.description && (
                                      <p className="text-xs pt-1">{rec.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <>
                            <div className="bg-[#0B0F1A] border border-[#1E293B] rounded-[14px] p-5 hover:border-[#22D3EE] transition-all cursor-pointer">
                              <div className="flex items-center gap-4">
                                <Calendar className="w-10 h-10 text-[#22D3EE]" />
                                <div>
                                  <h4 className="font-bold text-lg">Event Schedule</h4>
                                  <p className="text-sm text-[#94A3B8]">View all sessions and events</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-[#0B0F1A] border border-[#1E293B] rounded-[14px] p-5 hover:border-[#22D3EE] transition-all cursor-pointer">
                              <div className="flex items-center gap-4">
                                <MapPin className="w-10 h-10 text-[#8B5CF6]" />
                                <div>
                                  <h4 className="font-bold text-lg">Venue Map</h4>
                                  <p className="text-sm text-[#94A3B8]">Navigate the expo floor</p>
                                </div>
                              </div>
                            </div>
                            <div className="bg-[#0B0F1A] border border-[#1E293B] rounded-[14px] p-5 hover:border-[#22D3EE] transition-all cursor-pointer">
                              <div className="flex items-center gap-4">
                                <Users className="w-10 h-10 text-[#34D399]" />
                                <div>
                                  <h4 className="font-bold text-lg">Networking</h4>
                                  <p className="text-sm text-[#94A3B8]">Connect with attendees</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1E293B] bg-[#0B0F1A]/80 backdrop-blur-sm py-4">
        <div className="container mx-auto px-8 text-center">
          <p className="text-sm text-[#64748B]">
            Powered by <span className="text-[#22D3EE]">TechnoCIT</span> & <span className="text-[#8B5CF6]">NFS Technologies</span>
          </p>
        </div>
      </div>
    </div>
  );
}