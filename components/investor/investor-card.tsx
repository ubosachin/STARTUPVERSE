import { BadgeDollarSign, Bookmark, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const investors = [
  { name: "Sofia Alvarez", thesis: "B2B AI, devtools, fintech infra", checks: "$250k-$1.5M", location: "SF / Remote" },
  { name: "Daniel Brooks", thesis: "Vertical SaaS and workflow automation", checks: "$100k-$750k", location: "New York" },
  { name: "Aisha Rahman", thesis: "Climate, energy, data platforms", checks: "$500k-$2M", location: "London" }
];

export function InvestorGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {investors.map((investor) => (
        <Card key={investor.name}>
          <CardContent>
            <div className="grid size-12 place-items-center rounded-2xl bg-success/10 text-success">
              <BadgeDollarSign size={22} />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">{investor.name}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{investor.thesis}</p>
            <div className="mt-4 rounded-xl bg-surface p-3 text-sm">
              <p className="font-semibold">{investor.checks}</p>
              <p className="text-muted">{investor.location}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm">
                <CalendarDays size={15} /> Request meeting
              </Button>
              <Button variant="secondary" size="icon" aria-label="Save investor">
                <Bookmark size={15} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
