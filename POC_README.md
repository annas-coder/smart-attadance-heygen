# FutureFin Expo 2026 - POC Prototype

A proof-of-concept demonstration of a complete event management platform for the FutureFin Expo 2026 premium FinTech event.

## Overview

This POC showcases three integrated platforms:

### 1. **Admin Portal** (Light Theme)
- **Dashboard**: Real-time statistics and live attendance tracking
- **Guest List**: Comprehensive attendee management with status tracking
- Clean, professional interface with responsive data tables
- Navigation sidebar with key admin functions

### 2. **Registration Portal** (Light Theme, Mobile-Responsive)
- **Landing Page**: Event information with countdown timer
- **Profile Setup**: Complete registration form with validation
- **Face Capture**: Camera-based photo capture with quality checks
- **Review & Confirm**: Data verification with consent management
- **Success Page**: Digital ticket with QR code and event details

### 3. **Kiosk Application** (Dark Theme, Full-Screen)
Two interactive modes:

#### Generic Avatar
- AI assistant chat interface
- Real-time conversational responses
- Animated speaking indicators
- Contextual help for event, WiFi, parking, dining, etc.

#### Personalized Avatar
- User selection grid (10 sample attendees)
- Simulated face scanning animation
- Personalized welcome messages
- Detailed attendee information cards
- Visual wayfinding with step-by-step directions

## Design System

### Typography
- **Primary Font**: Plus Jakarta Sans (400, 500, 700, 800)
- **Mono Font**: Space Mono (700)

### Color Palette
- **Primary**: #22D3EE (Cyan)
- **Secondary**: #8B5CF6 (Violet)
- **Success**: #34D399 (Green)
- **Warning**: #FBBF24 (Amber)
- **Error**: #FB7185 (Rose)

### Dark Theme (Kiosk)
- **Background**: #0B0F1A
- **Surface**: #101728
- **Card**: #151D32

### Light Theme (Admin/Registration)
- **Background**: #FFFFFF
- **Surface**: #F8FAFC
- **Border**: #E2E8F0

## Key Features Demonstrated

### Admin Portal
✓ Live statistics dashboard with charts (Recharts)
✓ Guest list with status badges and filtering
✓ Responsive sidebar navigation
✓ Clean, professional UI with gradient accents

### Registration Flow
✓ Multi-step wizard with progress indicator
✓ Form validation and state management
✓ Camera integration for face capture
✓ Real-time quality checks (simulated)
✓ Session storage for data persistence
✓ Animated success page with ticket

### Kiosk Experience
✓ Dual-mode interface (Generic + Personalized)
✓ Animated avatar with speaking indicators
✓ Real-time chat with contextual responses
✓ Face scanning simulation with animations
✓ Rich attendee information display
✓ Visual wayfinding system
✓ Smooth transitions and interactions

## Technical Stack

- **React** with TypeScript
- **React Router** for navigation
- **Tailwind CSS v4** for styling
- **Motion (Framer Motion)** for animations
- **Recharts** for data visualization
- **Lucide React** for icons

## Navigation

- **/** - Home (platform selector)
- **/admin** - Admin Dashboard
- **/admin/guests** - Guest List
- **/register** - Event Landing Page
- **/register/profile** - Profile Setup
- **/register/face** - Face Capture
- **/register/review** - Review & Confirm
- **/register/success** - Registration Success
- **/kiosk** - Kiosk Application

## Notable Interactions

1. **Countdown Timer**: Live updating countdown on landing page
2. **Camera Integration**: Real webcam access for face capture
3. **Quality Checks**: Animated checkmarks as face is detected
4. **Scanning Animation**: Pulsing ring with sweep effect
5. **Chat Interface**: Auto-scrolling messages with typing simulation
6. **Speaking Bars**: Animated audio visualization
7. **User Grid**: Hover effects with smooth transitions
8. **Personalized Results**: Staggered card animations

## Data Flow

Registration data flows through session storage:
1. Profile Setup → stores form data
2. Face Capture → stores captured image
3. Review → reads and displays all data
4. Success → generates ticket with stored info

## Sample Users (Kiosk)

The POC includes 10 diverse attendee profiles demonstrating different roles:
- Senior engineers and directors
- Product managers
- Keynote speakers
- VIP executives
- Interns
- Security professionals
- Data scientists

Each with unique:
- Hall assignments
- Session details
- Seating information
- Personalized greetings

## Design Highlights

- **Consistent branding** across all three platforms
- **Smooth animations** using Motion
- **Gradient accents** for premium feel
- **Responsive layouts** for mobile and desktop
- **Dark/Light themes** optimized for use case
- **Accessibility** with clear labels and contrast

---

**Status**: POC Level Prototype
**Version**: 1.0.0
**Event**: FutureFin Expo 2026
**Venue**: Grand Meridian Convention Center, Dubai
