import type { TicketSharePayload } from "./ticketActions";

export interface TicketDisplay {
  fullName: string;
  email: string;
  phone?: string | null;
  designation?: string | null;
  company?: string | null;
  linkedIn?: string | null;
  industry?: string | null;
  country?: string | null;
  badge: string;
  faceImage: string | null;
  registrationId: string;
  status?: string | null;
  registeredAt?: string | null;
  checkedInAt?: string | null;
  agendaSessions: Array<{ title: string; location: string; time: string }>;
  event: {
    name?: string;
    date?: string;
    endDate?: string;
    location?: string;
    description?: string;
  } | null;
}

export function mapApiGuestToTicketDisplay(
  guest: Record<string, any>,
  event: Record<string, any> | null | undefined,
  resolveFaceUrl: (path: string | null | undefined) => string | null,
): TicketDisplay {
  const sessions = guest.agenda?.sessions;
  return {
    fullName: guest.fullName,
    email: guest.email,
    phone: guest.phone ?? null,
    designation: guest.designation ?? null,
    company: guest.company ?? null,
    linkedIn: guest.linkedIn ?? null,
    industry: guest.industry ?? null,
    country: guest.country ?? null,
    badge: guest.badge || "General",
    faceImage: resolveFaceUrl(guest.faceImagePath),
    registrationId: guest.registrationId || "N/A",
    status: guest.status ?? null,
    registeredAt: guest.registeredAt ?? null,
    checkedInAt: guest.checkedInAt ?? null,
    agendaSessions: Array.isArray(sessions) ? sessions : [],
    event: event
      ? {
          name: event.name,
          date: event.date,
          endDate: event.endDate,
          location: event.location,
          description: event.description,
        }
      : null,
  };
}

/** When API load fails, build ticket from profile session + optional event defaults. */
export function mapSessionFormToTicketDisplay(
  form: Record<string, any>,
  options: {
    faceImage: string | null;
    registrationId: string | null;
    event: Record<string, any> | null;
  },
): TicketDisplay {
  const regId = options.registrationId?.trim();
  const displayId =
    regId && !/processing/i.test(regId) ? regId : "Processing...";

  return {
    fullName: form.fullName ?? "",
    email: form.email ?? "",
    phone: form.phone ?? null,
    designation: form.designation ?? null,
    company: form.company ?? null,
    linkedIn: form.linkedIn ?? null,
    industry: form.industry ?? null,
    country: form.country ?? null,
    badge: form.badge || "General",
    faceImage: options.faceImage,
    registrationId: displayId,
    status: "Registered",
    registeredAt: null,
    checkedInAt: null,
    agendaSessions: [],
    event: options.event
      ? {
          name: options.event.name,
          date: options.event.date,
          endDate: options.event.endDate,
          location: options.event.location,
          description: options.event.description,
        }
      : {
          name: "FutureFin Expo 2026",
          location: "Grand Meridian Convention Center, Dubai",
        },
  };
}

export function ticketDisplayToSharePayload(t: TicketDisplay): TicketSharePayload {
  return {
    fullName: t.fullName,
    email: t.email,
    registrationId: t.registrationId === "Processing..." ? "N/A" : t.registrationId,
    badge: t.badge,
    company: t.company ?? undefined,
    designation: t.designation ?? undefined,
    event: {
      name: t.event?.name ?? "FutureFin Expo 2026",
      date: t.event?.date ?? null,
      endDate: t.event?.endDate ?? null,
      location: t.event?.location ?? null,
      description: t.event?.description ?? null,
    },
  };
}
