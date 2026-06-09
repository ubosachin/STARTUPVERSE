import type { UserRole, StartupStage, Visibility } from "@/lib/types/database";

export interface MockUser {
  id: string;
  clerk_id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface MockInvestor extends MockUser {
  user_id: string;
  firm_name: string;
  investment_thesis: string;
  focus_areas: string[];
  check_size_min: string;
  check_size_max: string;
  portfolio_companies: string[];
  preferred_stages: string[];
  lead_investor: boolean;
  board_member: boolean;
}

export interface MockProfile {
  id: string;
  user_id: string;
  full_name: string;
  bio: string;
  location: string;
  avatar: string | null;
  banner: string | null;
  skills: string[];
  experience: string;
  website: string;
  linkedin: string;
  twitter: string;
  headline?: string;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
}

export interface MockStartup {
  id: string;
  founder_id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  industry: string;
  stage: StartupStage;
  website: string;
  logo: string | null;
  is_verified?: boolean;
  is_hiring?: boolean;
  team_size?: number;
  location?: string;
  founded_year?: number;
  linkedin_url?: string;
  twitter_url?: string;
  github_url?: string;
  tech_stack?: string[];
  business_model?: string;
}


export interface MockStartupMember {
  id: string;
  startup_id: string;
  user_id: string;
  role: string;
}

export interface MockPost {
  id: string;
  author_id: string;
  user_id: string;
  content: string;
  visibility: Visibility;
  created_at: string;
  media?: { file_url: string; type: "image" | "video" | "file" }[];
  likes_count: number;
  comments_count: number;
  reposts_count: number;
}

export interface MockComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface MockReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
}

export interface MockConnection {
  id: string;
  sender_id: string;
  receiver_id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "declined" | "blocked";
}

export interface MockFollower {
  id: string;
  follower_id: string;
  following_id: string;
}

export interface MockMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  seen?: boolean;
}

export interface MockConversation {
  id: string;
  created_at: string;
  participant_ids: string[];
}

export interface MockMatch {
  id: string;
  user_a: string;
  user_b: string;
  match_type: "cofounder" | "investor" | "advisor" | "builder";
  score: number;
  saved?: boolean;
}

export interface MockFundingRound {
  id: string;
  startup_id: string;
  title: string;
  stage: string;
  round_type: string;
  target_amount: number;
  amount_raised: number;
  amount?: number;
  valuation: number;
  status: "planning" | "active" | "closed" | "paused";
}

export interface MockInvestorInterest {
  id: string;
  investor_id: string;
  funding_round_id: string;
  status: "interested" | "passed" | "committed" | "meeting_scheduled" | "due_diligence";
  notes?: string;
  updated_at: string;
}

export interface MockEvent {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  event_date: string;
  rsvps: string[]; // user ids
}

export interface MockJob {
  id: string;
  startup_id: string;
  title: string;
  salary: string;
  location: string;
  description: string;
  type: string;
  applications_count: number;
  location_type: string;
  equity_min?: number;
  equity_max?: number;
}

export interface MockApplication {
  id: string;
  job_id: string;
  user_id: string;
  status: "submitted" | "interviewing" | "offered" | "rejected";
  created_at: string;
}

