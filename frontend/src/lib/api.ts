const API_BASE = `${import.meta.env.VITE_API_URL || ""}/api`;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.message || "Request failed", res.status, data);
  }

  return data.data as T;
}

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function requestFile<T>(
  path: string,
  body: FormData,
  method = "POST"
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method, headers, body });
  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.message || "Upload failed", res.status, data);
  }

  return data.data as T;
}

// ─── Auth ──────────────────────────────────────────────────────

export const auth = {
  login(email: string, password: string) {
    return request<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  register(data: { email: string; password: string; name: string; organizationName?: string }) {
    return request<{ user: any; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getMe() {
    return request<any>("/auth/me");
  },
};

// ─── Events ────────────────────────────────────────────────────

export const events = {
  listPublic() {
    return request<any[]>("/events/public");
  },
  list() {
    return request<any[]>("/events");
  },
  get(id: string) {
    return request<any>(`/events/${id}`);
  },
  create(data: { name: string; date: string; location: string; description?: string }) {
    return request<any>("/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: Record<string, any>) {
    return request<any>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete(id: string) {
    return request<any>(`/events/${id}`, { method: "DELETE" });
  },
};

// ─── Guests ────────────────────────────────────────────────────

export const guests = {
  list(eventId: string, params?: { search?: string; status?: string; badge?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.badge) searchParams.set("badge", params.badge);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return request<{ guests: any[]; pagination: any }>(`/events/${eventId}/guests${qs ? `?${qs}` : ""}`);
  },
  add(eventId: string, data: { fullName: string; email: string; company?: string; badge?: string }) {
    return request<any>(`/events/${eventId}/guests`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  bulkInvite(eventId: string, emails: string[]) {
    return request<{ added: number; skipped: number }>(`/events/${eventId}/guests/bulk`, {
      method: "POST",
      body: JSON.stringify({ emails }),
    });
  },
  uploadCsv(eventId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return requestFile<{ added: number; skipped: number }>(`/events/${eventId}/guests/csv`, formData);
  },
  update(guestId: string, data: Record<string, any>) {
    return request<any>(`/guests/${guestId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete(guestId: string) {
    return request<any>(`/guests/${guestId}`, { method: "DELETE" });
  },
};

// ─── Registration (public) ─────────────────────────────────────

export const registration = {
  submit(data: {
    eventId: string;
    fullName: string;
    email: string;
    phone?: string;
    company?: string;
    designation?: string;
    linkedIn?: string;
    industry?: string;
    country?: string;
  }) {
    return request<{ guestId: string; status: string }>("/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  uploadFace(guestId: string, file: Blob) {
    const formData = new FormData();
    formData.append("face", file, "face.jpg");
    return requestFile<{
      guestId: string;
      faceImagePath: string;
      status: string;
      qualityChecks?: Record<string, boolean>;
      enrolled?: boolean;
      retakeRequired?: boolean;
      reason?: string;
    }>(`/register/face/${guestId}`, formData);
  },
  confirm(guestId: string) {
    return request<{ guest: any; event: any }>(`/register/confirm/${guestId}`, {
      method: "POST",
    });
  },
  getTicket(registrationId: string) {
    return request<{ guest: any; event: any }>(`/tickets/${registrationId}`);
  },
};

// ─── Kiosk ─────────────────────────────────────────────────────

export const kiosk = {
  lookup(query: string, type: "email" | "id" = "email") {
    return request<{ guest: any; event: any }>("/kiosk/lookup", {
      method: "POST",
      body: JSON.stringify({ query, type }),
    });
  },
  checkin(guestId: string) {
    return request<{ guest: any; event: any }>(`/kiosk/checkin/${guestId}`, {
      method: "POST",
    });
  },
  faceIdentify(image: string, eventId: string) {
    return request<{ matched: boolean; score?: number; reason?: string; guest?: any; event?: any }>("/kiosk/face-identify", {
      method: "POST",
      body: JSON.stringify({ image, eventId }),
    });
  },
};

// ─── Dashboard ─────────────────────────────────────────────────

export const dashboard = {
  getStats(eventId?: string) {
    const qs = eventId ? `?eventId=${eventId}` : "";
    return request<{
      totalInvited: number;
      registered: number;
      checkedIn: number;
      pending: number;
      totalEvents: number;
    }>(`/dashboard/stats${qs}`);
  },
  getActivity(eventId?: string, limit?: number) {
    const params = new URLSearchParams();
    if (eventId) params.set("eventId", eventId);
    if (limit) params.set("limit", String(limit));
    const qs = params.toString();
    return request<any[]>(`/dashboard/activity${qs ? `?${qs}` : ""}`);
  },
};

// ─── Settings ──────────────────────────────────────────────────

export const settings = {
  get() {
    return request<any>("/settings");
  },
  update(data: Record<string, any>) {
    return request<any>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
