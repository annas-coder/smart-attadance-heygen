import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Users, Mail, UserCheck, Clock, ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { dashboard } from "../../../lib/api";

interface Stats {
  totalInvited: number;
  registered: number;
  checkedIn: number;
  pending: number;
}

interface Activity {
  _id: string;
  action: string;
  details: string;
  timestamp: string;
  guestId?: { fullName: string; email: string };
  eventId?: { name: string };
}

export function DashboardSimple() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    dashboard.getStats().then(setStats).catch(console.error);
    dashboard.getActivity(undefined, 10).then(setActivities).catch(console.error);
  }, []);

  const statCards = [
    {
      label: "Total Invited",
      value: stats?.totalInvited?.toLocaleString() ?? "...",
      change: stats ? `${stats.registered > 0 ? Math.round((stats.registered / stats.totalInvited) * 100) : 0}% registered` : "",
      icon: Mail,
      color: "from-[#22D3EE] to-[#8B5CF6]",
    },
    {
      label: "Registered",
      value: stats?.registered?.toLocaleString() ?? "...",
      change: stats ? `${stats.totalInvited > 0 ? Math.round((stats.registered / stats.totalInvited) * 100) : 0}% conversion` : "",
      icon: Users,
      color: "from-[#FBBF24] to-[#F59E0B]",
    },
    {
      label: "Checked In",
      value: stats?.checkedIn?.toLocaleString() ?? "...",
      change: stats ? `${stats.registered > 0 ? Math.round((stats.checkedIn / stats.registered) * 100) : 0}% attendance` : "",
      icon: UserCheck,
      color: "from-[#34D399] to-[#10B981]",
    },
    {
      label: "Pending",
      value: stats?.pending?.toLocaleString() ?? "...",
      change: "Awaiting response",
      icon: Clock,
      color: "from-[#64748B] to-[#475569]",
    },
  ];

  function getActivityColor(action: string) {
    switch (action) {
      case "checked_in": return "bg-[#34D399]";
      case "registered": return "bg-[#22D3EE]";
      case "invited": return "bg-[#FBBF24]";
      default: return "bg-[#64748B]";
    }
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Dashboard</h1>
          <p className="text-[#64748B]">Welcome back! Here's your event overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-[14px] border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-[#64748B] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-[#0F172A] mb-2">
                  {stat.value}
                </p>
                <p className="text-xs text-[#64748B]">{stat.change}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-6">
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/events"
              className="group flex items-center justify-between p-4 rounded-lg border border-[#E2E8F0] hover:border-[#22D3EE] hover:bg-[#22D3EE]/5 transition-all"
            >
              <div>
                <p className="font-medium text-[#0F172A] mb-1">Create Event</p>
                <p className="text-sm text-[#64748B]">Set up a new event</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#64748B] group-hover:text-[#22D3EE]" />
            </Link>
            <Link
              to="/admin/guests"
              className="group flex items-center justify-between p-4 rounded-lg border border-[#E2E8F0] hover:border-[#22D3EE] hover:bg-[#22D3EE]/5 transition-all"
            >
              <div>
                <p className="font-medium text-[#0F172A] mb-1">Manage Guests</p>
                <p className="text-sm text-[#64748B]">View and invite guests</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#64748B] group-hover:text-[#22D3EE]" />
            </Link>
            <Link
              to="/admin/settings"
              className="group flex items-center justify-between p-4 rounded-lg border border-[#E2E8F0] hover:border-[#22D3EE] hover:bg-[#22D3EE]/5 transition-all"
            >
              <div>
                <p className="font-medium text-[#0F172A] mb-1">Settings</p>
                <p className="text-sm text-[#64748B]">Configure preferences</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#64748B] group-hover:text-[#22D3EE]" />
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-[14px] border border-[#E2E8F0] p-6">
          <h2 className="text-lg font-bold text-[#0F172A] mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            {activities.length === 0 && (
              <p className="text-sm text-[#64748B]">No recent activity</p>
            )}
            {activities.map((act) => (
              <div key={act._id} className="flex items-center gap-3 py-2">
                <div className={`w-2 h-2 rounded-full ${getActivityColor(act.action)}`}></div>
                <p className="text-sm text-[#64748B] flex-1">{act.details}</p>
                <span className="ml-auto text-xs text-[#64748B]">
                  {timeAgo(act.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
