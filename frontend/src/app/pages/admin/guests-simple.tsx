import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import {
  Search,
  Plus,
  Upload,
  Mail,
  MoreVertical,
  X,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { guests as guestsApi, events as eventsApi } from "../../../lib/api";

interface Guest {
  _id: string;
  fullName: string;
  email: string;
  company: string;
  badge: "VIP" | "Speaker" | "General";
  status: "Invited" | "Registered" | "FaceCaptured" | "CheckedIn";
}

export function GuestsSimple() {
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [eventId, setEventId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newGuest, setNewGuest] = useState({
    fullName: "",
    email: "",
    company: "",
    badge: "General" as const,
  });

  const [bulkEmails, setBulkEmails] = useState("");

  useEffect(() => {
    eventsApi
      .list()
      .then((evts) => {
        if (evts.length > 0) {
          setEventId(evts[0]._id);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!eventId) return;
    loadGuests();
  }, [eventId, searchTerm]);

  async function loadGuests() {
    try {
      const data = await guestsApi.list(eventId, {
        search: searchTerm || undefined,
      });
      setGuestList(data.guests);
    } catch (err) {
      console.error("Failed to load guests:", err);
    }
  }

  const handleAddGuest = async () => {
    try {
      await guestsApi.add(eventId, {
        fullName: newGuest.fullName,
        email: newGuest.email,
        company: newGuest.company,
        badge: newGuest.badge,
      });
      setShowAddDialog(false);
      setNewGuest({ fullName: "", email: "", company: "", badge: "General" });
      loadGuests();
    } catch (err) {
      console.error("Failed to add guest:", err);
    }
  };

  const handleBulkInvite = async () => {
    const emails = bulkEmails
      .split("\n")
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    if (emails.length === 0) return;

    try {
      await guestsApi.bulkInvite(eventId, emails);
      setShowBulkDialog(false);
      setBulkEmails("");
      loadGuests();
    } catch (err) {
      console.error("Failed to bulk invite:", err);
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await guestsApi.uploadCsv(eventId, file);
      loadGuests();
    } catch (err) {
      console.error("CSV upload failed:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Invited": return "bg-[#64748B] text-white";
      case "Registered": return "bg-[#FBBF24] text-white";
      case "FaceCaptured": return "bg-[#22D3EE] text-white";
      case "CheckedIn": return "bg-[#34D399] text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "FaceCaptured": return "Face Captured";
      case "CheckedIn": return "Checked In";
      default: return status;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "VIP": return "bg-[#0F172A] text-white";
      case "Speaker": return "bg-[#FBBF24] text-[#0F172A]";
      case "General": return "bg-[#22D3EE] text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Guest Management
          </h1>
          <p className="text-[#64748B]">
            Onboard and manage event attendees
          </p>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE]"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button
            onClick={() => setShowBulkDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
          >
            <Mail className="w-4 h-4" />
            Bulk Invite
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Add Guest
          </Button>
        </div>

        <div className="bg-white rounded-[14px] border border-[#E2E8F0] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">Guest</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">Company</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">Badge</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#64748B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guestList.map((guest) => (
                <tr
                  key={guest._id}
                  className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]"
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-white font-medium">
                        {getInitials(guest.fullName)}
                      </div>
                      <span className="font-medium text-[#0F172A]">
                        {guest.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#64748B]">{guest.email}</td>
                  <td className="px-6 py-4 text-[#64748B]">{guest.company}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(guest.badge)}`}>
                      {guest.badge}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.status)}`}>
                      {getStatusLabel(guest.status)}
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

          <div className="px-6 py-4 flex items-center justify-between border-t border-[#E2E8F0]">
            <p className="text-sm text-[#64748B]">
              Showing {guestList.length} guests
            </p>
          </div>
        </div>

        {showAddDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[14px] p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#0F172A]">Add Guest</h2>
                <button onClick={() => setShowAddDialog(false)} className="p-2 hover:bg-[#F8FAFC] rounded-lg">
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="guest-name">Full Name</Label>
                  <Input id="guest-name" value={newGuest.fullName} onChange={(e) => setNewGuest({ ...newGuest, fullName: e.target.value })} placeholder="Enter guest name" />
                </div>
                <div>
                  <Label htmlFor="guest-email">Email</Label>
                  <Input id="guest-email" type="email" value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} placeholder="Enter email address" />
                </div>
                <div>
                  <Label htmlFor="guest-company">Company</Label>
                  <Input id="guest-company" value={newGuest.company} onChange={(e) => setNewGuest({ ...newGuest, company: e.target.value })} placeholder="Enter company name" />
                </div>
                <div>
                  <Label htmlFor="guest-badge">Badge Type</Label>
                  <select
                    id="guest-badge"
                    value={newGuest.badge}
                    onChange={(e) => setNewGuest({ ...newGuest, badge: e.target.value as "VIP" | "Speaker" | "General" })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE]"
                  >
                    <option value="General">General</option>
                    <option value="VIP">VIP</option>
                    <option value="Speaker">Speaker</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setShowAddDialog(false)} className="flex-1 px-4 py-2 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]">
                  Cancel
                </Button>
                <Button onClick={handleAddGuest} className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90" disabled={!newGuest.fullName || !newGuest.email}>
                  Add & Send Invite
                </Button>
              </div>
            </div>
          </div>
        )}

        {showBulkDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[14px] p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#0F172A]">Bulk Email Invite</h2>
                <button onClick={() => setShowBulkDialog(false)} className="p-2 hover:bg-[#F8FAFC] rounded-lg">
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-emails">Email Addresses</Label>
                  <Textarea
                    id="bulk-emails"
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    placeholder={"Enter email addresses (one per line)\njohn.doe@example.com\njane.smith@company.com"}
                    rows={8}
                  />
                  <p className="text-xs text-[#64748B] mt-2">
                    Enter one email address per line.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setShowBulkDialog(false)} className="flex-1 px-4 py-2 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]">
                  Cancel
                </Button>
                <Button onClick={handleBulkInvite} className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90" disabled={!bulkEmails.trim()}>
                  Send Invites
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
