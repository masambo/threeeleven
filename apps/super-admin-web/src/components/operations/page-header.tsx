export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[var(--color-brand)]">{eyebrow}</p>
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </header>
  );
}
