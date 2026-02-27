import { Link } from "react-router";
import { useEffect, useState } from "react";
import { Check, Download, Calendar, Share2, Home, QrCode } from "lucide-react";
import { motion } from "motion/react";
import { registration, resolveUploadUrl } from "../../../lib/api";

export function RegistrationSuccess() {
  const [formData, setFormData] = useState<any>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const regId = sessionStorage.getItem("registrationId");
    if (regId) {
      setRegistrationId(regId);
      registration.getTicket(regId).then((data) => {
        const guest = data.guest;
        setFormData({
          fullName: guest.fullName,
          email: guest.email,
          designation: guest.designation,
          company: guest.company,
          badge: guest.badge,
        });
        if (guest.faceImagePath) {
          setFaceImage(resolveUploadUrl(guest.faceImagePath));
        }
        if (data.event) {
          setEventData(data.event);
        }
      }).catch(() => {
        const data = sessionStorage.getItem("registrationData");
        const image = sessionStorage.getItem("faceImage");
        if (data) setFormData(JSON.parse(data));
        if (image) setFaceImage(image);
      });
    } else {
      const data = sessionStorage.getItem("registrationData");
      const image = sessionStorage.getItem("faceImage");
      if (data) setFormData(JSON.parse(data));
      if (image) setFaceImage(image);
    }
  }, []);

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans']">
      {/* Header */}
      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#0F172A]">
            <Home className="w-5 h-5" />
            <span className="font-bold">Home</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-[#34D399] to-[#22D3EE] rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#0F172A] mb-3">
              You're Registered!
            </h1>
            <p className="text-xl text-[#64748B]">
              See you at FutureFin Expo 2026!
            </p>
          </motion.div>

          {/* Digital Ticket */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-[#E2E8F0] rounded-[14px] overflow-hidden mb-6"
          >
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{eventData?.name ?? "FutureFin Expo 2026"}</h2>
                  <p className="text-sm opacity-90">Premium FinTech Event</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">
                    {eventData?.date
                      ? new Date(eventData.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "March 15, 2026"}
                  </p>
                </div>
              </div>
              <p className="text-sm opacity-90">
                {eventData?.location ?? "Grand Meridian Convention Center, Dubai"}
              </p>
            </div>

            {/* Ticket Body */}
            <div className="p-6">
              <div className="flex gap-6 mb-6">
                {/* Avatar */}
                {faceImage ? (
                  <img
                    src={faceImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#22D3EE]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-white text-3xl font-bold">
                    {formData.fullName
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                )}

                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-1">
                    {formData.fullName}
                  </h3>
                  <p className="text-[#64748B] mb-1">{formData.designation}</p>
                  <p className="text-[#64748B] mb-3">{formData.company}</p>
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#22D3EE] text-white uppercase">
                    {formData.badge ?? "General"}
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-6">
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Registration ID</p>
                  <p className="font-mono font-bold text-[#0F172A]">
                    {registrationId ?? "Processing..."}
                  </p>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="w-24 h-24 bg-[#0B0F1A] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <QrCode className="w-16 h-16 text-white" />
                  </button>
                  <p className="text-xs text-[#64748B] mt-1">Tap to expand</p>
                </div>
              </div>

              {/* Status */}
              <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                <p className="text-sm text-[#64748B] mb-1">Status</p>
                <p className="font-bold text-[#34D399]">Confirmed</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
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
          </motion.div>

          {/* What to Expect */}
          <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-6">
            <h3 className="font-bold text-[#0F172A] mb-4">What to Expect</h3>
            <div className="space-y-3 text-sm text-[#64748B]">
              <p>
                ✓ Present your QR code at the kiosk for instant face recognition
                check-in
              </p>
              <p>✓ Access to all sessions, networking areas, and exhibition halls</p>
              <p>✓ Complimentary meals and refreshments throughout the event</p>
              <p>✓ Certificate of attendance will be emailed after the event</p>
            </div>
          </div>
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