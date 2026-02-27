import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  Building2,
  MapPin,
  PinIcon,
  Calendar,
  ArrowLeft,
} from "lucide-react";

const users = [
  {
    id: 1,
    name: "Arun Krishnan",
    role: "Sr. Software Engineer",
    designation: "Senior Software Engineer",
    company: "TechCorp Industries",
    department: "Engineering",
    reportsTo: "Priya Sharma",
    hall: "Hall A — Auditorium",
    location: "Ground Floor, Building A",
    seat: "A-142",
    zone: "VIP Section",
    session: "Microservices at Scale",
    sessionTime: "11:30 AM - 12:30 PM",
    capacity: "800 seats",
    checkInTime: "6:32 PM",
    avatar: "AK",
    greeting:
      "Welcome Arun! Good evening. Your hall is Hall A — Auditorium, Ground Floor. Your session 'Microservices at Scale' starts at 11:30 AM. Need anything? Just ask!",
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    role: "Product Manager",
    designation: "Senior Product Manager",
    company: "Finance Group",
    department: "Product",
    reportsTo: "James Wong",
    hall: "Hall B — Exhibition",
    location: "Ground Floor, Building A",
    seat: "B-234",
    zone: "General",
    session: "Product Innovation in FinTech",
    sessionTime: "2:00 PM - 3:00 PM",
    capacity: "500 seats",
    checkInTime: "6:45 PM",
    avatar: "SM",
    greeting:
      "Hi Sarah! Welcome to FutureFin Expo. You're assigned to Hall B on the Ground Floor. Your session on Product Innovation starts at 2 PM. Enjoy the event!",
  },
  {
    id: 3,
    name: "Ravi Menon",
    role: "Visitor · Client Partner",
    designation: "Client Partner",
    company: "Client Partners LLC",
    department: "Business Development",
    reportsTo: "David Chen",
    hall: "Meeting Room 3",
    location: "2nd Floor, Building B",
    seat: "M3-12",
    zone: "Meeting Area",
    session: "Client Networking Session",
    sessionTime: "4:30 PM - 5:30 PM",
    capacity: "30 seats",
    checkInTime: "7:02 PM",
    avatar: "RM",
    greeting:
      "Welcome Ravi! Your meeting room is on the 2nd floor, Building B. The client networking session begins at 4:30 PM. Let me know if you need directions!",
  },
  {
    id: 4,
    name: "Priya Sharma",
    role: "Engineering Director",
    designation: "Director of Engineering",
    company: "Innovate Solutions",
    department: "Engineering",
    reportsTo: "Lisa Park",
    hall: "Hall A — Auditorium",
    location: "Ground Floor, Building A",
    seat: "A-015",
    zone: "Speaker Area",
    session: "Keynote: Future of AI",
    sessionTime: "6:00 PM - 7:00 PM",
    capacity: "800 seats",
    checkInTime: "5:15 PM",
    avatar: "PS",
    greeting:
      "Welcome Priya! As a keynote speaker, you're in Hall A, Speaker Area. Your session starts at 6 PM. The AV team is ready to assist you!",
  },
  {
    id: 5,
    name: "James Wong",
    role: "VP of Product",
    designation: "Vice President of Product",
    company: "Product Co",
    department: "Product & Strategy",
    reportsTo: "CEO",
    hall: "VIP Lounge",
    location: "2nd Floor, Building A",
    seat: "VIP-08",
    zone: "VIP Lounge",
    session: "Executive Roundtable",
    sessionTime: "5:00 PM - 6:00 PM",
    capacity: "20 seats",
    checkInTime: "4:58 PM",
    avatar: "JW",
    greeting:
      "Good evening James! The VIP Lounge is on the 2nd floor. Your executive roundtable starts at 5 PM. Complimentary refreshments are available.",
  },
  {
    id: 6,
    name: "Anita Desai",
    role: "UX Design Lead",
    designation: "Lead UX Designer",
    company: "Design Studio",
    department: "Design",
    reportsTo: "Sarah Mitchell",
    hall: "Workshop Room 1",
    location: "1st Floor, Building B",
    seat: "W1-22",
    zone: "Workshop Area",
    session: "UX Design Workshop",
    sessionTime: "3:00 PM - 4:30 PM",
    capacity: "40 seats",
    checkInTime: "6:20 PM",
    avatar: "AD",
    greeting:
      "Hi Anita! Your workshop room is on the 1st floor, Building B. The UX Design Workshop begins at 3 PM. Materials are ready at your seat!",
  },
  {
    id: 7,
    name: "David Chen",
    role: "Data Scientist",
    designation: "Lead Data Scientist",
    company: "AI Corp",
    department: "Data Science",
    reportsTo: "Priya Sharma",
    hall: "Hall C — Tech Lab",
    location: "1st Floor, Building A",
    seat: "C-089",
    zone: "Lab Section",
    session: "Machine Learning Live Demo",
    sessionTime: "1:00 PM - 2:30 PM",
    capacity: "150 seats",
    checkInTime: "7:15 PM",
    avatar: "DC",
    greeting:
      "Welcome David! Hall C Tech Lab is on the 1st floor. Your ML demo session is at 1 PM. Lab equipment is set up and ready!",
  },
  {
    id: 8,
    name: "Fatima Al-Said",
    role: "Security Architect",
    designation: "Principal Security Architect",
    company: "SecureNet",
    department: "Security",
    reportsTo: "James Wong",
    hall: "Conference Room A",
    location: "3rd Floor, Building A",
    seat: "CR-A05",
    zone: "Conference Area",
    session: "Cybersecurity Panel",
    sessionTime: "10:00 AM - 11:30 AM",
    capacity: "60 seats",
    checkInTime: "6:55 PM",
    avatar: "FA",
    greeting:
      "Welcome Fatima! Conference Room A is on the 3rd floor. The Cybersecurity Panel starts at 10 AM. Security briefing materials are at your seat.",
  },
  {
    id: 9,
    name: "Tom Baker",
    role: "Summer Intern",
    designation: "Engineering Intern",
    company: "TechCorp Industries",
    department: "Engineering",
    reportsTo: "Arun Krishnan",
    hall: "Hall B — Exhibition",
    location: "Ground Floor, Building A",
    seat: "B-456",
    zone: "General",
    session: "Intern Showcase",
    sessionTime: "12:00 PM - 1:00 PM",
    capacity: "500 seats",
    checkInTime: "7:30 PM",
    avatar: "TB",
    greeting:
      "Hi Tom! Welcome to your first expo! Hall B is on the ground floor. Your intern showcase is at noon. Enjoy the experience!",
  },
  {
    id: 10,
    name: "Lisa Park",
    role: "Keynote Speaker",
    designation: "CEO & Founder",
    company: "FinTech Innovations",
    department: "Executive",
    reportsTo: "Board of Directors",
    hall: "Main Stage — Auditorium",
    location: "Ground Floor, Building A",
    seat: "STAGE-01",
    zone: "Speaker Platform",
    session: "Opening Keynote",
    sessionTime: "9:00 AM - 10:00 AM",
    capacity: "800 seats",
    checkInTime: "5:00 PM",
    avatar: "LP",
    greeting:
      "Welcome Lisa! You're our opening keynote speaker. Main stage is ready in Hall A. Your session begins at 9 AM. Green room access is available.",
  },
];

