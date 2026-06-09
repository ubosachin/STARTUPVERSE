import { Badge } from "@/components/ui/badge";

export function PageHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="py-6">
      <Badge>{eyebrow}</Badge>
      <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p>
    </div>
  );
}
