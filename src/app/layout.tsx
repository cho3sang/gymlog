// app/layout.tsx
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {/* subtle background */}
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
        
        <div className="relative mx-auto min-h-screen max-w-md px-4 pb-24 pt-6">
          {children}
        </div>

        <BottomNav />
      </body>
    </html>
  );
}
