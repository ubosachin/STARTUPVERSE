import { Card, CardContent } from "@/components/ui/card";
import type { Stat } from "@/lib/types/app";

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="shadow-line">
          <CardContent className="p-4">
            <p className="text-sm text-muted">{stat.label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
              <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                {stat.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
