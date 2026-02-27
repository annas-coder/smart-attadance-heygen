import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Check, Home } from "lucide-react";
import { registration, events as eventsApi } from "../../../lib/api";

export function ProfileSetup() {
  const navigate = useNavigate();
  const [eventId, setEventId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
    linkedIn: "",
    industry: "",
    country: "",
  });

  useEffect(() => {
    eventsApi
      .listPublic()
      .then((evts) => {
        if (evts.length > 0) setEventId(evts[0]._id);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) {
      alert("No events available for registration at the moment. Please try again later.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await registration.submit({ ...formData, eventId });
      sessionStorage.setItem("registrationData", JSON.stringify(formData));
      sessionStorage.setItem("guestId", result.guestId);
      sessionStorage.setItem("eventId", eventId);
      navigate("/register/face");
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.company &&
    formData.designation &&
    formData.country;

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

      <div className="bg-white border-b border-[#E2E8F0] py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#22D3EE] text-white flex items-center justify-center font-bold">1</div>
                <span className="text-sm font-medium text-[#22D3EE]">Profile</span>
              </div>
            </div>
            <div className="w-20 h-0.5 bg-[#E2E8F0] mx-2"></div>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold">2</div>
                <span className="text-sm font-medium text-[#64748B]">Face Capture</span>
              </div>
            </div>
            <div className="w-20 h-0.5 bg-[#E2E8F0] mx-2"></div>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold">3</div>
                <span className="text-sm font-medium text-[#64748B]">Review</span>
              </div>
            </div>
            <div className="w-20 h-0.5 bg-[#E2E8F0] mx-2"></div>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center font-bold"><Check className="w-5 h-5" /></div>
                <span className="text-sm font-medium text-[#64748B]">Confirmed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-8">
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Profile Setup</h1>
            <p className="text-[#64748B] mb-8">Please provide your details to complete registration</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">Full Name <span className="text-[#FB7185]">*</span></label>
                <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-3 rounded-full border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE]" placeholder="Enter your full name" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Email <span className="text-[#FB7185]">*</span></label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-full border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE]" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Phone Number <span className="text-[#FB7185]">*</span></label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-full border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE]" placeholder="+971 50 123 4567" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Company <span className="text-[#FB7185]">*</span></label>
                  <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-3 rounded-full border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE]" placeholder="Your company name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Designation <span className="text-[#FB7185]">*</span></label>
                  <input type="text" required value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full px-4 py-3 rounded-full border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE]" placeholder="Your job title" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-2">LinkedIn URL</label>
                <input type="url" value={formData.linkedIn} onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })} className="w-full px-4 py-3 rounded-full border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE]" placeholder="https://linkedin.com/in/yourprofile" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Industry</label>
                  <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className="w-full px-4 py-3 rounded-full border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE] bg-white">
                    <option value="">Select industry</option>
                    <option value="banking">Banking</option>
                    <option value="fintech">FinTech</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="insurance">Insurance</option>
                    <option value="payments">Payments</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Country <span className="text-[#FB7185]">*</span></label>
                  <select required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-3 rounded-full border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE] bg-white">
                    <option value="">Select country</option>
                    <option value="uae">United Arab Emirates</option>
                    <option value="sa">Saudi Arabia</option>
                    <option value="in">India</option>
                    <option value="uk">United Kingdom</option>
                    <option value="us">United States</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <Link to="/register" className="px-6 py-3 rounded-full border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] font-medium">Back</Link>
                <button type="submit" disabled={!isFormValid || submitting} className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? "Submitting..." : "Continue to Face Capture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
