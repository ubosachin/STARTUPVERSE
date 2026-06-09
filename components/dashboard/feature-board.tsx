import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/layout/page-heading";

export function FeatureBoard({
  eyebrow,
  title,
  description,
  items
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="py-5">
      <PageHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item}>
            <CardContent>
              <CheckCircle2 className="text-success" size={22} />
              <h2 className="mt-4 text-lg font-semibold tracking-tight">{item}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Production-ready surface with server actions, Supabase data wiring, role gates, and responsive product UI.
              </p>
              <Button variant="secondary" size="sm" className="mt-4">
                Open <ArrowUpRight size={15} />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