export interface MockNotification {
  id: string;
  user_id: string;
  type: "match" | "message" | "connection" | "funding" | "reaction" | "system" | "startup" | "review";
  title: string;
  body: string;
  message?: string; // alias for body (used in newer code)
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface MockSubscription {
  id: string;
  user_id: string;
  plan: "Free" | "Founder Pro" | "Investor Pro" | "Startup Pro" | "Enterprise";
  status: string;
}

// Global server mock state
interface GlobalMockDb {
  users: MockUser[];
  profiles: MockProfile[];
  startups: MockStartup[];
  startup_members: MockStartupMember[];
  posts: MockPost[];
  comments: MockComment[];
  reactions: MockReaction[];
  connections: MockConnection[];
  followers: MockFollower[];
  messages: MockMessage[];
  conversations: MockConversation[];
  matches: MockMatch[];
  funding_rounds: MockFundingRound[];
  investor_interests: MockInvestorInterest[];
  events: MockEvent[];
  jobs: MockJob[];
  applications: MockApplication[];
  notifications: MockNotification[];
  subscriptions: MockSubscription[];
}

const defaultUsers: MockUser[] = [
  { id: "user-current", clerk_id: "demo-user", username: "alexbuilder", email: "alex@startupverse.dev", role: "Builder", created_at: new Date().toISOString() },
  { id: "user-maya", clerk_id: "clerk-maya", username: "mayachen", email: "maya@latticepay.com", role: "Founder", created_at: new Date().toISOString() },
  { id: "user-arjun", clerk_id: "clerk-arjun", username: "arjunmehta", email: "arjun@carbonarc.io", role: "CoFounder", created_at: new Date().toISOString() },
  { id: "user-sofia", clerk_id: "clerk-sofia", username: "sofiaalvarez", email: "sofia@northstar.vc", role: "Investor", created_at: new Date().toISOString() },
  { id: "user-daniel", clerk_id: "clerk-daniel", username: "danielbrooks", email: "daniel@apexcap.com", role: "Investor", created_at: new Date().toISOString() },
  { id: "user-leah", clerk_id: "clerk-leah", username: "leahokafor", email: "leah@salesadvisors.net", role: "Advisor", created_at: new Date().toISOString() }
];

const defaultProfiles: MockProfile[] = [
  {
    id: "profile-current",
    user_id: "user-current",
    full_name: "Alex Builder",
    bio: "Full-stack engineer building the future of founder collaboration tools.",
    location: "San Francisco, CA",
    avatar: null,
    banner: null,
    skills: ["React", "TypeScript", "Node.js", "AI engineering", "Next.js"],
    experience: "Founder at stealth startup, ex-Vercel software engineer",
    website: "https://alex.dev",
    linkedin: "linkedin.com/in/alex",
    twitter: "twitter.com/alex"
  },
  {
    id: "profile-maya",
    user_id: "user-maya",
    full_name: "Maya Chen",
    bio: "Founder at LatticePay. Raising Seed Round to expand payroll.",
    location: "Miami, FL",
    avatar: null,
    banner: null,
    skills: ["Fintech", "Compliance", "Hiring", "Product Design"],
    experience: "Product Lead at Stripe, Founder of LatticePay",
    website: "https://latticepay.com",
    linkedin: "linkedin.com/in/mayachen",
    twitter: "twitter.com/mayachen"
  },
  {
    id: "profile-arjun",
    user_id: "user-arjun",
    full_name: "Arjun Mehta",
    bio: "Climate tech operator, searching for a tech co-founder to launch CarbonArc.",
    location: "Bengaluru, India",
    avatar: null,
    banner: null,
    skills: ["Climate tech", "B2B Sales", "GTM strategy"],
    experience: "BD Manager at Tesla, Growth at Stripe",
    website: "https://carbonarc.io",
    linkedin: "linkedin.com/in/arjun",
    twitter: "twitter.com/arjun"
  },
  {
    id: "profile-sofia",
    user_id: "user-sofia",
    full_name: "Sofia Alvarez",
    bio: "Partner at Northstar Ventures. Focusing on B2B AI infra & fintech.",
    location: "San Francisco, CA",
    avatar: null,
    banner: null,
    skills: ["Venture Capital", "B2B SaaS", "Fintech infra"],
    experience: "Investor at Index Ventures, ex-Analyst at Goldman Sachs",
    website: "https://northstar.vc",
    linkedin: "linkedin.com/in/sofiaalvarez",
    twitter: "twitter.com/sofiaalvarez"
  },
  {
    id: "profile-daniel",
    user_id: "user-daniel",
    full_name: "Daniel Brooks",
    bio: "Seed stage investor at Apex Capital. Workflow automation fanatic.",
    location: "New York, NY",
    avatar: null,
    banner: null,
    skills: ["Seed investing", "Workflow automation", "SaaS", "Capital allocation"],
    experience: "Principal at Bessemer, Founder of automate.io (acquired)",
    website: "https://apexcap.com",
    linkedin: "linkedin.com/in/danielbrooks",
    twitter: "twitter.com/danielbrooks"
  },
  {
    id: "profile-leah",
    user_id: "user-leah",
    full_name: "Leah Okafor",
    bio: "Advisor specializing in Enterprise Sales, pricing tiers, and scaling GTM.",
    location: "London, UK",
    avatar: null,
    banner: null,
    skills: ["Enterprise Sales", "Pricing models", "Sales ops"],
    experience: "VP Sales at Snowflake, GTM Advisor to 15+ seed/Series A startups",
    website: "https://salesadvisors.net",
    linkedin: "linkedin.com/in/leahokafor",
    twitter: "twitter.com/leahokafor"
  }
];

const defaultStartups: MockStartup[] = [
  {
    id: "startup-orbitledger",
    founder_id: "user-maya",
    name: "OrbitLedger",
    slug: "orbitledger",
    tagline: "Programmable payroll for global teams",
    description: "OrbitLedger is a next-generation payroll and compliance suite for global-first startups, automating taxes, payroll compliance, and multi-currency payouts in seconds.",
    industry: "Fintech",
    stage: "Seed",
    website: "https://orbitledger.io",
    logo: null
  },
  {
    id: "startup-carbonarc",
    founder_id: "user-arjun",
    name: "CarbonArc",
    slug: "carbonarc",
    tagline: "Industrial energy reporting and decarbonization",
    description: "CarbonArc builds auditing software for enterprise carbon tracking and supply chain energy compliance. Our system integrates directly with industrial hardware to report metrics.",
    industry: "Climate",
    stage: "Series A",
    website: "https://carbonarc.io",
    logo: null
  }
];

const defaultStartupMembers: MockStartupMember[] = [
  { id: "member-1", startup_id: "startup-orbitledger", user_id: "user-maya", role: "CEO & Founder" },
  { id: "member-2", startup_id: "startup-carbonarc", user_id: "user-arjun", role: "Co-Founder & CEO" }
];

const defaultPosts: MockPost[] = [
  {
    id: "post-1",
    author_id: "user-maya",
    user_id: "user-maya",
    content: "We opened our seed round to expand programmable payroll for global teams.",
    visibility: "public",
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // 14m ago
    likes_count: 5,
    comments_count: 2,
    reposts_count: 1
  },
  {
    id: "post-2",
    author_id: "user-arjun",
    user_id: "user-arjun",
    content: "Two climate founders need a founding growth lead for enterprise pilots.",
    visibility: "public",
    created_at: new Date(Date.now() - 38 * 60 * 1000).toISOString(), // 38m ago
    likes_count: 12,
    comments_count: 4,
    reposts_count: 2
  },
  {
    id: "post-3",
    author_id: "user-sofia",
    user_id: "user-sofia",
    content: "AI infra deals move fastest when the buyer is already inside the workflow.",
    visibility: "public",
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1h ago
    likes_count: 8,
    comments_count: 1,
    reposts_count: 0
  }
];

const defaultComments: MockComment[] = [
  { id: "comment-1", post_id: "post-1", user_id: "user-sofia", content: "LatticePay has massive traction. Let's schedule an intro meeting.", created_at: new Date().toISOString() },
  { id: "comment-2", post_id: "post-2", user_id: "user-current", content: "Sending a connection request. I have Stripe scaling experience.", created_at: new Date().toISOString() }
];

const defaultReactions: MockReaction[] = [
  { id: "react-1", post_id: "post-1", user_id: "user-sofia", reaction_type: "Bullish" },
  { id: "react-2", post_id: "post-1", user_id: "user-daniel", reaction_type: "Interested" },
  { id: "react-3", post_id: "post-2", user_id: "user-current", reaction_type: "Support" }
];

const defaultConnections: MockConnection[] = [
  { id: "conn-1", sender_id: "user-current", receiver_id: "user-maya", requester_id: "user-current", addressee_id: "user-maya", status: "accepted" },
  { id: "conn-2", sender_id: "user-arjun", receiver_id: "user-current", requester_id: "user-arjun", addressee_id: "user-current", status: "pending" },
  { id: "conn-3", sender_id: "user-leah", receiver_id: "user-current", requester_id: "user-leah", addressee_id: "user-current", status: "accepted" }
];

const defaultFollowers: MockFollower[] = [
  { id: "fol-1", follower_id: "user-current", following_id: "user-maya" },
  { id: "fol-2", follower_id: "user-current", following_id: "user-sofia" },
  { id: "fol-3", follower_id: "user-maya", following_id: "user-current" }
];

const defaultConversations: MockConversation[] = [
  { id: "conv-1", created_at: new Date().toISOString(), participant_ids: ["user-current", "user-maya"] },
  { id: "conv-2", created_at: new Date().toISOString(), participant_ids: ["user-current", "user-leah"] }
];

const defaultMessages: MockMessage[] = [
  { id: "msg-1", conversation_id: "conv-1", sender_id: "user-maya", content: "Hi Alex! Thanks for connecting. Are you free to review our LatticePay setup?", created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), seen: true },
  { id: "msg-2", conversation_id: "conv-1", sender_id: "user-current", content: "Absolutely Maya! Let's do it tomorrow morning.", created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), seen: true },
  { id: "msg-3", conversation_id: "conv-2", sender_id: "user-leah", content: "Let's hook up a call next Tuesday for enterprise strategies.", created_at: new Date().toISOString(), seen: false }
];

