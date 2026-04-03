import Image from "next/image";

export default function ExerciseVisual({
  name,
  category,
  visualPath,
  accentColor,
  accentSoft,
  size = "md",
}: {
  name: string;
  category?: string | null;
  visualPath: string;
  accentColor: string;
  accentSoft: string;
  size?: "sm" | "md";
}) {
  const dimensionClass = size === "sm" ? "h-16 w-16" : "h-24 w-full";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/5 ${dimensionClass}`}
      style={{
        background: `radial-gradient(circle at top left, ${accentSoft}, transparent 60%), linear-gradient(135deg, #161616 0%, #0e0e0e 100%)`,
        boxShadow: `inset 0 0 0 1px ${accentSoft}`,
      }}
    >
      <Image
        src={visualPath}
        alt={`${name} exercise visual`}
        fill
        sizes={size === "sm" ? "64px" : "320px"}
        className="object-cover opacity-95"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-black/10 to-transparent px-3 py-2">
        <span className="max-w-[70%] truncate text-[10px] font-semibold uppercase tracking-[0.24em] text-white/90">
          {category ?? "Custom"}
        </span>
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
}
