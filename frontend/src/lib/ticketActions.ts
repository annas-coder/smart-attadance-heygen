import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export interface TicketSharePayload {
  fullName: string;
  email: string;
  registrationId: string;
  badge?: string;
  company?: string;
  designation?: string;
  event: {
    name: string;
    date?: string | null;
    endDate?: string | null;
    location?: string | null;
    description?: string | null;
  };
}

function sanitizeFilenameSegment(id: string): string {
  const s = id.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 48);
  return s || "ticket";
}

/** ICS TEXT value escaping (RFC 5545). */
function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Format as UTC iCal datetime: YYYYMMDDTHHmmssZ */
function formatIcsUtc(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** html2canvas 1.x cannot parse modern CSS color functions (oklch, lab, color(), …). */
const MODERN_COLOR_SYNTAX = /\boklch\(|\boklab\(|\blch\(|\blab\(|\bcolor\(|\bhwb\(/i;

const HTML2CANVAS_COLOR_PROPERTIES = [
  "accent-color",
  "background-color",
  "background-image",
  "border-bottom-color",
  "border-left-color",
  "border-right-color",
  "border-top-color",
  "caret-color",
  "color",
  "column-rule-color",
  "outline-color",
  "text-decoration-color",
  "text-emphasis-color",
  "-webkit-text-stroke-color",
  "box-shadow",
  "text-shadow",
] as const;

function resolveCssPropertyForHtml2canvas(value: string, doc: Document, cssProperty: string): string {
  if (!value || !MODERN_COLOR_SYNTAX.test(value)) return value;
  const box = doc.createElement("div");
  box.setAttribute("data-html2canvas-ignore", "true");
  box.style.setProperty("position", "fixed", "important");
  box.style.setProperty("left", "-9999px", "important");
  box.style.setProperty("top", "0", "important");
  box.style.setProperty("visibility", "hidden", "important");
  box.style.setProperty("pointer-events", "none", "important");
  box.style.setProperty(cssProperty, value);
  doc.body.appendChild(box);
  const view = doc.defaultView;
  const resolved = view ? view.getComputedStyle(box).getPropertyValue(cssProperty) : value;
  doc.body.removeChild(box);
  if (MODERN_COLOR_SYNTAX.test(resolved)) {
    if (cssProperty === "background-image") return "none";
    if (cssProperty === "box-shadow" || cssProperty === "text-shadow") return "none";
    if (cssProperty.includes("color") || cssProperty === "outline-color") return "rgb(0, 0, 0)";
    return "transparent";
  }
  return resolved || value;
}

function resolveSvgPaintForHtml2canvas(value: string, doc: Document, prop: "fill" | "stroke"): string {
  if (!value || !MODERN_COLOR_SYNTAX.test(value)) return value;
  const svg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "1");
  svg.setAttribute("height", "1");
  svg.setAttribute("data-html2canvas-ignore", "true");
  const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "1");
  rect.setAttribute("height", "1");
  rect.setAttribute(prop, value);
  svg.appendChild(rect);
  svg.style.setProperty("position", "fixed", "important");
  svg.style.setProperty("left", "-9999px", "important");
  svg.style.setProperty("visibility", "hidden", "important");
  doc.body.appendChild(svg);
  const view = doc.defaultView;
  const resolved = view ? view.getComputedStyle(rect).getPropertyValue(prop) : value;
  doc.body.removeChild(svg);
  if (MODERN_COLOR_SYNTAX.test(resolved)) {
    return prop === "fill" ? "rgb(0, 0, 0)" : "none";
  }
  return resolved || value;
}

/**
 * Inline resolved sRGB-friendly values on the cloned ticket subtree so html2canvas never sees oklch().
 * Pre-order walk so `color` is fixed before SVG `stroke`/`fill` that use `currentColor`.
 */
function sanitizeClonedSubtreeForHtml2canvas(root: HTMLElement): void {
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  if (!view) return;

  const walk = (el: Element): void => {
    if (el instanceof HTMLElement || el instanceof SVGElement) {
      const computed = view.getComputedStyle(el);
      const target = el as HTMLElement | SVGElement;

      const colorVal = computed.getPropertyValue("color");
      if (colorVal) {
        const c = resolveCssPropertyForHtml2canvas(colorVal, doc, "color");
        try {
          target.style.setProperty("color", c, "important");
        } catch {
          /* ignore */
        }
      }

      if (el instanceof SVGElement) {
        for (const prop of ["fill", "stroke"] as const) {
          const raw = computed.getPropertyValue(prop);
          if (!raw || raw === "none") continue;
          const v = resolveSvgPaintForHtml2canvas(raw, doc, prop);
          try {
            target.style.setProperty(prop, v, "important");
          } catch {
            /* ignore */
          }
        }
      }

      for (const prop of HTML2CANVAS_COLOR_PROPERTIES) {
        if (prop === "color") continue;
        const raw = computed.getPropertyValue(prop);
        if (!raw) continue;
        if (prop === "background-image" && raw === "none") continue;
        if ((prop === "box-shadow" || prop === "text-shadow") && raw === "none") continue;
        const v = resolveCssPropertyForHtml2canvas(raw, doc, prop);
        try {
          target.style.setProperty(prop, v, "important");
        } catch {
          /* SVG may reject some props */
        }
      }
    }

    for (const child of el.children) walk(child);
  };

  walk(root);
}

/**
 * Rasterize the on-screen ticket card (Tailwind colors, layout, gradients) into a multi-page PDF.
 */
async function captureTicketElementToPdf(element: HTMLElement, registrationId: string): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    onclone: (_clonedDoc, clonedElement) => {
      if (clonedElement instanceof HTMLElement) {
        sanitizeClonedSubtreeForHtml2canvas(clonedElement);
      }
    },
  });

  let imgData: string;
  try {
    imgData = canvas.toDataURL("image/jpeg", 0.95);
  } catch {
    throw new Error("Canvas export blocked (image security policy)");
  }

  const aspectRatio = canvas.width / canvas.height;
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: aspectRatio > 1 ? "landscape" : "portrait",
  });
  const margin = 8;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  let imgWidth = usableWidth;
  let imgHeight = imgWidth / aspectRatio;

  if (imgHeight > usableHeight) {
    imgHeight = usableHeight;
    imgWidth = imgHeight * aspectRatio;
  }

  const x = margin + (usableWidth - imgWidth) / 2;
  const y = margin + (usableHeight - imgHeight) / 2;

  pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);

  pdf.save(`FutureFin-Ticket-${sanitizeFilenameSegment(registrationId)}.pdf`);
}