const defaultMatches: MockMatch[] = [
  { id: "match-1", user_a: "user-current", user_b: "user-arjun", match_type: "cofounder", score: 94 },
  { id: "match-2", user_a: "user-current", user_b: "user-daniel", match_type: "investor", score: 89 },
  { id: "match-3", user_a: "user-current", user_b: "user-leah", match_type: "advisor", score: 87 }
];

const defaultFundingRounds: MockFundingRound[] = [
  { id: "round-1", startup_id: "startup-orbitledger", title: "LatticePay Seed Round", stage: "Seed", round_type: "Seed", target_amount: 1800000, amount_raised: 1200000, amount: 1800000, valuation: 10000000, status: "active" },
  { id: "round-2", startup_id: "startup-carbonarc", title: "CarbonArc Series A", stage: "Series A", round_type: "Series A", target_amount: 8000000, amount_raised: 4500000, amount: 8000000, valuation: 45000000, status: "active" }
];

const defaultInvestorInterests: MockInvestorInterest[] = [
  { id: "interest-1", investor_id: "user-sofia", funding_round_id: "round-1", status: "interested", notes: "LatticePay matches our fintech mandate. Maya is solid founder.", updated_at: new Date().toISOString() },
  { id: "interest-2", investor_id: "user-daniel", funding_round_id: "round-1", status: "meeting_scheduled", notes: "Intro scheduled for next Thursday.", updated_at: new Date().toISOString() }
];

