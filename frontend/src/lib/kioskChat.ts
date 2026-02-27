const API_BASE = `${import.meta.env.VITE_API_URL || ""}/api/kiosk`;

const sessionId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export async function fetchGeneralChatResponse(message: string): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId }),
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

export async function fetchUserChatResponse(message: string, profile: UserProfile): Promise<string> {
  const res = await fetch(`${API_BASE}/chat/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, userProfile: profile }),
  });
  if (!res.ok) {
    throw new Error(`User chat API error: ${res.status}`);
  }
  const json = await res.json();
  return json.data?.response ?? json.response ?? '';
}