/** Plain-text fallback when DOM capture is unavailable or fails. */
function downloadTicketPdfPlainText(payload: TicketSharePayload): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 20;
  let y = margin;
  const lineHeight = 6;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  const addParagraph = (text: string, fontSize = 11) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > 285) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
  };

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FutureFin Expo — Digital ticket", margin, y);
  y += lineHeight * 2.5;
  doc.setFont("helvetica", "normal");

  addParagraph(`Event: ${payload.event.name}`, 12);

  if (payload.event.date) {
    const start = new Date(payload.event.date);
    const endPart = payload.event.endDate
      ? ` – ${new Date(payload.event.endDate).toLocaleString()}`
      : "";
    addParagraph(`When: ${start.toLocaleString()}${endPart}`);
  }

  if (payload.event.location) {
    addParagraph(`Venue: ${payload.event.location}`);
  }

  if (payload.event.description) {
    addParagraph(payload.event.description);
  }

  y += lineHeight;
  addParagraph("— Attendee —", 11);
  addParagraph(`Name: ${payload.fullName}`);
  addParagraph(`Email: ${payload.email}`);
  if (payload.designation) addParagraph(`Role: ${payload.designation}`);
  if (payload.company) addParagraph(`Company: ${payload.company}`);
  if (payload.badge) addParagraph(`Badge: ${payload.badge}`);
  if (payload.registrationId && payload.registrationId !== "N/A") {
    addParagraph(`Registration ID: ${payload.registrationId}`);
  }

  y += lineHeight;
  doc.setFontSize(9);
  doc.setTextColor(100);
  addParagraph("Present your registration at the venue kiosk for check-in.");

  doc.save(`FutureFin-Ticket-${sanitizeFilenameSegment(payload.registrationId)}.pdf`);
}