const defaultJobs: MockJob[] = [
  { id: "job-1", startup_id: "startup-orbitledger", title: "Founding Growth Lead", salary: "$120k - $160k + 1.5% equity", location: "Miami / Hybrid", description: "Scale LatticePay's GTM efforts, driving customer acquisition across international channels.", type: "Full-time", location_type: "Hybrid", equity_min: 1.0, equity_max: 2.0, applications_count: 3 },
  { id: "job-2", startup_id: "startup-carbonarc", title: "Lead Full-Stack Engineer", salary: "$140k - $180k + 2.0% equity", location: "Remote / SF", description: "Build CarbonArc's primary tracking interfaces, working closely with firmware integration streams.", type: "Full-time", location_type: "Remote", equity_min: 1.5, equity_max: 3.0, applications_count: 5 }
];

const defaultApplications: MockApplication[] = [
  { id: "app-1", job_id: "job-1", user_id: "user-current", status: "submitted", created_at: new Date().toISOString() }
];

const defaultNotifications: MockNotification[] = [
  { id: "notif-1", user_id: "user-current", type: "funding", title: "Investor requested deck", body: "Sofia Alvarez requested access to OrbitLedger's pitch deck.", message: "Sofia Alvarez requested access to OrbitLedger's pitch deck.", read: false, action_url: "/fundraising", created_at: new Date().toISOString() },
  { id: "notif-2", user_id: "user-current", type: "match", title: "Match calculated", body: "New co-founder match suggestion: Arjun Mehta (94% Compatibility).", message: "New co-founder match suggestion: Arjun Mehta (94% Compatibility).", read: true, action_url: "/matches", created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "notif-3", user_id: "user-current", type: "connection", title: "New connection request", body: "Daniel Brooks wants to connect with you.", message: "Daniel Brooks wants to connect with you.", read: false, action_url: "/network", created_at: new Date(Date.now() - 1 * 3600000).toISOString() }
];


