import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { events as eventsApi } from "../../../lib/api";

interface Event {
  _id: string;
  name: string;
  date: string;
  location: string;
  description?: string;
  totalInvited: number;
  registered: number;
  checkedIn: number;
  status: "upcoming" | "ongoing" | "completed";
}

export function Events() {
  const [eventList, setEventList] = useState<Event[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await eventsApi.list();
      setEventList(data);
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  }

  const handleCreateEvent = async () => {
    try {
      await eventsApi.create(newEvent);
      setIsCreateDialogOpen(false);
      setNewEvent({ name: "", date: "", location: "", description: "" });
      loadEvents();
    } catch (err) {
      console.error("Failed to create event:", err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventsApi.delete(id);
      loadEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-[#FBBF24] text-white";
      case "ongoing":
        return "bg-[#34D399] text-white";
      case "completed":
        return "bg-[#64748B] text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Events</h1>
            <p className="text-[#64748B]">
              Create and manage events for your organization
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {eventList.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-[14px] border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-[#0F172A]">
                      {event.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-[#F8FAFC] rounded-lg">
                  <MoreVertical className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E2E8F0]">
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Total Invited</p>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {event.totalInvited.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Registered</p>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {event.registered.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {event.totalInvited > 0
                      ? Math.round((event.registered / event.totalInvited) * 100)
                      : 0}
                    % conversion
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Checked In</p>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {event.checkedIn.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {event.registered > 0
                      ? Math.round((event.checkedIn / event.registered) * 100)
                      : 0}
                    % attendance
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex gap-3">
                <button className="flex-1 px-4 py-2 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Manage Guests
                </button>
                <button className="px-4 py-2 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteEvent(event._id)}
                  className="px-4 py-2 rounded-full border border-[#FB7185] text-[#FB7185] hover:bg-[#FB7185]/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {isCreateDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[14px] p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-[#0F172A] mb-4">
                Create New Event
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-name">Event Name</Label>
                  <Input
                    id="event-name"
                    value={newEvent.name}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, name: e.target.value })
                    }
                    placeholder="Enter event name"
                  />
                </div>
                <div>
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    placeholder="Enter event location"
                  />
                </div>
                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1 px-4 py-2 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90"
                  disabled={!newEvent.name || !newEvent.date || !newEvent.location}
                >
                  Create Event
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
