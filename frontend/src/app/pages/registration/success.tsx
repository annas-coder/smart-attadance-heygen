import { Link } from "react-router";
import { useEffect, useState, useRef } from "react";
import { Check, Download, Calendar, Share2, Home } from "lucide-react";
import { motion } from "motion/react";
import { registration, resolveUploadUrl } from "../../../lib/api";
import {
  downloadTicketPdf,
  downloadEventCalendar,
  shareTicket,
} from "../../../lib/ticketActions";
import {
  mapApiGuestToTicketDisplay,
  mapSessionFormToTicketDisplay,
  ticketDisplayToSharePayload,
  type TicketDisplay,
} from "../../../lib/ticketDisplay";
import { DigitalTicketCard } from "../../components/registration/digital-ticket-card";

export function RegistrationSuccess() {
  const ticketCardRef = useRef<HTMLDivElement>(null);
  const [ticketDisplay, setTicketDisplay] = useState<TicketDisplay | null>(null);

  useEffect(() => {
    const regId = sessionStorage.getItem("registrationId");
    const registrationDataRaw = sessionStorage.getItem("registrationData");
    const faceDataUrl = sessionStorage.getItem("faceImage");

    if (regId) {
      registration
        .getTicket(regId)
        .then((data) => {
          setTicketDisplay(mapApiGuestToTicketDisplay(data.guest, data.event, resolveUploadUrl));
        })
        .catch(() => {
          if (registrationDataRaw) {
            try {
              const form = JSON.parse(registrationDataRaw) as Record<string, unknown>;
              setTicketDisplay(
                mapSessionFormToTicketDisplay(form, {
                  faceImage: faceDataUrl,
                  registrationId: regId,
                  event: null,
                }),
              );
            } catch {
              setTicketDisplay(null);
            }
          } else {
            setTicketDisplay(null);
          }
        });
    } else if (registrationDataRaw) {
      try {
        const form = JSON.parse(registrationDataRaw) as Record<string, unknown>;
        setTicketDisplay(
          mapSessionFormToTicketDisplay(form, {
            faceImage: faceDataUrl,
            registrationId: null,
            event: null,
          }),
        );
      } catch {
        setTicketDisplay(null);
      }
    }
  }, []);

  if (!ticketDisplay) return null;

  const ticketPayload = ticketDisplayToSharePayload(ticketDisplay);
  const eventTitle = ticketDisplay.event?.name ?? "FutureFin Expo 2026";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans']">
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#0F172A]">
            <Home className="w-5 h-5" />
            <span className="font-bold">Home</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#34D399] to-[#22D3EE] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#0F172A] mb-3">You're Registered!</h1>
            <p className="text-xl text-[#64748B]">See you at {eventTitle}!</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <DigitalTicketCard ref={ticketCardRef} ticket={ticketDisplay} qrInteractive />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            <button
              type="button"
              onClick={() => void downloadTicketPdf(ticketPayload, ticketCardRef.current)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90"
            >
              <Download className="w-5 h-5" />
              Download Ticket (PDF)
            </button>
            <button
              type="button"
              onClick={() => downloadEventCalendar(ticketPayload)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#E2E8F0] text-[#0F172A] font-medium hover:bg-white"
            >
              <Calendar className="w-5 h-5" />
              Add to Calendar
            </button>
            <button
              type="button"
              onClick={() => void shareTicket(ticketPayload)}
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
          </motion.div>

          <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-6">
            <h3 className="font-bold text-[#0F172A] mb-4">What to Expect</h3>
            <div className="space-y-3 text-sm text-[#64748B]">
              <p>✓ Present your QR code at the kiosk for instant face recognition check-in</p>
              <p>✓ Access to all sessions, networking areas, and exhibition halls</p>
              <p>✓ Complimentary meals and refreshments throughout the event</p>
              <p>✓ Certificate of attendance will be emailed after the event</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-[#0B0F1A] text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#94A3B8] text-sm mb-2">© 2026 FutureFin Expo. All rights reserved.</p>
          <p className="text-[#64748B] text-xs">
            Powered by <span className="text-[#22D3EE]">TechnoCIT</span> &{" "}
            <span className="text-[#8B5CF6]">NFS Technologies</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