const defaultEvents: MockEvent[] = [
  { id: "event-1", creator_id: "user-sofia", title: "VC Pitches & Beer Night SF", description: "Informal networking for early founders and active seed check writers in SoMa.", event_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(), rsvps: ["user-current", "user-maya"] },
  { id: "event-2", creator_id: "user-maya", title: "Payroll & Remote Operations Roundtable", description: "Virtual fireside chat discussing global hiring compliance, tax hurdles, and compensation structures.", event_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), rsvps: ["user-current"] }
];

const defaultSubscriptions: MockSubscription[] = [
  { id: "sub-1", user_id: "user-current", plan: "Free", status: "active" }
];

const globalStoreKey = Symbol.for("startupverse.mockdb");

function getStore(): GlobalMockDb {
  if (typeof window !== "undefined") {
    // Client side localStorage sync
    const stored = localStorage.getItem("startupverse_mockdb");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback
      }
    }
  }

  // Server side global variable to survive HMR resets
  let store = (globalThis as any)[globalStoreKey] as GlobalMockDb | undefined;
  if (!store) {
    store = {
      users: defaultUsers,
      profiles: defaultProfiles,
      startups: defaultStartups,
      startup_members: defaultStartupMembers,
      posts: defaultPosts,
      comments: defaultComments,
      reactions: defaultReactions,
      connections: defaultConnections,
      followers: defaultFollowers,
      messages: defaultMessages,
      conversations: defaultConversations,
      matches: defaultMatches,
      funding_rounds: defaultFundingRounds,
      investor_interests: defaultInvestorInterests,
      events: defaultEvents,
      jobs: defaultJobs,
      applications: defaultApplications,
      notifications: defaultNotifications,
      subscriptions: defaultSubscriptions
    };
    (globalThis as any)[globalStoreKey] = store;
  }
  return store;
}

function saveStore(store: GlobalMockDb) {
  if (typeof window !== "undefined") {
    localStorage.setItem("startupverse_mockdb", JSON.stringify(store));
    window.dispatchEvent(new Event("mockdb-update"));
  } else {
    (globalThis as any)[globalStoreKey] = store;
  }
}

