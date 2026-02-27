# FIGMA DESIGN PROMPT — FutureFin Expo 2026
# Smart Attendance & Avatar Kiosk Platform
# Copy-paste this entire prompt into your AI design tool or use as Figma brief

---

## PROJECT OVERVIEW

Design a complete end-to-end event management platform called **FutureFin Expo 2026** — a premium evening FinTech expo (4 PM–11 PM) held at Grand Meridian Convention Center, Dubai. The platform has 3 parts:

1. **Admin Portal** (Web) — Event creation, guest management, invitations, kiosk management
2. **Registration Portal** (Web/Mobile) — Invitee-facing: RSVP, profile setup, face capture, digital ticket
3. **Kiosk Application** (On-Site) — Face recognition check-in, AI avatar assistant with generic + personalised modes

Design all screens for Figma with components, variants, states, and a connected prototype.

---

## DESIGN SYSTEM

### Color Tokens (Dark Theme — Kiosk)
- `--bg`: #0B0F1A (base background)
- `--bg2`: #101728 (elevated surfaces)
- `--card`: #151D32 (cards, bubbles)
- `--primary`: #22D3EE (cyan — main accent, links, avatar glow)
- `--secondary`: #8B5CF6 (violet — gradients, secondary accent)
- `--success`: #34D399 (green — check-in confirmed, online status)
- `--warning`: #FBBF24 (amber — scanning animation, pending)
- `--error`: #FB7185 (rose — errors, destructive actions)
- `--text`: #F1F5F9 (primary text)
- `--text-muted`: #94A3B8 (secondary text, labels)
- `--border`: #1E293B (card borders, dividers)

### Color Tokens (Light Theme — Admin & Registration Portal)
- `--bg`: #FFFFFF
- `--bg2`: #F8FAFC
- `--card`: #FFFFFF (with border)
- `--text`: #0F172A
- `--text-muted`: #64748B
- `--border`: #E2E8F0
- Same accent colors: primary #22D3EE, secondary #8B5CF6, success #34D399, warning #FBBF24, error #FB7185

### Typography
- **Display:** Plus Jakarta Sans, 32px, weight 800 (hero titles)
- **Heading 1:** Plus Jakarta Sans, 22px, weight 700 (section titles)
- **Heading 2:** Plus Jakarta Sans, 17px, weight 700 (card values)
- **Body:** Plus Jakarta Sans, 15px, weight 400 (paragraphs, chat)
- **Caption:** Plus Jakarta Sans, 12px, weight 500 (labels, meta)
- **Mono:** Space Mono, 12px, weight 700 (branding, badge text, clock)

### Spacing & Radius
- Base unit: 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 48, 64
- Cards: 14px radius. Buttons: 100px (pill). Avatars: 50% (circle). Inputs: 100px (pill)
- Card padding: 16px (compact), 20px (standard), 24px (spacious)

---

## FIGMA FILE STRUCTURE (10 Pages)

1. **Cover** — Project title, version, team
2. **Design System** — Colors, typography, spacing, icons, all component variants
3. **Admin Portal** — Screens 1–10
4. **Event Creation Wizard** — 6-step flow
5. **Guest Management** — Guest list, invitations
6. **Registration Portal** — 8 screens (invitee-facing)
7. **Kiosk: Generic Avatar** — Chat interface
8. **Kiosk: Personalised Avatar** — Grid, scan, result
9. **Prototype Flows** — Connected interactive prototype
10. **Handoff** — Developer specs, redlines

---

## PART A: ADMIN PORTAL (Web, Desktop 1440px, Light Theme)

### Screen A1 — Login
- Centered card (480px) with event logo on top
- Email + password fields
- "Sign in with Google" and "Sign in with Microsoft" SSO buttons
- 2FA toggle option
- "Forgot password?" link
- Background: subtle gradient or event imagery

### Screen A2 — Dashboard Home
- Left sidebar navigation (collapsible, 240px):
  - Dashboard, Events, Guest List, Invitations, Knowledge Base, Kiosks, Live Attendance, Analytics, Settings
  - Each item: icon + label, active state with primary color highlight
- Main content area:
  - 4 stat cards in a row: Total Invited (blue), Registered (amber), Checked In (green), Pending (muted) — each with number, label, trend arrow
  - Live attendance chart (line chart, real-time updates)
  - Upcoming events list (card format)
  - Quick action buttons: "Create Event", "Send Invitations", "View Live Feed"

