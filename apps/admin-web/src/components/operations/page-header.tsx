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
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>
      {children}
    </header>
  );
}
