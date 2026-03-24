import { useState, forwardRef } from "react";
import {
  QrCode,
  Mail,
  Phone,
  Linkedin,
  MapPin,
  Briefcase,
} from "lucide-react";
import type { TicketDisplay } from "../../../lib/ticketDisplay";

const COUNTRY_LABELS: Record<string, string> = {
  uae: "United Arab Emirates",
  sa: "Saudi Arabia",
  in: "India",
  uk: "United Kingdom",
  us: "United States",
  other: "Other",
};

const INDUSTRY_LABELS: Record<string, string> = {
  banking: "Banking",
  fintech: "FinTech",
  crypto: "Cryptocurrency",
  insurance: "Insurance",
  payments: "Payments",
  other: "Other",
};

function formatCountry(code?: string | null): string | null {
  if (!code) return null;
  return COUNTRY_LABELS[code] ?? code;
}

function formatIndustry(code?: string | null): string | null {
  if (!code) return null;
  return INDUSTRY_LABELS[code] ?? code;
}

function formatGuestStatus(status?: string | null): { label: string; tone: "green" | "amber" | "slate" } {
  switch (status) {
    case "CheckedIn":
      return { label: "Checked in", tone: "green" };
    case "FaceCaptured":
      return { label: "Face captured", tone: "amber" };
    case "Registered":
      return { label: "Registered", tone: "green" };
    case "Invited":
      return { label: "Invited", tone: "slate" };
    default:
      return { label: status || "Unknown", tone: "slate" };
  }
}

function formatEventDates(event: { date?: string; endDate?: string } | null | undefined): string {
  if (!event?.date) return "TBA";
  const start = new Date(event.date);
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
  if (!event.endDate) {
    return start.toLocaleDateString("en-US", opts);
  }
  const end = new Date(event.endDate);
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

interface DigitalTicketCardProps {
  ticket: TicketDisplay;
  /** Success page: tap QR to enlarge. View ticket: static block. */
  qrInteractive?: boolean;
  className?: string;
}

export const DigitalTicketCard = forwardRef<HTMLDivElement, DigitalTicketCardProps>(
  function DigitalTicketCard({ ticket, qrInteractive = false, className = "" }, ref) {
  const [showQR, setShowQR] = useState(false);

  return (
    <div
      ref={ref}
      className={`bg-white border-2 border-[#E2E8F0] rounded-[14px] overflow-hidden ${className}`}
    >
      <div className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] p-6 text-white">
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold">{ticket.event?.name ?? "FutureFin Expo 2026"}</h2>
            <p className="text-sm opacity-90">Premium FinTech Event</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90 font-medium">{formatEventDates(ticket.event)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm opacity-90">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{ticket.event?.location ?? "TBA"}</span>
        </div>
        {ticket.event?.description ? (
          <p className="text-sm opacity-85 mt-3 pt-3 border-t border-white/20 leading-relaxed">{ticket.event.description}</p>
        ) : null}
      </div>

      <div className="p-6">
        <div className="flex gap-6 mb-6">
          {ticket.faceImage ? (
            <img
              src={ticket.faceImage}
              alt="Profile"
              crossOrigin="anonymous"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#22D3EE]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-white text-3xl font-bold">
              {ticket.fullName
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-[#0F172A] mb-1">{ticket.fullName}</h3>
            {ticket.designation ? <p className="text-[#64748B] mb-1">{ticket.designation}</p> : null}
            {ticket.company ? <p className="text-[#64748B] mb-3">{ticket.company}</p> : null}
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#22D3EE] text-white uppercase">
              {ticket.badge}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-6 text-sm border-t border-[#E2E8F0] pt-6">
          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">Email</p>
              <p className="text-[#0F172A] break-all">{ticket.email}</p>
            </div>
          </div>
          {ticket.phone ? (
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">Phone</p>
                <p className="text-[#0F172A]">{ticket.phone}</p>
              </div>
            </div>
          ) : null}
          {formatIndustry(ticket.industry) ? (
            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">Industry</p>
                <p className="text-[#0F172A]">{formatIndustry(ticket.industry)}</p>
              </div>
            </div>
          ) : null}
          {formatCountry(ticket.country) ? (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">Country</p>
                <p className="text-[#0F172A]">{formatCountry(ticket.country)}</p>
              </div>
            </div>
          ) : null}
          {ticket.linkedIn ? (
            <div className="flex items-start gap-2 sm:col-span-2">
              <Linkedin className="w-4 h-4 text-[#22D3EE] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">LinkedIn</p>
                <a
                  href={ticket.linkedIn.startsWith("http") ? ticket.linkedIn : `https://${ticket.linkedIn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8B5CF6] hover:underline break-all"
                >
                  {ticket.linkedIn}
                </a>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-6">
          <div>
            <p className="text-sm text-[#64748B] mb-1">Registration ID</p>
            <p className="font-mono font-bold text-[#0F172A]">{ticket.registrationId}</p>
          </div>
          <div className="text-right">
            {qrInteractive ? (
              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className={`bg-[#0B0F1A] rounded-lg flex items-center justify-center hover:opacity-80 transition-all ${
                  showQR ? "w-36 h-36" : "w-24 h-24"
                }`}
              >
                <QrCode className={`${showQR ? "w-24 h-24" : "w-16 h-16"} text-white`} />
              </button>
            ) : (
              <div className="w-24 h-24 bg-[#0B0F1A] rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-white" />
              </div>
            )}
            <p className="text-xs text-[#64748B] mt-1">{qrInteractive ? "Tap to expand" : "QR Code"}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#E2E8F0] grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[#64748B] mb-1">Registration status</p>
            {(() => {
              const { label, tone } = formatGuestStatus(ticket.status);
              const color =
                tone === "green" ? "text-[#059669]" : tone === "amber" ? "text-[#D97706]" : "text-[#64748B]";
              return <p className={`font-bold ${color}`}>{label}</p>;
            })()}
          </div>
          {ticket.registeredAt ? (
            <div>
              <p className="text-sm text-[#64748B] mb-1">Registered on</p>
              <p className="font-medium text-[#0F172A]">
                {new Date(ticket.registeredAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          ) : null}
          {ticket.checkedInAt ? (
            <div className="sm:col-span-2">
              <p className="text-sm text-[#64748B] mb-1">Checked in at</p>
              <p className="font-medium text-[#0F172A]">
                {new Date(ticket.checkedInAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});