### Screen A3 — Event List
- Grid of event cards (3 columns)
- Each card: Banner image, event name, date, venue, status badge (Draft/Active/Completed), attendee count
- Search bar + filter dropdowns (status, date range)
- "+ Create Event" button (top-right, primary)
- Empty state: illustration + "No events yet. Create your first event."

### Screen A4 — Event Detail
- Tabbed interface: Overview, Schedule, Halls & Seating, Speakers, Sponsors, Settings
- Overview tab: Event banner, name, date, venue, description, edit button
- Schedule tab: Gantt-style timeline with sessions, drag-to-reorder
- Halls tab: List of halls with capacity, equipment tags, floor plan image
- Speakers tab: Grid of speaker cards with photo, name, title, session assignment

### Screen A5 — Guest List
- Data table with columns: Checkbox, Avatar, Name, Email, Company, Badge Type, Status (color-coded chip), Actions (⋯ menu)
- Status chips: Invited (gray), Registered (amber), Face Captured (blue), Checked In (green)
- Top bar: Search, filter by status, filter by badge type, "Import CSV" button, "+ Add Guest" button
- Bulk actions bar (appears when checkboxes selected): Send Invite, Change Badge Type, Remove
- Pagination: 25/50/100 per page

### Screen A6 — Invitation Manager
- Split view: Left = email template editor (WYSIWYG), Right = live preview
- Template variables: {{name}}, {{event_name}}, {{date}}, {{venue}}, {{registration_link}}, {{qr_code}}
- Channel tabs: Email, SMS, WhatsApp
- "Preview" button, "Send Test" button, "Schedule Send" date picker
- "Send to All Pending" batch button with confirmation dialog
- Delivery stats below: Sent, Delivered, Opened, Clicked, Registered (funnel chart)

### Screen A7 — RAG Knowledge Base
- Upload area: Drag & drop for PDF, MD, DOCX files
- Uploaded documents list: File name, size, upload date, chunk count, status (Processing/Ready)
- "Test Q&A" panel: Input field to ask questions, shows answer + source chunks highlighted
- "Delete" and "Re-process" actions per document

### Screen A8 — Kiosk Manager
- List of registered kiosks: Kiosk ID, Location/Hall, Status (Online green / Offline red), Last heartbeat, Avatar mode
- "Register New Kiosk" button → modal with device ID, location assignment, avatar persona config
- Kiosk health dashboard: Uptime %, camera status, network quality

### Screen A9 — Live Attendance
- Real-time feed (WebSocket): Cards appearing as people check in — face photo, name, time, hall
- Hall-wise heat map: Color-coded boxes showing occupancy % per hall
- Counter at top: Total checked in / Total registered (e.g., "847 / 3,200")
- "Export Report" button (CSV/PDF)

### Screen A10 — Analytics & Reports
- Registration funnel chart: Invited → Registered → Face Captured → Checked In (with drop-off %)
- Check-in timeline: Line chart showing check-ins per 15-minute interval
- Peak hours bar chart
- Session popularity: Horizontal bar chart (most attended sessions)
- No-show list: Table of registered but not checked-in guests
- Export: PDF report, CSV data

---

## PART B: REGISTRATION PORTAL (Web Responsive, Mobile-first 375px + Desktop 1440px, Light Theme)

### Screen R1 — Event Landing Page
**Header:**
- Full-width hero banner (event branding, gradient overlay)
- Event logo (80px), event name (32px bold), tagline (18px muted)
- Date & time pill with icon, Venue pill with map-pin icon

**Countdown Timer:**
- 4 dark cards: Days, Hours, Minutes, Seconds (live)
- If event started: "Event is Live!" green badge instead

**CTA:**
- "Register Now" button (large, primary gradient, full-width on mobile)
- "Already registered? View your ticket" link

**Highlights:** 4 icon cards: "40+ Sessions", "150+ Exhibitors", "$500K Startup Prize", "3,200+ Attendees"

**Speaker Spotlight:** Horizontal scroll, 4–6 speaker cards (photo, name, title)

**Footer:** Organizer logo, social links, contact, privacy policy

**States (4):** Pre-event (countdown), Event day ("Happening Now"), Post-event ("Event ended"), Registration closed ("Full — Join waitlist")

### Screen R2 — OTP Verification
- Centered card (480px), event logo at top
- Title: "Verify Your Identity"
- Email/phone input field → "Send OTP" button
- After sending: 6 individual digit boxes (auto-focus next on entry), auto-submit when complete
- Resend timer: "Resend code in 0:45"
- **States (7):** Enter email (default), Sending OTP (spinner), OTP input (timer), Verifying (spinner), Success (green check, auto-redirect), Error: invalid code (red boxes, shake), Error: email not found, Error: too many attempts