export function PersonalizedAvatar() {
  const [selectedUser, setSelectedUser] = useState<(typeof users)[0] | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleUserSelect = (user: (typeof users)[0]) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setSelectedUser(user);
      setShowResult(true);
    }, 2000);
  };

  const handleBack = () => {
    setShowResult(false);
    setSelectedUser(null);
  };

  if (isScanning) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-[#0B0F1A]/95 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="text-center">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(251, 191, 36, 0.4)",
                "0 0 60px rgba(251, 191, 36, 0.6)",
                "0 0 20px rgba(251, 191, 36, 0.4)",
              ],
            }}
            transition={{ duration: 0.85, repeat: Infinity }}
            className="w-48 h-48 rounded-full border-4 border-[#FBBF24] mx-auto mb-6 flex items-center justify-center relative overflow-hidden"
          >
            {selectedUser && (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-white text-4xl font-bold opacity-80">
                {selectedUser.avatar}
              </div>
            )}
            {/* Scan line */}
            <motion.div
              animate={{ top: ["0%", "100%"] }}
              transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent"
            />
          </motion.div>
          <p className="text-xl font-bold text-[#FBBF24] mb-2">
            Identifying face...
          </p>
          <p className="text-[#94A3B8]">Please hold still</p>
        </div>
      </motion.div>
    );
  }

  if (showResult && selectedUser) {
    return (
      <div className="grid grid-cols-[360px_1fr] gap-6 h-[calc(100vh-250px)]">
        {/* Left Panel - Avatar */}
        <div className="bg-[#151D32] rounded-[14px] border border-[#1E293B] p-6 flex flex-col">
          <div className="flex flex-col items-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative mb-4"
            >
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] p-1">
                <div className="w-full h-full rounded-full bg-[#101728] flex items-center justify-center">
                  <Volume2 className="w-12 h-12 text-[#22D3EE]" />
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-1 h-8 mb-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["8px", "20px", "8px"] }}
                  transition={{
                    duration: 0.45,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                  className="w-1 bg-[#22D3EE] rounded-full"
                />
              ))}
            </div>

            <p className="text-[#94A3B8] font-medium">Ava · Virtual Assistant</p>
          </div>

          {/* Speech Bubble */}
          <div className="bg-[#101728] border-t-2 border-gradient-to-r from-[#22D3EE] to-[#8B5CF6] rounded-lg p-4 mb-6 flex-1">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-sm text-white leading-relaxed"
            >
              {selectedUser.greeting}
            </motion.p>
          </div>

          {/* Quick Ask Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {["Where is coffee?", "WiFi details", "Parking info", "Full schedule"].map(
              (text, idx) => (
                <button
                  key={idx}
                  className="px-3 py-2 rounded-full bg-[#101728] border border-[#1E293B] text-xs text-[#94A3B8] hover:border-[#22D3EE] hover:text-white transition-colors"
                >
                  {text}
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Panel - Info */}
        <div className="overflow-y-auto space-y-4">
          {/* Profile Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#151D32] rounded-[14px] border border-[#1E293B] p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.avatar}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedUser.name}
                </h2>
                <p className="text-[#94A3B8]">{selectedUser.designation}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="px-4 py-1.5 rounded-full bg-[#34D399] text-white font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                CHECKED IN · {selectedUser.checkInTime}
              </div>
            </div>
            <div className="text-sm text-[#94A3B8] space-y-1">
              <p>ID: FF2026-{selectedUser.id.toString().padStart(4, "0")}</p>
              <p>Department: {selectedUser.department}</p>
              <p>Reports to: {selectedUser.reportsTo}</p>
            </div>
          </motion.div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-[#151D32] rounded-[14px] border border-[#1E293B] p-5"
            >
              <div className="w-10 h-10 rounded-lg bg-[#22D3EE]/20 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-[#22D3EE]" />
              </div>
              <p className="text-xs text-[#64748B] font-medium mb-1">HALL</p>
              <p className="font-bold text-white mb-1">{selectedUser.hall}</p>
              <p className="text-xs text-[#94A3B8]">{selectedUser.capacity}</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="bg-[#151D32] rounded-[14px] border border-[#1E293B] p-5"
            >
              <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <p className="text-xs text-[#64748B] font-medium mb-1">LOCATION</p>
              <p className="font-bold text-white mb-1">{selectedUser.location}</p>
              <p className="text-xs text-[#94A3B8]">Building entrance</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-[#151D32] rounded-[14px] border border-[#1E293B] p-5"
            >
              <div className="w-10 h-10 rounded-lg bg-[#34D399]/20 flex items-center justify-center mb-3">
                <PinIcon className="w-5 h-5 text-[#34D399]" />
              </div>
              <p className="text-xs text-[#64748B] font-medium mb-1">SEAT</p>
              <p className="font-bold text-white mb-1">{selectedUser.seat}</p>
              <p className="text-xs text-[#94A3B8]">{selectedUser.zone}</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="bg-[#151D32] rounded-[14px] border border-[#1E293B] p-5"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FBBF24]/20 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5 text-[#FBBF24]" />
              </div>
              <p className="text-xs text-[#64748B] font-medium mb-1">EVENT</p>
              <p className="font-bold text-white mb-1">{selectedUser.session}</p>
              <p className="text-xs text-[#94A3B8]">{selectedUser.sessionTime}</p>
            </motion.div>
          </div>

          {/* Directions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-[#151D32] rounded-[14px] border border-[#1E293B] p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#22D3EE]/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#22D3EE]" />
              </div>
              <p className="font-bold text-white">DIRECTIONS</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "① Main Lobby",
                "② Left at Reception",
                "③ Glass Corridor",
                "④ " + selectedUser.hall.split("—")[0].trim(),
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-full bg-[#101728] border border-[#1E293B] text-sm text-[#94A3B8]"
                >
                  {step}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Back Button */}
          <button
            onClick={handleBack}
            className="w-full py-3 rounded-full border border-[#1E293B] text-[#94A3B8] hover:border-[#22D3EE] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to list
          </button>
        </div>
      </div>
    );
  }

  // User Grid
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">
          <span className="text-white">Select to </span>
          <span className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">
            Check In
          </span>
        </h2>
        <p className="text-[#94A3B8]">Tap a person to simulate face recognition</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {users.map((user, idx) => (
          <motion.button
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => handleUserSelect(user)}
            className="bg-[#151D32] border border-[#1E293B] rounded-[14px] p-4 hover:-translate-y-1 hover:border-[#22D3EE] hover:shadow-lg hover:shadow-[#22D3EE]/20 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 border-2 border-[#1E293B]">
              {user.avatar}
            </div>
            <p className="text-sm font-bold text-white mb-1 truncate">
              {user.name}
            </p>
            <p className="text-xs text-[#94A3B8] truncate">{user.role}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
