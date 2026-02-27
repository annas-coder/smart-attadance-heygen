import { Link } from "react-router";
import { useState } from "react";
import { Search, Home, QrCode, Download, Calendar, Share2, AlertCircle } from "lucide-react";
import { registration, kiosk } from "../../../lib/api";

export function ViewTicket() {
  const [searchMethod, setSearchMethod] = useState<"email" | "id">("email");
  const [searchValue, setSearchValue] = useState("");
  const [ticketData, setTicketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = searchMethod === "id"
        ? await registration.getTicket(searchValue)
        : await kiosk.lookup(searchValue, "email");

      const g = data.guest;
      setTicketData({
        fullName: g.fullName,
        email: g.email,
        designation: g.designation,
        company: g.company,
        badge: g.badge || "General",
        faceImage: g.faceImagePath,
        registrationId: g.registrationId || "N/A",
        event: data.event,
      });
    } catch {
      setError("No registration found. Please check your details and try again.");
      setTicketData(null);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#0F172A]">
            <Home className="w-5 h-5" />
            <span className="font-bold">Home</span>
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
              {/* Digital Ticket */}
              <div className="bg-white border-2 border-[#E2E8F0] rounded-[14px] overflow-hidden">
                {/* Ticket Header */}
                <div className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{ticketData.event?.name ?? "FutureFin Expo 2026"}</h2>
                      <p className="text-sm opacity-90">Premium FinTech Event</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-90">
                        {ticketData.event?.date
                          ? new Date(ticketData.event.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                          : "TBA"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm opacity-90">
                    {ticketData.event?.location ?? "TBA"}
                  </p>
                </div>

                {/* Ticket Body */}
                <div className="p-6">
                  <div className="flex gap-6 mb-6">
                    {/* Avatar */}
                    {ticketData.faceImage ? (
                      <img
                        src={ticketData.faceImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-[#22D3EE]"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-white text-3xl font-bold">
                        {ticketData.fullName
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#0F172A] mb-1">
                        {ticketData.fullName}
                      </h3>
                      <p className="text-[#64748B] mb-1">{ticketData.designation}</p>
                      <p className="text-[#64748B] mb-3">{ticketData.company}</p>
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#22D3EE] text-white uppercase">
                        {ticketData.badge}
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-6">
                    <div>
                      <p className="text-sm text-[#64748B] mb-1">Registration ID</p>
                      <p className="font-mono font-bold text-[#0F172A]">
                        {ticketData.registrationId}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-24 h-24 bg-[#0B0F1A] rounded-lg flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-white" />
                      </div>
                      <p className="text-xs text-[#64748B] mt-1">QR Code</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                    <p className="text-sm text-[#64748B] mb-1">Status</p>
                    <p className="font-bold text-[#34D399]">Confirmed</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90">
                  <Download className="w-5 h-5" />
                  Download Ticket (PDF)
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#E2E8F0] text-[#0F172A] font-medium hover:bg-white">
                  <Calendar className="w-5 h-5" />
                  Add to Calendar
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#E2E8F0] text-[#0F172A] font-medium hover:bg-white">
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