### Screen R3 — Profile Setup
**Progress stepper at top:** Profile (active) → Face Capture → Review → Confirmed

**Form fields:**
| Field | Type | Required |
|-------|------|----------|
| Full Name | Text | Yes (pre-filled) |
| Email | Email | Yes (read-only, verified) |
| Phone Number | Phone + country code | Yes |
| Company | Text | Yes |
| Designation | Text | Yes |
| LinkedIn URL | URL | No |
| Industry | Dropdown (Banking, FinTech, Crypto, etc.) | No |
| Country | Searchable dropdown with flags | Yes |
| Dietary Preference | Multi-select chips | No |
| Accessibility Needs | Multi-select chips | No |
| Sessions of Interest | Multi-select session list | No |

- "Continue to Face Capture" primary button (disabled until required fields valid)
- "Save & Continue Later" link
- Inline validation on blur

### Screen R4 — Face Capture (Camera) ⭐ MOST CRITICAL SCREEN
**Progress stepper:** Profile ✓ → Face Capture (active) → Review → Confirmed

**Instructions panel:** Title + 4 tips with icons (good lighting, face camera, remove sunglasses, neutral expression)

**Camera feed area (480px, 16:9):**
- Live webcam feed
- Oval face guide overlay (dashed, semi-transparent)
- Green border when face properly positioned, red when not

**Quality checklist (real-time, below camera):**
- ✓/✗ Face detected
- ✓/✗ Face centered
- ✓/✗ Good lighting
- ✓/✗ No obstructions
- ✓/✗ Image sharp
- ✓/✗ Single face only

**Buttons:**
- "Capture Photo" — large primary, DISABLED until all 6 checks pass
- "Upload Photo Instead" link
- "Skip for Now" muted link (with warning tooltip)

**After capture — Preview mode:**
- Captured image replaces camera feed
- "Looking good!" overlay message
- "Retake" (ghost) + "Use This Photo" (primary) buttons
- Small badge preview of cropped face

**Design ALL 7 states:**
1. Camera permission request (browser dialog + instruction text)
2. Camera loading (spinner, "Initializing camera...")
3. No face detected (red overlay, checklist red)
4. Face detected & aligned (green overlay, checklist green, capture enabled)
5. Photo captured (preview with retake/confirm)
6. Processing (spinner, "Analyzing image...")
7. Success (green checkmark animation, auto-advance 1s)

**Design ALL 4 error states:**
1. Permission denied ("Allow camera in browser settings" + Upload button)
2. No camera found ("No camera detected" + Upload button)
3. Upload failed ("Please try again" + Retry)
4. Quality too low ("Retake with better lighting")

### Screen R5 — Photo Upload (Alternative)
- Large drag-and-drop zone (dashed border, upload icon)
- "Drag & drop or click to browse" — accepts JPG, PNG, HEIF (max 10MB)
- After upload: Crop tool with oval guide, zoom slider (1x–3x), rotate buttons, "Auto-detect face" button
- Same 6-point quality checklist
- "Use This Photo" (primary) + "Choose Different Photo" link
- Error states: No face, multiple faces, file too large, wrong format

### Screen R6 — Review & Confirm
**Progress stepper:** Profile ✓ → Face Capture ✓ → Review (active) → Confirmed

**4 section cards with "Edit" buttons:**
1. Personal Details: Name, email, phone, company, designation, country
2. Face Photo: Circular 100px image, green "Face Captured" badge (or amber "Skipped"), "Retake" link
3. Preferences: Dietary, accessibility, sessions
4. Event Details (read-only): Event name, date, venue, badge type

**Consent checkboxes:**
- ☐ "I agree to Terms & Conditions and Privacy Policy" (required)
- ☐ "I consent to face recognition for check-in" (required if face captured)
- ☐ "Receive event updates via email" (optional, pre-checked)

**"Confirm Registration" button** (primary, large, disabled until required boxes checked)

**States:** Default review, Edit mode (inline expand), Submitting (spinner), Error (retry)

### Screen R7 — Registration Confirmation & Digital Ticket
**Success moment:**
- Confetti/particle animation (2–3s)
- Large green checkmark (scale-up animation)
- "You're Registered!" (32px bold) + "See you at FutureFin Expo 2026!"

