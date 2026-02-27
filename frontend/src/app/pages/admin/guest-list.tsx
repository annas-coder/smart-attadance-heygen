import { Link } from "react-router";
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  Monitor,
  BarChart3,
  Settings,
  Search,
  Download,
  Plus,
  MoreVertical,
  Home,
} from "lucide-react";

const guests = [
  {
    id: 1,
    name: "Arun Krishnan",
    email: "arun.krishnan@techcorp.com",
    company: "TechCorp Industries",
    badge: "VIP",
    status: "Checked In",
    avatar: "AK",
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    email: "sarah.m@financegroup.com",
    company: "Finance Group",
    badge: "General",
    status: "Registered",
    avatar: "SM",
  },
  {
    id: 3,
    name: "Ravi Menon",
    email: "ravi@clientpartners.ae",
    company: "Client Partners",
    badge: "General",
    status: "Face Captured",
    avatar: "RM",
  },
  {
    id: 4,
    name: "Priya Sharma",
    email: "priya.sharma@innovate.com",
    company: "Innovate Solutions",
    badge: "Speaker",
    status: "Checked In",
    avatar: "PS",
  },
  {
    id: 5,
    name: "James Wong",
    email: "james@productco.com",
    company: "Product Co",
    badge: "VIP",
    status: "Registered",
    avatar: "JW",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "Invited":
      return "bg-[#64748B] text-white";
    case "Registered":
      return "bg-[#FBBF24] text-white";
    case "Face Captured":
      return "bg-[#22D3EE] text-white";
    case "Checked In":
      return "bg-[#34D399] text-white";
    default:
      return "bg-gray-200 text-gray-800";
  }
}

function getBadgeColor(badge: string) {
  switch (badge) {
    case "VIP":
      return "bg-[#0F172A] text-white";
    case "Speaker":
      return "bg-[#FBBF24] text-[#0F172A]";
    case "General":
      return "bg-[#22D3EE] text-white";
    default:
      return "bg-gray-200 text-gray-800";
  }
}

export function GuestList() {
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
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#22D3EE]/10 text-[#22D3EE] font-medium"
          >
            <Users className="w-5 h-5" />
            <span>Guest List</span>
          </a>
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
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Guest List</h1>
          <p className="text-[#64748B]">
            Manage event attendees and track registration status
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-4 mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search guests..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]">
            <Download className="w-4 h-4" />
            Import CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90">
            <Plus className="w-4 h-4" />
            Add Guest
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[14px] border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">
                  Guest
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">
                  Company
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">
                  Badge Type
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-white font-medium">
                        {guest.avatar}
                      </div>
                      <span className="font-medium text-[#0F172A]">{guest.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#64748B]">{guest.email}</td>
                  <td className="px-6 py-4 text-[#64748B]">{guest.company}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(
                        guest.badge
                      )}`}
                    >
                      {guest.badge}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        guest.status
                      )}`}
                    >
                      {guest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1 hover:bg-[#E2E8F0] rounded">
                      <MoreVertical className="w-5 h-5 text-[#64748B]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-[#E2E8F0]">
            <p className="text-sm text-[#64748B]">
              Showing 1 to 5 of 2,847 guests
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]">
                Previous
              </button>
              <button className="px-4 py-2 rounded-lg bg-[#22D3EE] text-white">
                1
              </button>
              <button className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]">
                2
              </button>
              <button className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]">
                3
              </button>
              <button className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
