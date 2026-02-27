import { Link } from "react-router";
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  Monitor,
  BarChart3,
  Settings,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Home,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const attendanceData = [
  { time: "4 PM", checkIns: 120 },
  { time: "5 PM", checkIns: 450 },
  { time: "6 PM", checkIns: 780 },
  { time: "7 PM", checkIns: 1200 },
  { time: "8 PM", checkIns: 1520 },
  { time: "9 PM", checkIns: 1680 },
  { time: "10 PM", checkIns: 1750 },
];

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans']">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-60 bg-white border-r border-[#E2E8F0] p-4">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 text-[#0F172A] mb-2">
            <Home className="w-5 h-5" />
          </Link>
          <h2 className="text-lg font-bold text-[#0F172A]">FutureFin Expo</h2>
          <p className="text-xs text-[#64748B] font-mono">ADMIN PORTAL</p>
        </div>

        <nav className="space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#22D3EE]/10 text-[#22D3EE] font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <Link
            to="/admin/guests"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <Users className="w-5 h-5" />
            <span>Guest List</span>
          </Link>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <Mail className="w-5 h-5" />
            <span>Invitations</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <FileText className="w-5 h-5" />
            <span>Knowledge Base</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <Monitor className="w-5 h-5" />
            <span>Kiosks</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Analytics</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-60 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Dashboard</h1>
          <p className="text-[#64748B]">Real-time event overview and statistics</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#64748B] font-medium">Total Invited</p>
              <div className="flex items-center gap-1 text-xs text-[#22D3EE]">
                <ArrowUp className="w-3 h-3" />
                <span>12%</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">3,200</p>
            <p className="text-xs text-[#64748B]">+384 this week</p>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#64748B] font-medium">Registered</p>
              <div className="flex items-center gap-1 text-xs text-[#FBBF24]">
                <TrendingUp className="w-3 h-3" />
                <span>8%</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">2,847</p>
            <p className="text-xs text-[#64748B]">89% conversion</p>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#64748B] font-medium">Checked In</p>
              <div className="flex items-center gap-1 text-xs text-[#34D399]">
                <ArrowUp className="w-3 h-3" />
                <span>Live</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">1,756</p>
            <p className="text-xs text-[#64748B]">62% attendance</p>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[#64748B] font-medium">Pending</p>
              <div className="flex items-center gap-1 text-xs text-[#FB7185]">
                <ArrowDown className="w-3 h-3" />
                <span>3%</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0F172A] mb-1">353</p>
            <p className="text-xs text-[#64748B]">Not responded</p>
          </div>
        </div>

        {/* Live Attendance Chart */}
        <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-6 mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">
              Live Attendance
            </h3>
            <p className="text-sm text-[#64748B]">Real-time check-in tracking</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="time"
                stroke="#64748B"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#64748B" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="checkIns"
                stroke="#22D3EE"
                strokeWidth={3}
                dot={{ fill: "#22D3EE", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6">
          <button className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white rounded-full py-3 px-6 font-medium hover:opacity-90 transition-opacity">
            Create Event
          </button>
          <button className="bg-white border border-[#E2E8F0] text-[#0F172A] rounded-full py-3 px-6 font-medium hover:bg-[#F8FAFC] transition-colors">
            Send Invitations
          </button>
          <button className="bg-white border border-[#E2E8F0] text-[#0F172A] rounded-full py-3 px-6 font-medium hover:bg-[#F8FAFC] transition-colors">
            View Live Feed
          </button>
        </div>
      </div>
    </div>
  );
}