// DB wrappers
export const mockDb = {
  getUsers: () => getStore().users,
  getProfiles: (): MockProfile[] => {
    return getStore().profiles.map((p) => ({
      ...p,
      headline: p.headline || p.bio.substring(0, 50) + "...",
      linkedin_url: p.linkedin_url || p.linkedin,
      twitter_url: p.twitter_url || p.twitter,
      github_url: p.github_url || ""
    }));
  },
  getStartups: () => getStore().startups,
  getStartupMembers: () => getStore().startup_members,
  getPosts: () => getStore().posts,
  getComments: () => getStore().comments,
  getReactions: () => getStore().reactions,
  getConnections: () => getStore().connections,
  getFollowers: () => getStore().followers,
  getMessages: () => getStore().messages,
  getConversations: () => getStore().conversations,
  getMatches: () => getStore().matches,
  getFundingRounds: () => getStore().funding_rounds,
  getInvestorInterests: () => getStore().investor_interests,
  getEvents: () => getStore().events,
  getJobs: () => getStore().jobs,
  getApplications: () => getStore().applications,
  getNotifications: () => getStore().notifications,
  getSubscriptions: () => getStore().subscriptions,

  getInvestors: (): MockInvestor[] => {
    const store = getStore();
    const users = store.users.filter((u) => u.role === "Investor");
    return users.map((u) => {
      const enrich = {
        "user-sofia": {
          user_id: "user-sofia",
          firm_name: "Northstar Ventures",
          investment_thesis: "Backing AI-first B2B infrastructure companies and fintech primitives reshaping global finance.",
          focus_areas: ["AI/ML", "Fintech", "B2B SaaS", "Infrastructure"],
          check_size_min: "$250K",
          check_size_max: "$2M",
          portfolio_companies: ["OrbitLedger", "Plaid", "Stripe Atlas"],
          preferred_stages: ["Seed", "Series A"],
          lead_investor: true,
          board_member: true
        },
        "user-daniel": {
          user_id: "user-daniel",
          firm_name: "Apex Capital",
          investment_thesis: "Seed-stage investments in workflow automation and enterprise productivity. We love 10x better tools.",
          focus_areas: ["SaaS", "Workflow Automation", "Enterprise", "Dev Tools"],
          check_size_min: "$100K",
          check_size_max: "$500K",
          portfolio_companies: ["Notion", "Linear", "AutomateIO"],
          preferred_stages: ["Pre-seed", "Seed"],
          lead_investor: false,
          board_member: false
        }
      }[u.id] || {
        user_id: u.id,
        firm_name: u.username,
        investment_thesis: "Active angel investor focused on early-stage startups.",
        focus_areas: ["Early-stage", "Angel"],
        check_size_min: "$50K",
        check_size_max: "$250K",
        portfolio_companies: [],
        preferred_stages: ["Pre-seed", "Seed"],
        lead_investor: false,
        board_member: false
      };
      return { ...u, ...enrich };
    });
  },

  getStartupBySlug: (slug: string) =>
    getStore().startups.find((s) => s.slug === slug) || null,

  getUserByUsername: (username: string) =>
    getStore().users.find((u) => u.username === username) || null,

  getProfile: (userId: string): MockProfile | null => {
    const p = getStore().profiles.find((p) => p.user_id === userId);
    if (!p) return null;
    return {
      ...p,
      headline: p.headline || p.bio.substring(0, 50) + "...",
      linkedin_url: p.linkedin_url || p.linkedin,
      twitter_url: p.twitter_url || p.twitter,
      github_url: p.github_url || ""
    };
  },

  getJobsByStartup: (startupId: string) =>
    getStore().jobs.filter((j) => j.startup_id === startupId),

  getCurrentUser: () => {
    return getStore().users.find((u) => u.id === "user-current")!;
  },

  getCurrentProfile: (): MockProfile => {
    const p = getStore().profiles.find((p) => p.user_id === "user-current")!;
    return {
      ...p,
      headline: p.headline || p.bio.substring(0, 50) + "...",
      linkedin_url: p.linkedin_url || p.linkedin,
      twitter_url: p.twitter_url || p.twitter,
      github_url: p.github_url || ""
    };
  },

  updateCurrentUserRole: (role: UserRole) => {
    const store = getStore();
    const user = store.users.find((u) => u.id === "user-current");
    if (user) {
      user.role = role;
      saveStore(store);
    }
  },

  updateCurrentProfile: (data: Partial<MockProfile>) => {
    const store = getStore();
    const idx = store.profiles.findIndex((p) => p.user_id === "user-current");
    if (idx !== -1) {
      store.profiles[idx] = { ...store.profiles[idx], ...data };
      saveStore(store);
    }
  },

  createPost: (content: string, visibility: Visibility) => {
    const store = getStore();
    const post: MockPost = {
      id: "post-" + Math.random().toString(36).substr(2, 9),
      author_id: "user-current",
      user_id: "user-current",
      content,
      visibility,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      reposts_count: 0
    };
    store.posts.unshift(post);
    saveStore(store);
    return post;
  },

  addReaction: (postId: string, reactionType: string) => {
    const store = getStore();
    const existingIdx = store.reactions.findIndex(
      (r) => r.post_id === postId && r.user_id === "user-current" && r.reaction_type === reactionType
    );
    if (existingIdx !== -1) {
      // Remove reaction if already reacted
      store.reactions.splice(existingIdx, 1);
    } else {
      store.reactions.push({
        id: "react-" + Math.random().toString(36).substr(2, 9),
        post_id: postId,
        user_id: "user-current",
        reaction_type: reactionType
      });
    }
    saveStore(store);
  },

  addComment: (postId: string, content: string) => {
    const store = getStore();
    const comment: MockComment = {
      id: "comment-" + Math.random().toString(36).substr(2, 9),
      post_id: postId,
      user_id: "user-current",
      content,
      created_at: new Date().toISOString()
    };
    store.comments.push(comment);
    saveStore(store);
    return comment;
  },

  toggleConnection: (targetUserId: string) => {
    const store = getStore();
    const currentUserId = "user-current";
    const existingIdx = store.connections.findIndex(
      (c) =>
        (c.sender_id === currentUserId && c.receiver_id === targetUserId) ||
        (c.sender_id === targetUserId && c.receiver_id === currentUserId)
    );

    if (existingIdx !== -1) {
      store.connections.splice(existingIdx, 1);
    } else {
      store.connections.push({
        id: "conn-" + Math.random().toString(36).substr(2, 9),
        sender_id: currentUserId,
        receiver_id: targetUserId,
        requester_id: currentUserId,
        addressee_id: targetUserId,
        status: "pending"
      });
    }
    saveStore(store);
  },

  acceptConnection: (targetUserId: string) => {
    const store = getStore();
    const currentUserId = "user-current";
    const conn = store.connections.find(
      (c) => c.sender_id === targetUserId && c.receiver_id === currentUserId
    );
    if (conn) {
      conn.status = "accepted";
      saveStore(store);
    }
  },

  toggleFollow: (targetUserId: string) => {
    const store = getStore();
    const currentUserId = "user-current";
    const idx = store.followers.findIndex((f) => f.follower_id === currentUserId && f.following_id === targetUserId);
    if (idx !== -1) {
      store.followers.splice(idx, 1);
    } else {
      store.followers.push({
        id: "fol-" + Math.random().toString(36).substr(2, 9),
        follower_id: currentUserId,
        following_id: targetUserId
      });
    }
    saveStore(store);
  },

  sendMessage: (conversationId: string, content: string) => {
    const store = getStore();
    const msg: MockMessage = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      conversation_id: conversationId,
      sender_id: "user-current",
      content,
      created_at: new Date().toISOString(),
      seen: false
    };
    store.messages.push(msg);
    saveStore(store);

    // Simulate responsive message after 1.5 seconds if talking to another user
    const conv = store.conversations.find((c) => c.id === conversationId);
    if (conv) {
      const otherId = conv.participant_ids.find((id) => id !== "user-current");
      if (otherId) {
        setTimeout(() => {
          const freshStore = getStore();
          const autoMsg: MockMessage = {
            id: "msg-auto-" + Math.random().toString(36).substr(2, 9),
            conversation_id: conversationId,
            sender_id: otherId,
            content: `Thanks for messaging! We should hop on a call soon. This is an automated response.`,
            created_at: new Date().toISOString(),
            seen: false
          };
          freshStore.messages.push(autoMsg);
          // Send notification too
          const otherProfile = freshStore.profiles.find((p) => p.user_id === otherId);
          freshStore.notifications.unshift({
            id: "notif-" + Math.random().toString(36).substr(2, 9),
            user_id: "user-current",
            type: "message",
            title: `New message from ${otherProfile?.full_name || "User"}`,
            body: autoMsg.content,
            read: false,
            created_at: new Date().toISOString()
          });
          saveStore(freshStore);
        }, 1500);
      }
    }

    return msg;
  },

  createConversation: (targetUserId: string) => {
    const store = getStore();
    const currentUserId = "user-current";
    const existing = store.conversations.find(
      (c) => c.participant_ids.includes(currentUserId) && c.participant_ids.includes(targetUserId)
    );
    if (existing) return existing.id;

    const newConv: MockConversation = {
      id: "conv-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      participant_ids: [currentUserId, targetUserId]
    };
    store.conversations.push(newConv);
    saveStore(store);
    return newConv.id;
  },

  createStartup: (name: string, tagline: string, description: string, industry: string, stage: StartupStage, website: string) => {
    const store = getStore();
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const startup: MockStartup = {
      id: "startup-" + Math.random().toString(36).substr(2, 9),
      founder_id: "user-current",
      name,
      slug,
      tagline,
      description,
      industry,
      stage,
      website,
      logo: null
    };
    store.startups.push(startup);
    store.startup_members.push({
      id: "member-" + Math.random().toString(36).substr(2, 9),
      startup_id: startup.id,
      user_id: "user-current",
      role: "CEO & Founder"
    });
    saveStore(store);
    return startup;
  },

  applyToJob: (jobId: string) => {
    const store = getStore();
    const exists = store.applications.find((a) => a.job_id === jobId && a.user_id === "user-current");
    if (exists) return exists;

    const app: MockApplication = {
      id: "app-" + Math.random().toString(36).substr(2, 9),
      job_id: jobId,
      user_id: "user-current",
      status: "submitted",
      created_at: new Date().toISOString()
    };
    store.applications.push(app);
    saveStore(store);
    return app;
  },

  postJob: (startupId: string, title: string, salary: string, location: string, description: string) => {
    const store = getStore();
    const job: MockJob = {
      id: "job-" + Math.random().toString(36).substr(2, 9),
      startup_id: startupId,
      title,
      salary,
      location,
      description,
      type: "Full-time",
      applications_count: 0,
      location_type: "Hybrid",
      equity_min: 0,
      equity_max: 0
    };
    store.jobs.push(job);
    saveStore(store);
    return job;
  },

  addFundingRound: (startupId: string, title: string, stage: string, amount: number, valuation: number) => {
    const store = getStore();
    const round: MockFundingRound = {
      id: "round-" + Math.random().toString(36).substr(2, 9),
      startup_id: startupId,
      title,
      stage,
      round_type: stage,
      target_amount: amount,
      amount_raised: 0,
      amount,
      valuation,
      status: "active"
    };
    store.funding_rounds.push(round);
    saveStore(store);
    return round;
  },

  expressInterest: (roundId: string) => {
    const store = getStore();
    const exists = store.investor_interests.find((i) => i.funding_round_id === roundId && i.investor_id === "user-current");
    if (exists) return exists;

    const interest: MockInvestorInterest = {
      id: "interest-" + Math.random().toString(36).substr(2, 9),
      investor_id: "user-current",
      funding_round_id: roundId,
      status: "interested",
      notes: "",
      updated_at: new Date().toISOString()
    };
    store.investor_interests.push(interest);
    saveStore(store);
    return interest;
  },

  updateInterestStatus: (interestId: string, status: MockInvestorInterest["status"], notes?: string) => {
    const store = getStore();
    const interest = store.investor_interests.find((i) => i.id === interestId);
    if (interest) {
      interest.status = status;
      if (notes !== undefined) interest.notes = notes;
      interest.updated_at = new Date().toISOString();
      saveStore(store);
    }
  },

  toggleMatchSaved: (matchId: string) => {
    const store = getStore();
    const match = store.matches.find((m) => m.id === matchId);
    if (match) {
      match.saved = !match.saved;
      saveStore(store);
    }
  },

  markNotificationsRead: () => {
    const store = getStore();
    store.notifications.forEach((n) => {
      n.read = true;
    });
    saveStore(store);
  },

  addNotification: (title: string, body: string) => {
    const store = getStore();
    store.notifications.unshift({
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      user_id: "user-current",
      type: "system",
      title,
      body,
      read: false,
      created_at: new Date().toISOString()
    });
    saveStore(store);
  },

  toggleRsvpEvent: (eventId: string) => {
    const store = getStore();
    const event = store.events.find((e) => e.id === eventId);
    if (event) {
      const idx = event.rsvps.indexOf("user-current");
      if (idx !== -1) {
        event.rsvps.splice(idx, 1);
      } else {
        event.rsvps.push("user-current");
      }
      saveStore(store);
    }
  }
};
