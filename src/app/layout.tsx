// app/layout.tsx
import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {/* subtle background */}
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
        
        <div className="relative mx-auto min-h-screen max-w-md px-4 pb-24 pt-6">
          {children}
        </div>

        {/* bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/70 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-between px-6 py-3 text-sm text-white/70">
            <Link className="hover:text-white" href="/">Home</Link>
            <Link className="hover:text-white" href="/log">Log</Link>
            <Link className="hover:text-white" href="/history">History</Link>
            <Link className="hover:text-white" href="/progress">Progress</Link>
          </div>
        </nav>
      </body>
    </html>
  );
}