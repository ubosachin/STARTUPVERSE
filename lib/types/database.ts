export type UserRole = "Founder" | "Investor" | "CoFounder" | "Advisor" | "Builder" | "Admin";

export type Visibility = "public" | "connections" | "private";

export type StartupStage =
  | "Idea"
  | "Pre-seed"
  | "Seed"
  | "Series A"
  | "Series B"
  | "Growth";

export type DatabaseUser = {
  id: string;
  clerk_id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  location: string | null;
  avatar: string | null;
  banner: string | null;
  skills: string[];
  experience: string | null;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
};

export type Startup = {
  id: string;
  founder_id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  industry: string;
  stage: StartupStage;
  website: string | null;
  logo: string | null;
};

export type Post = {
  id: string;
  author_id: string;
  content: string;
  visibility: Visibility;
  created_at: string;
};

export type Match = {
  id: string;
  user_a: string;
  user_b: string;
  match_type: "cofounder" | "investor" | "advisor" | "builder";
  score: number;
};
