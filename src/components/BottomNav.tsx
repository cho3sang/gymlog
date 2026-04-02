"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: (a: boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { href: "/log", label: "Log", icon: (a: boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
  { href: "/history", label: "History", icon: (a: boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/></svg> },
  { href: "/progress", label: "Progress", icon: (a: boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t" style={{ backgroundColor: "#0d0d0d", borderColor: "#1f1f1f", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg" style={{ color: active ? "#c8ff00" : "#666" }}>
              {icon(active)}
              <span className="text-[10px] font-medium tracking-wider uppercase">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}