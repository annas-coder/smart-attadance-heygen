import { Link, useSearchParams } from "react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Home, Download, Calendar, Share2, AlertCircle } from "lucide-react";
import { registration, kiosk, resolveUploadUrl } from "../../../lib/api";
import { REGISTRATION_HEADER_EVENT_TITLE } from "../../../lib/registrationConstants";
import {
  downloadTicketPdf,
  downloadEventCalendar,
  shareTicket,
} from "../../../lib/ticketActions";
import {
  mapApiGuestToTicketDisplay,
  ticketDisplayToSharePayload,
  type TicketDisplay,
} from "../../../lib/ticketDisplay";
import { DigitalTicketCard } from "../../components/registration/digital-ticket-card";

export function ViewTicket() {
  const ticketCardRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const [searchMethod, setSearchMethod] = useState<"email" | "id">("email");
  const [searchValue, setSearchValue] = useState("");
  const [ticketData, setTicketData] = useState<TicketDisplay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTicket = useCallback(async (method: "email" | "id", value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const data =
        method === "id"
          ? await registration.getTicket(trimmed)
          : await kiosk.lookup(trimmed, "email");

      setTicketData(mapApiGuestToTicketDisplay(data.guest, data.event, resolveUploadUrl));
    } catch {
      setError("No registration found. Please check your details and try again.");
      setTicketData(null);
    }

    setLoading(false);
  }, []);

  const registrationIdParam = searchParams.get("registrationId");
  const emailParam = searchParams.get("email");

  useEffect(() => {
    if (registrationIdParam) {
      setSearchMethod("id");
      setSearchValue(registrationIdParam);
      void loadTicket("id", registrationIdParam);
    } else if (emailParam) {
      setSearchMethod("email");
      setSearchValue(emailParam);
      void loadTicket("email", emailParam);
    }
  }, [registrationIdParam, emailParam, loadTicket]);

  const handleSearch = async () => {
    await loadTicket(searchMethod, searchValue);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-[#0F172A] min-w-0 max-w-[min(100%,18rem)] sm:max-w-md"
          >
            <Calendar className="w-5 h-5 shrink-0 text-[#22D3EE]" />
            <span className="font-bold truncate">{REGISTRATION_HEADER_EVENT_TITLE}</span>
          </Link>
          <Link
            to="/"
            className="text-sm text-[#22D3EE] font-medium hover:underline"
          >
            Register for event
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#0F172A] mb-3">
              View Your Ticket
            </h1>
            <p className="text-[#64748B]">
              Enter your email or registration ID to retrieve your ticket
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-6 mb-6">
            {/* Search Method Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSearchMethod("email")}
                className={`flex-1 px-4 py-2 rounded-full font-medium transition-all ${
                  searchMethod === "email"
                    ? "bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white"
                    : "border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                Search by Email
              </button>
              <button
                onClick={() => setSearchMethod("id")}
                className={`flex-1 px-4 py-2 rounded-full font-medium transition-all ${
                  searchMethod === "id"
                    ? "bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white"
                    : "border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                Search by ID
              </button>
            </div>

            {/* Search Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#0F172A] mb-2">
                {searchMethod === "email" ? "Email Address" : "Registration ID"}
              </label>
              <input
                type={searchMethod === "email" ? "email" : "text"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  searchMethod === "email"
                    ? "Enter your email address"
                    : "Enter your registration ID (e.g., FF2026-XXXXX)"
                }
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22D3EE] focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-[#FEE2E2] border border-[#FCA5A5] rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#DC2626]">{error}</p>
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!searchValue || loading}
              className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? "Searching..." : "Search Ticket"}
            </button>
          </div>

          {/* Ticket Display */}
          {ticketData && (
            <div className="space-y-6">
              <DigitalTicketCard ref={ticketCardRef} ticket={ticketData} />

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    void downloadTicketPdf(
                      ticketDisplayToSharePayload(ticketData),
                      ticketCardRef.current,
                    )
                  }
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90"
                >
                  <Download className="w-5 h-5" />
                  Download Ticket (PDF)
                </button>
                <button
                  type="button"
                  onClick={() => downloadEventCalendar(ticketDisplayToSharePayload(ticketData))}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#E2E8F0] text-[#0F172A] font-medium hover:bg-white"
                >
                  <Calendar className="w-5 h-5" />
                  Add to Calendar
                </button>
                <button
                  type="button"
                  onClick={() => void shareTicket(ticketDisplayToSharePayload(ticketData))}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#E2E8F0] text-[#0F172A] font-medium hover:bg-white"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#E2E8F0] text-[#0F172A] font-medium hover:bg-white"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0B0F1A] text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#94A3B8] text-sm mb-2">
            © 2026 FutureFin Expo. All rights reserved.
          </p>
          <p className="text-[#64748B] text-xs">
            Powered by <span className="text-[#22D3EE]">TechnoCIT</span> & <span className="text-[#8B5CF6]">NFS Technologies</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
