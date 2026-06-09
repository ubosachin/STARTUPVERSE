import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const startups = [
  { name: "OrbitLedger", slug: "orbitledger", industry: "Fintech", stage: "Seed", metric: "$84k MRR", raise: "$1.8M" },
  { name: "VeyaHealth", slug: "veyahealth", industry: "Health AI", stage: "Pre-seed", metric: "12 pilots", raise: "$750k" },
  { name: "CarbonArc", slug: "carbonarc", industry: "Climate", stage: "Series A", metric: "$2.1M ARR", raise: "$8M" }
];

export function StartupGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {startups.map((startup) => (
        <Card key={startup.slug}>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <Badge>{startup.stage}</Badge>
                <h2 className="mt-4 text-xl font-semibold tracking-tight">{startup.name}</h2>
                <p className="text-sm text-muted">{startup.industry}</p>
              </div>
              <Link href={`/startups/${startup.slug}`}>
                <Button variant="secondary" size="icon" aria-label={`View ${startup.name}`}>
                  <ArrowUpRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted">Traction</p>
                <p className="font-semibold">{startup.metric}</p>
              </div>
              <div className="rounded-xl bg-surface p-3">
                <p className="text-xs text-muted">Raise</p>
                <p className="font-semibold">{startup.raise}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
