import { createHashRouter } from "react-router";
import { DashboardSimple } from "./pages/admin/dashboard-simple";
import { Events } from "./pages/admin/events";
import { GuestsSimple } from "./pages/admin/guests-simple";
import { Settings } from "./pages/admin/settings";
import { RegistrationLanding } from "./pages/registration/landing";
import { ProfileSetup } from "./pages/registration/profile-setup";
import { FaceCapture } from "./pages/registration/face-capture";
import { ReviewConfirm } from "./pages/registration/review-confirm";
import { RegistrationSuccess } from "./pages/registration/success";
import { ViewTicket } from "./pages/registration/view-ticket";
import { KioskApp } from "./pages/kiosk/kiosk-app";
import { KioskMain } from "./pages/kiosk/kiosk-main-v2";

export const router = createHashRouter([
  {
    path: "/",
    Component: RegistrationLanding,
  },
  {
    path: "/admin",
    Component: DashboardSimple,
  },
  {
    path: "/admin/events",
    Component: Events,
  },
  {
    path: "/admin/guests",
    Component: GuestsSimple,
  },
  {
    path: "/admin/settings",
    Component: Settings,
  },
  {
    path: "/register",
    Component: RegistrationLanding,
  },
  {
    path: "/register/profile",
    Component: ProfileSetup,
  },
  {
    path: "/register/face",
    Component: FaceCapture,
  },
  {
    path: "/register/review",
    Component: ReviewConfirm,
  },
  {
    path: "/register/success",
    Component: RegistrationSuccess,
  },
  {
    path: "/view-ticket",
    Component: ViewTicket,
  },
  {
    path: "/kiosk",
    Component: KioskMain,
  },
  {
    path: "/kiosk/old",
    Component: KioskApp,
  },
]);