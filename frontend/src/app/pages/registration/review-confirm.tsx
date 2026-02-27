import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Check, Edit, Home } from "lucide-react";
import { registration, events } from "../../../lib/api";

export function ReviewConfirm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [consents, setConsents] = useState({
    terms: false,
    faceRecognition: false,
    updates: true,
  });

  useEffect(() => {
    const data = sessionStorage.getItem("registrationData");
    const image = sessionStorage.getItem("faceImage");
    if (data) setFormData(JSON.parse(data));
    if (image) setFaceImage(image);

    events.listPublic().then((list) => {
      if (list.length > 0) setEventData(list[0]);
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!consents.terms || !consents.faceRecognition) return;

    const guestId = sessionStorage.getItem("guestId");
    if (guestId) {
      try {
        const result = await registration.confirm(guestId);
        if (result.guest?.registrationId) {
          sessionStorage.setItem("registrationId", result.guest.registrationId);
        }
      } catch (err) {
        console.error("Confirm failed:", err);
      }
    }

    navigate("/register/success");
  };

  const canSubmit = consents.terms && consents.faceRecognition;

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

      {/* Progress Stepper */}
      <div className="bg-white border-b border-[#E2E8F0] py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#34D399] text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#34D399]">Profile</span>
              </div>
            </div>
            <div className="w-20 h-0.5 bg-[#34D399] mx-2"></div>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#34D399] text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#34D399]">
                  Face Capture
                </span>
              </div>
            </div>
            <div className="w-20 h-0.5 bg-[#22D3EE] mx-2"></div>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#22D3EE] text-white flex items-center justify-center font-bold">
                  3
                </div>
                <span className="text-sm font-medium text-[#22D3EE]">Review</span>
              </div>
            </div>
            <div className="w-20 h-0.5 bg-[#E2E8F0] mx-2"></div>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#64748B]">
                  Confirmed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-8 mb-6">
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
              Review & Confirm
            </h1>
            <p className="text-[#64748B] mb-8">
              Please review your information before confirming
            </p>

            {/* Personal Details */}
            <div className="mb-6 pb-6 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0F172A]">Personal Details</h3>
                <Link
                  to="/register/profile"
                  className="text-[#22D3EE] text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#64748B]">Full Name</p>
                  <p className="text-[#0F172A] font-medium">{formData.fullName}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Email</p>
                  <p className="text-[#0F172A] font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Phone</p>
                  <p className="text-[#0F172A] font-medium">{formData.phone}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Company</p>
                  <p className="text-[#0F172A] font-medium">{formData.company}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Designation</p>
                  <p className="text-[#0F172A] font-medium">{formData.designation}</p>
                </div>
                <div>
                  <p className="text-[#64748B]">Country</p>
                  <p className="text-[#0F172A] font-medium">{formData.country}</p>
                </div>
              </div>
            </div>

            {/* Face Photo */}
            <div className="mb-6 pb-6 border-b border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0F172A]">Face Photo</h3>
                <Link
                  to="/register/face"
                  className="text-[#22D3EE] text-sm font-medium flex items-center gap-1 hover:underline"
                >
                  <Edit className="w-4 h-4" />
                  Retake
                </Link>
              </div>
              <div className="flex items-center gap-4">
                {faceImage ? (
                  <>
                    <img
                      src={faceImage}
                      alt="Captured face"
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#34D399]"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-4 h-4 text-[#34D399]" />
                        <span className="text-[#34D399] font-medium">
                          Face Captured
                        </span>
                      </div>
                      <p className="text-sm text-[#64748B]">
                        Photo looks great!
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-[#FBBF24]">No photo captured</div>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="mb-6">
              <h3 className="font-bold text-[#0F172A] mb-4">Event Details</h3>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[14px] p-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#64748B]">Event</p>
                    <p className="text-[#0F172A] font-medium">
                      {eventData?.name ?? "FutureFin Expo 2026"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">Date</p>
                    <p className="text-[#0F172A] font-medium">
                      {eventData?.date
                        ? new Date(eventData.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                        : "TBA"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">Venue</p>
                    <p className="text-[#0F172A] font-medium">
                      {eventData?.location ?? "TBA"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#64748B]">Badge Type</p>
                    <p className="px-3 py-1 rounded-full text-xs font-medium bg-[#22D3EE] text-white inline-block">
                      General
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consent */}
          <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-8 mb-6">
            <h3 className="font-bold text-[#0F172A] mb-4">Consent & Agreements</h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.terms}
                  onChange={(e) =>
                    setConsents({ ...consents, terms: e.target.checked })
                  }
                  className="mt-1"
                />
                <span className="text-sm text-[#64748B]">
                  I agree to the{" "}
                  <a href="#" className="text-[#22D3EE] hover:underline">
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[#22D3EE] hover:underline">
                    Privacy Policy
                  </a>{" "}
                  <span className="text-[#FB7185]">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.faceRecognition}
                  onChange={(e) =>
                    setConsents({
                      ...consents,
                      faceRecognition: e.target.checked,
                    })
                  }
                  className="mt-1"
                />
                <span className="text-sm text-[#64748B]">
                  I consent to face recognition for check-in{" "}
                  <span className="text-[#FB7185]">*</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.updates}
                  onChange={(e) =>
                    setConsents({ ...consents, updates: e.target.checked })
                  }
                  className="mt-1"
                />
                <span className="text-sm text-[#64748B]">
                  Receive event updates via email
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              to="/register/face"
              className="px-6 py-3 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] font-medium"
            >
              Back
            </Link>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
