import {
  BadgeDollarSign,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  Compass,
  Handshake,
  MessageSquare,
  Rocket,
  Sparkles,
  Users
} from "lucide-react";

export const navItems = [
  { label: "Feed", icon: Compass },
  { label: "Matches", icon: Handshake },
  { label: "Startups", icon: Rocket },
  { label: "Investors", icon: BadgeDollarSign },
  { label: "Messages", icon: MessageSquare },
  { label: "Events", icon: CalendarDays },
  { label: "Jobs", icon: BriefcaseBusiness }
];

export const metrics = [
  { label: "Warm intros", value: "47", trend: "+18%" },
  { label: "Match quality", value: "91%", trend: "+6%" },
  { label: "Investor interest", value: "$2.4M", trend: "+31%" },
  { label: "Network reach", value: "12.8k", trend: "+12%" }
];

export const posts = [
  {
    author: "Maya Chen",
    role: "Founder at LatticePay",
    tag: "Funding Announcement",
    time: "14m",
    title: "We opened our seed round to expand programmable payroll for global teams.",
    body: "Looking for fintech angels with payroll, compliance, or LATAM market experience. Deck room is live for verified investors.",
    reactions: ["Bullish", "Insightful", "Interested"],
    comments: 19
  },
  {
    author: "Arjun Mehta",
    role: "Operator, ex-Stripe",
    tag: "Hiring",
    time: "38m",
    title: "Two climate founders need a founding growth lead for enterprise pilots.",
    body: "The company has $480k ARR, 8 design partners, and a wedge into industrial energy reporting.",
    reactions: ["Support", "Interested"],
    comments: 11
  },
  {
    author: "Sofia Alvarez",
    role: "Partner at Northstar Ventures",
    tag: "Investor Note",
    time: "1h",
    title: "AI infra deals are moving fastest when the buyer is already inside the workflow.",
    body: "I am saving teams with proof of daily usage, expansion data, and a narrow wedge into regulated ops.",
    reactions: ["Insightful", "Bullish"],
    comments: 34
  }
];

export const matches = [
  {
    name: "Nina Kapoor",
    title: "Full-stack CTO Candidate",
    location: "Bengaluru",
    score: 94,
    skills: ["React", "AI infra", "Hiring"],
    fit: ["Skill 97%", "Commitment 92%", "Vision 95%"]
  },
  {
    name: "Daniel Brooks",
    title: "Seed Investor",
    location: "New York",
    score: 89,
    skills: ["B2B SaaS", "Fintech", "GTM"],
    fit: ["Industry 93%", "Stage 88%", "Check size 86%"]
  },
  {
    name: "Leah Okafor",
    title: "Advisor, Enterprise Sales",
    location: "London",
    score: 87,
    skills: ["Enterprise", "Pricing", "Sales ops"],
    fit: ["Network 90%", "Market 86%", "Timing 84%"]
  }
];

export const startups = [
  {
    name: "OrbitLedger",
    industry: "Fintech",
    stage: "Seed",
    revenue: "$84k MRR",
    growth: "22% MoM",
    raise: "$1.8M"
  },
  {
    name: "VeyaHealth",
    industry: "Health AI",
    stage: "Pre-seed",
    revenue: "12 pilots",
    growth: "6 signed LOIs",
    raise: "$750k"
  },
  {
    name: "CarbonArc",
    industry: "Climate",
    stage: "Series A",
    revenue: "$2.1M ARR",
    growth: "41% YoY",
    raise: "$8M"
  }
];

export const activity = [
  { icon: Bell, text: "3 investors requested access to your deck room.", tone: "text-primary" },
  { icon: Users, text: "Nina Kapoor accepted your co-founder match request.", tone: "text-success" },
  { icon: ChartNoAxesCombined, text: "AI health score improved from 82 to 88.", tone: "text-secondary" },
  { icon: Sparkles, text: "New startup analyzer suggestions are ready.", tone: "text-warning" }
];

export const onboardingSteps = [
  { label: "Role", value: "Founder", done: true },
  { label: "Personal", value: "Bio ready", done: true },
  { label: "Professional", value: "6 skills", done: true },
  { label: "Goals", value: "Raise funding", done: false }
];

export const authMethods = ["Email", "Google", "GitHub", "LinkedIn", "Magic link", "OTP", "2FA"];

export const campaigns = [
  { label: "Seed Round", value: "$1.8M", meta: "18% committed" },
  { label: "Deck Views", value: "126", meta: "42 verified" },
  { label: "Meetings", value: "9", meta: "3 this week" }
];

export const modules = [
  "AI co-founder matching",
  "AI pitch deck review",
  "Startup valuation",
  "Event RSVP and ticketing",
  "Job applications",
  "Admin reports"
];
