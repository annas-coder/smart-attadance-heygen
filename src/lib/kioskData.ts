import { AvatarOptions } from './avatarRenderer';

export interface Person {
  id: string;
  nm: string;
  f: string;
  dg: string;
  dp: string;
  rp: string;
  av: AvatarOptions;
  hl: string;
  hs: string;
  fl: string;
  bl: string;
  st: string;
  zn: string;
  ev: string;
  et: string;
  dr: string[];
  ms: string;
  photo: string;
}

export const NADIM_AVATAR: AvatarOptions = {
  bg: '#e8f4f8', skin: '#f5d0b0', shirt: '#2a7ba5', h: 'long', hc: '#2c1810', eye: '#4a7c59', lip: '#d4928a'
};

export const PEOPLE: Person[] = [
  {
    id: "EMP001", nm: "Arun Krishnan", f: "Arun", dg: "Sr. Software Engineer", dp: "Engineering", rp: "Priya Sharma",
    av: { bg: '#e0ecf4', skin: '#c8956c', shirt: '#2c5f8a', h: 'short', hc: '#1a1a1a', eye: '#3a2a1a', lip: '#a06050' },
    hl: "Hall A — Auditorium", hs: "Main stage · 500 seats", fl: "Ground Floor", bl: "Block A", st: "A-142", zn: "Zone B · Left", ev: "Tech Summit 2026", et: "10 AM–4 PM",
    dr: ["Main Lobby", "Left at Reception", "Glass Corridor", "Hall A Right"], ms: "Session 'Microservices at Scale' at 11:30 AM. Collect badge at registration.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: "EMP024", nm: "Sarah Mitchell", f: "Sarah", dg: "Product Manager", dp: "Product", rp: "James Wong",
    av: { bg: '#ede0f0', skin: '#f5d0b0', shirt: '#6b3a7d', h: 'wavy', hc: '#5a3825', eye: '#4a7c59', lip: '#d4928a' },
    hl: "Hall C — Board Room", hs: "Executive · 30 seats", fl: "3rd Floor", bl: "Block B Tower", st: "C-08", zn: "Zone A · Center", ev: "Q1 Strategy Review", et: "9:30 AM–12 PM",
    dr: ["Elevator to 3F", "Exit Right", "End of Corridor", "Board Room C"], ms: "Strategy deck shared to email. Coffee at 9:15 AM.",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: "VIS-087", nm: "Ravi Menon", f: "Ravi", dg: "Visitor · Client", dp: "TechNova Inc.", rp: "Host: Anjali Desai",
    av: { bg: '#dff0ec', skin: '#b87a4a', shirt: '#1a6b5a', h: 'short', hc: '#111', eye: '#2a1a0a', lip: '#905040' },
    hl: "Hall B — Conf Room 3", hs: "Mid-size · 50 seats", fl: "2nd Floor", bl: "Block A", st: "B3-22", zn: "Zone C · Visitor", ev: "Partnership Discussion", et: "11 AM–1 PM",
    dr: ["Visitor Badge", "Elevator to 2F", "Turn Right", "3rd Room Left"], ms: "Host Anjali notified. Badge at reception.",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: "EMP042", nm: "Priya Sharma", f: "Priya", dg: "Engineering Director", dp: "Engineering", rp: "CTO Office",
    av: { bg: '#e4e0f0', skin: '#d4a07a', shirt: '#4a2d6b', h: 'bun', hc: '#1a1010', eye: '#3a2a1a', lip: '#b87060' },
    hl: "Hall A — Auditorium", hs: "Main stage · 500 seats", fl: "Ground Floor", bl: "Block A", st: "A-001", zn: "Zone A · VIP", ev: "Tech Summit 2026", et: "10 AM–4 PM",
    dr: ["Main Lobby", "VIP Entrance Left", "Front Row Direct"], ms: "Opening keynote at 10 AM. Speaker lounge via side door.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: "EMP055", nm: "James Wong", f: "James", dg: "VP of Product", dp: "Product", rp: "CEO Office",
    av: { bg: '#e0e4f0', skin: '#e8c8a0', shirt: '#2a3a5a', h: 'short', hc: '#2a2018', eye: '#3a4a2a', lip: '#b08070', gl: true },
    hl: "Hall C — Board Room", hs: "Executive · 30 seats", fl: "3rd Floor", bl: "Block B Tower", st: "C-01", zn: "Head of Table", ev: "Q1 Strategy Review", et: "9:30 AM–12 PM",
    dr: ["Exec Elevator to 3F", "Turn Right", "Board Room C"], ms: "Chairing Q1 review. Deck loaded on display.",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: "EMP061", nm: "Anita Desai", f: "Anita", dg: "UX Design Lead", dp: "Design", rp: "Priya Sharma",
    av: { bg: '#f0e0e8', skin: '#c89060', shirt: '#8a3a5a', h: 'curly', hc: '#1a1010', eye: '#3a2a1a', lip: '#a06050' },
    hl: "Hall D — Design Lab", hs: "Workshop · 40 seats", fl: "1st Floor", bl: "Block A", st: "D-12", zn: "Workshop Area", ev: "Design Sprint", et: "2 PM–5 PM",
    dr: ["Main Lobby", "Right to Wing A", "1F Stairs", "Design Lab D"], ms: "Workshop materials at your station. Whiteboards prepped.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: "EMP078", nm: "David Chen", f: "David", dg: "Data Scientist", dp: "Analytics", rp: "VP Data",
    av: { bg: '#e0f0ec', skin: '#f0d0a8', shirt: '#2a5a4a', h: 'buzz', hc: '#1a1a1a', eye: '#2a3a1a', lip: '#c08070' },
    hl: "Hall A — Auditorium", hs: "Main stage · 500 seats", fl: "Ground Floor", bl: "Block A", st: "A-088", zn: "Zone C · Right", ev: "Tech Summit 2026", et: "10 AM–4 PM",
    dr: ["Main Lobby", "Left at Reception", "Glass Corridor", "Hall A"], ms: "Talk 'AI in Production' at 2 PM. Speaker prep room available.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: "EMP090", nm: "Fatima Al-Said", f: "Fatima", dg: "Security Architect", dp: "InfoSec", rp: "CISO",
    av: { bg: '#e0e0f0', skin: '#d4a878', shirt: '#3a2a5a', h: 'long', hc: '#111', eye: '#2a1a0a', lip: '#a07060' },
    hl: "Hall E — Secure Room", hs: "Restricted · 20 seats", fl: "Basement B1", bl: "Block B Tower", st: "E-05", zn: "Cleared Personnel", ev: "Security Briefing", et: "8:30–10 AM",
    dr: ["Badge Scan B1", "Elevator to B1", "Security Corridor", "Room E"], ms: "Classified briefing. Store devices in lockers outside.",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: "INT-003", nm: "Tom Baker", f: "Tom", dg: "Summer Intern", dp: "Engineering", rp: "Arun Krishnan",
    av: { bg: '#e0f0e8', skin: '#f5d8b8', shirt: '#2a6a4a', h: 'short', hc: '#6a4a2a', eye: '#4a6a3a', lip: '#c89080' },
    hl: "Hall A — Auditorium", hs: "Main stage · 500 seats", fl: "Ground Floor", bl: "Block A", st: "A-200", zn: "Zone D · Back", ev: "Tech Summit 2026", et: "10 AM–4 PM",
    dr: ["Main Lobby", "Left at Reception", "Glass Corridor", "Hall A Back"], ms: "Welcome! Sit with engineering. Mentor Arun in A-142.",
    photo: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop&crop=face"
  },
  {
    id: "VIS-102", nm: "Lisa Park", f: "Lisa", dg: "Keynote Speaker", dp: "External · AI Labs", rp: "Host: Priya Sharma",
    av: { bg: '#f0e0e8', skin: '#f0c8a0', shirt: '#7a2a5a', h: 'long', hc: '#3a2014', eye: '#4a3a2a', lip: '#d4928a' },
    hl: "Hall A — Auditorium", hs: "Main stage · 500 seats", fl: "Ground Floor", bl: "Block A", st: "STAGE", zn: "Speaker Podium", ev: "Tech Summit 2026", et: "10 AM–4 PM",
    dr: ["VIP Entrance", "Speaker Lounge", "Stage Access Door"], ms: "Keynote at 10:15 AM. AV team mic at 9:50 in speaker lounge.",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face"
  }
];

