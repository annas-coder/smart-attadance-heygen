import { useState, useEffect } from "react";
import { AdminLayout } from "../../components/admin/admin-layout";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Save, Bell, Shield, Mail } from "lucide-react";
import { settings as settingsApi } from "../../../lib/api";

export function Settings() {
  const [settingsData, setSettingsData] = useState({
    name: "",
    email: "",
    timezone: "Asia/Dubai",
    emailNotifications: true,
    smsNotifications: false,
    autoApprove: false,
    requireFaceCapture: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.get().then((data) => {
      setSettingsData({
        name: data.name || "",
        email: data.email || "",
        timezone: data.timezone || "Asia/Dubai",
        emailNotifications: data.emailNotifications ?? true,
        smsNotifications: data.smsNotifications ?? false,
        autoApprove: data.autoApprove ?? false,
        requireFaceCapture: data.requireFaceCapture ?? true,
      });
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settingsData);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Settings</h1>
          <p className="text-[#64748B]">
            Manage your organization and event preferences
          </p>
        </div>

        <div className="max-w-3xl space-y-6">
          <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Organization</h2>
                <p className="text-sm text-[#64748B]">Basic organization information</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" value={settingsData.name} onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="org-email">Contact Email</Label>
                <Input id="org-email" type="email" value={settingsData.email} onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={settingsData.timezone}
                  onChange={(e) => setSettingsData({ ...settingsData, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#22D3EE]"
                >
                  <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                  <option value="America/New_York">America/New York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Notifications</h2>
                <p className="text-sm text-[#64748B]">Manage how you receive updates</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[#0F172A]">Email Notifications</p>
                  <p className="text-sm text-[#64748B]">Receive updates via email</p>
                </div>
                <Switch checked={settingsData.emailNotifications} onCheckedChange={(checked) => setSettingsData({ ...settingsData, emailNotifications: checked })} />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-[#E2E8F0]">
                <div>
                  <p className="font-medium text-[#0F172A]">SMS Notifications</p>
                  <p className="text-sm text-[#64748B]">Receive updates via SMS</p>
                </div>
                <Switch checked={settingsData.smsNotifications} onCheckedChange={(checked) => setSettingsData({ ...settingsData, smsNotifications: checked })} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[14px] border border-[#E2E8F0] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">Event Preferences</h2>
                <p className="text-sm text-[#64748B]">Default settings for new events</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[#0F172A]">Auto-approve Registrations</p>
                  <p className="text-sm text-[#64748B]">Automatically approve all new registrations</p>
                </div>
                <Switch checked={settingsData.autoApprove} onCheckedChange={(checked) => setSettingsData({ ...settingsData, autoApprove: checked })} />
              </div>
              <div className="flex items-center justify-between py-3 border-t border-[#E2E8F0]">
                <div>
                  <p className="font-medium text-[#0F172A]">Require Face Capture</p>
                  <p className="text-sm text-[#64748B]">Mandate face capture during registration</p>
                </div>
                <Switch checked={settingsData.requireFaceCapture} onCheckedChange={(checked) => setSettingsData({ ...settingsData, requireFaceCapture: checked })} />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-medium hover:opacity-90">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
