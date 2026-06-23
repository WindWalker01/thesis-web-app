export function InfoRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-border bg-background rounded-2xl border p-3">
      <p className="text-foreground font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1 text-xs leading-5">
        {description}
      </p>
    </div>
  );
}