export const RESPONSES: Record<string, string> = {
  schedule: "Today: Tech Summit Hall A (10AM–4PM), Q1 Review Hall C (9:30–12PM), Partnership Hall B (11AM–1PM), Design Sprint Hall D (2–5PM), Security Briefing Hall E (8:30–10AM).",
  hall: "Hall A: Auditorium GF Block A. Hall B: Conf 3 2F Block A. Hall C: Board Room 3F Block B. Hall D: Design Lab 1F Block A. Hall E: Secure B1 Block B.",
  wifi: "Guest: TechNFS-Guest / Welcome2026. Staff: TechNFS-Secure via SSO.",
  parking: "Visitors: Lot B main entrance. Staff: basement with access card.",
  food: "Cafeteria 1F Block A, 8AM–6PM. Coffee lounges every floor.",
  restroom: "Near elevators every floor. Accessible on ground floor.",
  default: "I can help with schedules, halls, WiFi, parking, dining. What do you need?"
};

const GENERAL_CHAT_URL = 'https://technocit.app.n8n.cloud/webhook/suntory/general-chat';
const USER_CHAT_URL = 'https://technocit.app.n8n.cloud/webhook/suntory/user-chat';

export async function fetchGeneralChatResponse(message: string): Promise<string> {
  const res = await fetch(GENERAL_CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return typeof json === 'string' ? json : (json.output ?? json.message ?? json.response ?? json.text ?? text);
  } catch {
    return text;
  }
}

export async function fetchUserChatResponse(message: string, user: string): Promise<string> {
  const res = await fetch(USER_CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, user }),
  });
  if (!res.ok) {
    throw new Error(`User chat API error: ${res.status}`);
  }
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return typeof json === 'string' ? json : (json.output ?? json.message ?? json.response ?? json.text ?? text);
  } catch {
    return text;
  }
}

export function getResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.match(/schedul|event|today/)) return RESPONSES.schedule;
  if (q.match(/hall|room|where|locat/)) return RESPONSES.hall;
  if (q.match(/wifi|internet|password/)) return RESPONSES.wifi;
  if (q.match(/park|car/)) return RESPONSES.parking;
  if (q.match(/food|eat|coffee|lunch/)) return RESPONSES.food;
  if (q.match(/restroom|bath|toilet/)) return RESPONSES.restroom;
  return RESPONSES.default;
}