**Digital ticket card (styled as real ticket):**
- Top: Event logo, name, date
- Middle: Attendee name (large), designation, company, face photo (circular 60px)
- Badge type colored strip (Blue=General, Black=VIP, Gold=Speaker)
- QR code (128px)
- Bottom: Hall assignment, seat number, floor
- Registration ID (monospace)

**Action buttons:**
- "Download Ticket (PDF)"
- "Add to Apple Wallet / Google Wallet"
- "Add to Calendar"
- "Share" (native share sheet)

**Below:** "What to Expect" cards (Schedule, Venue Map, Networking Tips), "Download Event App" with store badges

### Screen R8 — My Ticket (Return Visit)
- "Welcome back, [Name]!" header with face photo
- Digital ticket card (same as R7)
- QR code tap-to-expand (full-screen)
- Actions: "Update Profile", "Retake Face Photo", "Download Ticket", "Cancel Registration"
- 4 tabs: Schedule, Venue Map, Speakers, My Agenda

---

## PART C: KIOSK APPLICATION (1920x1080, Landscape, Dark Theme)

### Layout Structure
- **Header bar:** Event logo/branding (left), live clock + connection status dot (right), 1px bottom border
- **Tab bar:** "Generic Avatar" tab + "Personalised Avatar" tab, active state with cyan underline

### Screen K1 — Generic Avatar (Tab 1)
**Centered column layout (max 640px):**
- Avatar: 160px circular image with gradient ring (cyan→violet) and pulsing glow
- Speaking indicator: 5 vertical bars (4px wide, cyan), animated when speaking, flat gray when idle
- Label: "Ava · Virtual Assistant"
- Chat area (scrollable): Bot bubbles (left, dark card bg, rounded 4px top-left) + User bubbles (right, gradient bg, rounded 4px top-right)
- Input row: Pill input field + "Send" gradient button

**Initial bot message:** "Hello! I'm Ava, your virtual assistant. I can help with event schedules, hall locations, WiFi, parking, dining, and more."

**Chat behavior:** User types → message appears right → bars animate → bot responds left (1s delay)

### Screen K2 — Personalised Avatar: User Grid (Tab 2, First View)
**Centered layout:**
- Title: "Select to Check In" (with gradient text on "Check In")
- Subtitle: "Tap a person to simulate face recognition"
- 5-column grid of user cards (10 people):
  - Each card: Avatar (56px circle with border), name (12px bold), role (10px muted)
  - Hover: translate Y -3px, cyan border, shadow
  - Touch target: entire card

**10 sample users with unique avatars:**
1. Arun Krishnan — Sr. Software Engineer
2. Sarah Mitchell — Product Manager
3. Ravi Menon — Visitor · Client Partner
4. Priya Sharma — Engineering Director
5. James Wong — VP of Product (with glasses)
6. Anita Desai — UX Design Lead
7. David Chen — Data Scientist
8. Fatima Al-Said — Security Architect
9. Tom Baker — Summer Intern
10. Lisa Park — Keynote Speaker

