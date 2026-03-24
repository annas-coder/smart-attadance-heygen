const API_BASE = `${import.meta.env.VITE_API_URL || ""}/api/kiosk`;

const sessionId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Matches kiosk voice language toggle; sent to API so replies follow current UI language. */
export type KioskChatLang = 'en-US' | 'ar';

export async function fetchGeneralChatResponse(message: string, lang: KioskChatLang): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, lang }),
  });
  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }
  const json = await res.json();
  return json.data?.response ?? json.response ?? '';
}

export interface UserProfile {
  fullName: string;
  designation?: string;
  company?: string;
  email?: string;
  registrationId?: string;
  agenda?: { title: string; location: string; time: string }[];
}

export async function fetchUserChatResponse(message: string, profile: UserProfile, lang: KioskChatLang): Promise<string> {
  const res = await fetch(`${API_BASE}/chat/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, userProfile: profile, lang }),
  });
  if (!res.ok) {
    throw new Error(`User chat API error: ${res.status}`);
  }
  const json = await res.json();
  return json.data?.response ?? json.response ?? '';
}
