export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="px-5 pt-12 pb-4">
      <h1 className="text-5xl leading-none tracking-wide text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[#666]">{subtitle}</p>}
    </header>
  );
}