### Screen K3 — Scanning Overlay
- Full-screen overlay, dark (#0B0F1A at 92% opacity) + backdrop blur
- Centered scan ring: 180px circle, 3px amber border, pulsing box-shadow
- Person's avatar inside ring (130px, 80% opacity)
- Horizontal scan line sweeping top to bottom (amber gradient, 0.85s loop)
- Text: "Identifying face..." (amber, 15px bold)
- Subtext: "Please hold still" (muted)
- Duration: 2 seconds, then transition to result

### Screen K4 — Personalised Result (Split Layout)
**Left panel (360px, border-right):**
- Avatar Ava: 140px circular with gradient ring and glow
- Speaking bars (5, animated during speech)
- Label: "Ava · Virtual Assistant"
- Speech bubble: Dark card, gradient top border (2px cyan→violet), typed text with blinking cursor
  - Sample: "Welcome Arun! Good evening. Your hall is Hall A — Auditorium, Ground Floor. Your session 'Microservices at Scale' starts at 11:30 AM. Need anything? Just ask!"
- Quick-ask buttons (pill shape): "Where is coffee?", "WiFi details", "Parking info", "Full schedule"

**Right panel (flex, scrollable):**
- **Profile card:** Person's avatar (60px), name (20px bold), designation, green "CHECKED IN · 6:32 PM" badge, meta line (ID, department, reports to)
- **Info cards grid (2×2 + 1 full-width):**
  - Hall: Building icon (cyan bg), "HALL" label, value, capacity sub
  - Location: Map icon (violet bg), "LOCATION" label, floor, building sub
  - Seat: Pin icon (green bg), "SEAT" label, seat number, zone sub
  - Event: Calendar icon (amber bg), "EVENT" label, session name, time sub
  - Directions (full-width): Map icon, "DIRECTIONS" label, numbered pill chips (e.g., "① Main Lobby → ② Left at Reception → ③ Glass Corridor → ④ Hall A")
- **"← Back to list" button** (bottom bar)

---

## COMPONENT LIBRARY (Build as Figma components with variants)

| Component | Variants |
|-----------|----------|
| Button | Primary, Secondary, Ghost, Destructive × SM, MD, LG × Default, Hover, Active, Disabled, Loading |
| Input | Text, Email, Phone, Search, OTP × Default, Focus, Error, Disabled × With/without icon |
| Avatar | XS(24), SM(32), MD(48), LG(64), XL(140) × With/without gradient ring × Image/Initials |
| Badge/Chip | Invited(gray), Registered(amber), Captured(blue), CheckedIn(green) × General, VIP, Speaker, Exhibitor, Media |
| Card | Info card, Profile card, Event card, Stat card × Dark/Light theme |
| Table Row | Header, Data, Alternating × With checkbox, avatar, action menu |
| Chat Bubble | Bot(left), User(right) × With/without avatar |
| Direction Chip | Numbered pill: circle number + text |
| Speaking Bars | 5 bars × Active(animated), Idle(flat) |
| Tab Bar | 2–5 tabs × With icon × Active, Inactive, Hover |
| Modal | Confirmation, Alert, Form × With/without icon |
| Toast | Success, Error, Warning, Info × With/without action |
| Stepper | 3–5 steps × Completed, Active, Upcoming |
| Quality Check Item | Label + ✓(green) or ✗(red) icon |
| Ticket Card | General(blue), VIP(black), Speaker(gold) with QR code |

---

## ANIMATION SPECS

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Avatar glow pulse | 3s loop | ease-in-out | Continuous |
| Speaking bars | 0.45s loop | ease-in-out alternate | During avatar speech |
| Scan line sweep | 0.85s loop | ease-in-out | Face scan overlay |
| Scan ring pulse | 1s loop | ease-in-out | Scanning |
| Chat bubble enter | 0.3s | ease-out | New message |
| Card slide up | 0.45s | ease-out | Result screen load |
| Typing cursor blink | 0.7s loop | ease-in-out | Speech bubble typing |
| Status dot | 2s loop | ease-in-out | Header live indicator |
| User card hover | 0.25s | ease-out | Hover/touch |
| Confetti burst | 2–3s | ease-out | Registration success |
| Checkmark scale | 0.5s | spring | Capture/registration success |
| OTP box shake | 0.3s | ease | Invalid OTP error |

---

## TOTAL SCREEN COUNT: 42

| Module | Screens | Platform |
|--------|---------|----------|
| Admin: Auth & Dashboard | 3 | Web Desktop 1440px |
| Admin: Event Management | 8 | Web Desktop |
| Admin: Guest & Invitations | 5 | Web Desktop |
| Admin: Kiosk & Analytics | 4 | Web Desktop |
| Registration Portal | 8 | Web Responsive 375px + 1440px |
| Kiosk: Generic Avatar | 3 | Kiosk 1920×1080 |
| Kiosk: Personalised Avatar | 5 | Kiosk 1920×1080 |
| Overlays & Modals | 6 | Various |
| **TOTAL** | **42** | |

---

## PROTOTYPE FLOW CONNECTIONS

**Flow 1 — Admin creates event:**
Login → Dashboard → Events → Create Event (6 steps) → Event Detail → Guest List → Import CSV → Send Invitations

**Flow 2 — Guest registers:**
Landing Page → OTP → Profile Setup → Face Capture → Review & Confirm → Confirmation Ticket

**Flow 3 — Guest returns:**
Landing Page → "View Ticket" → My Ticket (with update/retake options)

**Flow 4 — Kiosk Generic:**
Idle → User types → Ava responds → Multiple Q&A turns → Idle timeout

**Flow 5 — Kiosk Personalised:**
User Grid → Tap person → Scan overlay (2s) → Result screen (avatar speaks + info cards) → Quick-ask Q&A → Back to grid

---

END OF PROMPT. Design all 42 screens with the specified design system, components, states, and prototype flows.