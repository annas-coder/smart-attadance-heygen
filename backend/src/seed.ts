import mongoose from "mongoose";
import { env } from "./config/env.js";
import { User } from "./models/User.js";
import { Organization } from "./models/Organization.js";
import { Event } from "./models/Event.js";
import { Guest } from "./models/Guest.js";
import { ActivityLog } from "./models/ActivityLog.js";
import { generateRegistrationId } from "./utils/generateId.js";

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    Event.deleteMany({}),
    Guest.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  // Create organization
  const org = await Organization.create({
    name: "FutureFin Expo",
    email: "admin@futurefin.com",
    timezone: "Asia/Dubai",
    emailNotifications: true,
    smsNotifications: false,
    autoApprove: false,
    requireFaceCapture: true,
  });
  console.log("Created organization:", org.name);

  // Create admin user (password: admin123)
  const admin = await User.create({
    email: "admin@futurefin.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    organizationId: org._id,
  });
  console.log("Created admin user:", admin.email);

  // Create events
  const mainEvent = await Event.create({
    name: "FutureFin Expo 2026",
    date: new Date("2026-03-15T16:00:00"),
    endDate: new Date("2026-03-15T23:00:00"),
    location: "Grand Meridian Convention Center, Dubai",
    description:
      "Premium FinTech event bringing together industry leaders, innovators, and visionaries.",
    status: "ongoing",
    organizationId: org._id,
  });

  const secondEvent = await Event.create({
    name: "FinTech Summit Dubai",
    date: new Date("2026-04-22T09:00:00"),
    endDate: new Date("2026-04-22T18:00:00"),
    location: "Jumeirah Beach Hotel",
    description: "Annual FinTech summit focusing on blockchain and digital payments.",
    status: "upcoming",
    organizationId: org._id,
  });
  console.log("Created events:", mainEvent.name, "|", secondEvent.name);

  // Create guests for main event
  const guestData = [
    {
      fullName: "Arun Krishnan",
      email: "arun.krishnan@techcorp.com",
      phone: "+971 50 123 4567",
      company: "TechCorp Industries",
      designation: "Senior Engineer",
      badge: "VIP" as const,
      status: "CheckedIn" as const,
      industry: "fintech",
      country: "uae",
      checkedInAt: new Date(),
    },
    {
      fullName: "Sarah Mitchell",
      email: "sarah.m@financegroup.com",
      phone: "+44 7700 900123",
      company: "Finance Group",
      designation: "Product Manager",
      badge: "General" as const,
      status: "Registered" as const,
      industry: "banking",
      country: "uk",
    },
    {
      fullName: "Ravi Menon",
      email: "ravi@clientpartners.ae",
      phone: "+971 55 987 6543",
      company: "Client Partners",
      designation: "Director of Engineering",
      badge: "General" as const,
      status: "FaceCaptured" as const,
      industry: "fintech",
      country: "uae",
    },
    {
      fullName: "Priya Sharma",
      email: "priya.sharma@innovatech.in",
      phone: "+91 98765 43210",
      company: "InnovaTech Solutions",
      designation: "Data Scientist",
      badge: "Speaker" as const,
      status: "CheckedIn" as const,
      industry: "fintech",
      country: "in",
      checkedInAt: new Date(),
    },
    {
      fullName: "James Wilson",
      email: "james.wilson@payflow.com",
      phone: "+1 555 0123",
      company: "PayFlow Inc",
      designation: "VP of Product",
      badge: "VIP" as const,
      status: "Registered" as const,
      industry: "payments",
      country: "us",
    },
    {
      fullName: "Fatima Al-Rashid",
      email: "fatima@dubaifinance.ae",
      phone: "+971 50 555 1234",
      company: "Dubai Finance Authority",
      designation: "Chief Innovation Officer",
      badge: "VIP" as const,
      status: "CheckedIn" as const,
      industry: "banking",
      country: "uae",
      checkedInAt: new Date(),
    },
    {
      fullName: "Chen Wei",
      email: "chen.wei@blockchainlabs.sg",
      phone: "+65 9123 4567",
      company: "Blockchain Labs Asia",
      designation: "Lead Researcher",
      badge: "Speaker" as const,
      status: "FaceCaptured" as const,
      industry: "crypto",
      country: "other",
    },
    {
      fullName: "Maria Garcia",
      email: "maria@insuretech.eu",
      phone: "+34 612 345 678",
      company: "InsureTech Europe",
      designation: "Security Architect",
      badge: "General" as const,
      status: "Invited" as const,
      industry: "insurance",
      country: "other",
    },
    {
      fullName: "Ahmed Hassan",
      email: "ahmed@nexusventures.sa",
      phone: "+966 50 123 4567",
      company: "Nexus Ventures",
      designation: "Managing Partner",
      badge: "VIP" as const,
      status: "Registered" as const,
      industry: "fintech",
      country: "sa",
    },
    {
      fullName: "Lisa Thompson",
      email: "lisa@digitalbank.co.uk",
      phone: "+44 7911 123456",
      company: "Digital Bank UK",
      designation: "Intern",
      badge: "General" as const,
      status: "Invited" as const,
      industry: "banking",
      country: "uk",
    },
  ];

  const guests = [];
  for (const data of guestData) {
    const guest = await Guest.create({
      ...data,
      eventId: mainEvent._id,
      registrationId: data.status !== "Invited" ? generateRegistrationId() : undefined,
      registeredAt:
        data.status !== "Invited" ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      agenda: {
        sessions: [
          {
            title: "Keynote: Future of Financial Technology",
            location: "Grand Ballroom, Floor 2",
            time: "2:00 PM - 3:00 PM",
          },
          {
            title: "Networking Break",
            location: "Exhibition Hall",
            time: "3:30 PM - 4:00 PM",
          },
          {
            title: "AI in Finance Panel",
            location: "Conference Room A, Floor 3",
            time: "4:00 PM - 5:00 PM",
          },
        ],
      },
    });
    guests.push(guest);
  }
  console.log(`Created ${guests.length} guests for ${mainEvent.name}`);

  // Create some guests for second event
  await Guest.create({
    fullName: "John Doe",
    email: "john.doe@example.com",
    company: "Example Corp",
    badge: "General",
    status: "Invited",
    eventId: secondEvent._id,
  });
  await Guest.create({
    fullName: "Jane Smith",
    email: "jane.smith@company.com",
    company: "Company Inc",
    badge: "VIP",
    status: "Invited",
    eventId: secondEvent._id,
  });
  console.log("Created 2 guests for", secondEvent.name);

  // Create activity logs
  const logs = [
    {
      eventId: mainEvent._id,
      guestId: guests[0]._id,
      action: "checked_in" as const,
      details: `${guests[0].fullName} checked in to ${mainEvent.name}`,
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      eventId: mainEvent._id,
      guestId: guests[1]._id,
      action: "registered" as const,
      details: `${guests[1].fullName} completed registration`,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      eventId: mainEvent._id,
      action: "invited" as const,
      details: `12 new guests invited to ${mainEvent.name}`,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      eventId: mainEvent._id,
      action: "event_created" as const,
      details: `Event "${mainEvent.name}" was created`,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];
  await ActivityLog.insertMany(logs);
  console.log("Created activity logs");

  console.log("\n--- Seed Complete ---");
  console.log("Admin login:  admin@futurefin.com / admin123");
  console.log(`Main event ID: ${mainEvent._id}`);
  console.log("---\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
