import { Bookmark, Heart, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const matches = [
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

export function MatchGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {matches.map((match) => (
        <Card key={match.name}>
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{match.name}</p>
                <p className="text-sm text-muted">{match.title}</p>
                <p className="text-xs text-muted">{match.location}</p>
              </div>
              <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-bold text-success">
                {match.score}% Match
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {match.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-muted">
              {match.fit.map((fit) => (
                <span key={fit} className="rounded-xl bg-surface px-2 py-2">{fit}</span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              <Button variant="secondary" size="icon" aria-label="Pass">
                <X size={16} />
              </Button>
              <Button variant="secondary" size="icon" aria-label="Save">
                <Bookmark size={16} />
              </Button>
              <Button variant="secondary" size="icon" aria-label="Like">
                <Heart size={16} />
              </Button>
              <Button variant="secondary" size="icon" aria-label="Message">
                <MessageCircle size={16} />
              </Button>
              <Button size="icon" aria-label="Connect">
                <Send size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
