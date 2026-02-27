import { Link, useLocation } from "react-router";
import { LayoutDashboard, Calendar, Users, Settings, Home } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/events", icon: Calendar, label: "Events" },
    { path: "/admin/guests", icon: Users, label: "Guests" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

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
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? "bg-[#22D3EE]/10 text-[#22D3EE] font-medium"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-60">{children}</div>
    </div>
  );
}