/**
 * Prefer capturing the live ticket card so PDF matches View Ticket (colors, typography, layout).
 * Falls back to a simple text PDF if `sourceElement` is missing or capture fails.
 */
export async function downloadTicketPdf(
  payload: TicketSharePayload,
  sourceElement?: HTMLElement | null,
): Promise<void> {
  if (sourceElement) {
    try {
      await captureTicketElementToPdf(sourceElement, payload.registrationId);
      return;
    } catch (err) {
      console.error("Ticket PDF capture failed:", err);
      toast.error("Could not capture ticket layout. Downloading a text-only copy.");
    }
  }
  downloadTicketPdfPlainText(payload);
}

/**
 * Build a single calendar event. If endDate is missing, end = start + 8 hours (full-day style default).
 */
export function downloadEventCalendar(payload: TicketSharePayload): void {
  const start = payload.event.date ? new Date(payload.event.date) : new Date();
  let end: Date;
  if (payload.event.endDate) {
    end = new Date(payload.event.endDate);
  } else {
    end = new Date(start.getTime() + 8 * 60 * 60 * 1000);
  }
  if (end.getTime() <= start.getTime()) {
    end = new Date(start.getTime() + 8 * 60 * 60 * 1000);
  }

  const uid =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `${crypto.randomUUID()}@futurefin-expo.local`
      : `${Date.now()}-${Math.random().toString(36).slice(2)}@futurefin-expo.local`;

  const descParts = [
    payload.event.description ?? "",
    `Attendee: ${payload.fullName}`,
    payload.registrationId && payload.registrationId !== "N/A"
      ? `Registration ID: ${payload.registrationId}`
      : "",
  ].filter(Boolean);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FutureFin//Ticket//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsUtc(new Date())}`,
    `DTSTART:${formatIcsUtc(start)}`,
    `DTEND:${formatIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(payload.event.name)}`,
  ];

  if (payload.event.location) {
    lines.push(`LOCATION:${escapeIcsText(payload.event.location)}`);
  }

  lines.push(`DESCRIPTION:${escapeIcsText(descParts.join("\n"))}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  const ics = lines.join("\r\n") + "\r\n";
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  triggerBlobDownload(blob, "futurefin-event.ics");
}

function hasShareableRegistrationId(registrationId: string | undefined): boolean {
  const id = registrationId?.trim() ?? "";
  if (!id) return false;
  if (id === "N/A") return false;
  if (/processing/i.test(id)) return false;
  return true;
}

export async function shareTicket(payload: TicketSharePayload): Promise<void> {
  const path = window.location.pathname.replace(/\/$/, "") || "";
  const base = `${window.location.origin}${path}`;

  const url = hasShareableRegistrationId(payload.registrationId)
    ? `${base}#/view-ticket?registrationId=${encodeURIComponent(payload.registrationId.trim())}`
    : `${base}#/view-ticket?email=${encodeURIComponent(payload.email.trim())}`;

  const title = `${payload.event.name} — Your ticket`;
  const text = `${payload.fullName}, view your ticket for ${payload.event.name}.`;

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : "";
      if (name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success("Ticket link copied to clipboard");
  } catch {
    toast.error("Could not copy automatically", { description: url });
  }
}
