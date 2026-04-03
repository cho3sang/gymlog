import { redirect } from "next/navigation";
import AuthPanel from "@/components/AuthPanel";
import { getCurrentViewer } from "@/lib/current-user";

export default async function LandingPage() {
  const viewer = await getCurrentViewer();

  if (viewer) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col justify-center py-8 space-y-6">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.32em] text-[#666]">
          Mobile-First Workout Tracker
        </p>
        <h1
          className="text-6xl leading-none text-white"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          GymLog
        </h1>
        <p className="text-sm text-[#8a8a8a] max-w-sm">
          Log workouts, reuse plans, track progress, and keep your sessions tied
          to a real account or a quick guest session.
        </p>
      </section>

      <section
        className="rounded-[32px] border p-5 space-y-4"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(200,255,0,0.12), transparent 45%), #111111",
          borderColor: "#1f1f1f",
        }}
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border p-3" style={{ borderColor: "#242424" }}>
            <p className="text-2xl text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Log
            </p>
            <p className="text-[11px] text-[#777] mt-1">
              Sets, reps, notes, and custom exercises
            </p>
          </div>
          <div className="rounded-2xl border p-3" style={{ borderColor: "#242424" }}>
            <p className="text-2xl text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Plan
            </p>
            <p className="text-[11px] text-[#777] mt-1">
              Push, Pull, Legs, Upper, Lower, or custom
            </p>
          </div>
          <div className="rounded-2xl border p-3" style={{ borderColor: "#242424" }}>
            <p className="text-2xl text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Track
            </p>
            <p className="text-[11px] text-[#777] mt-1">
              History, PRs, and recent exercise trends
            </p>
          </div>
        </div>
      </section>

      <AuthPanel />
    </main>
  );
}
