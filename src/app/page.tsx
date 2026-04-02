import Link from "next/link";
import { redirect } from "next/navigation";
import { getHomeStats, startSession } from "@/actions/workout";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function handleStart() {
  "use server";
  await startSession();
  redirect("/log");
}

export default async function Home() {
  const { activeSession, lastFinished, weekCount } = await getHomeStats();

  return (
    <main className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">GYMLOG</h1>
        <p className="text-white/60">
          {activeSession ? "Workout in progress" : "Ready to train?"}
        </p>
      </header>

      <div className="space-y-3">
        {activeSession ? (
          <Link
            href="/log"
            className="block w-full rounded-xl bg-white py-3 text-center font-medium text-black"
          >
            Continue Workout
          </Link>
        ) : (
          <form action={handleStart}>
            <button
              type="submit"
              className="block w-full rounded-xl bg-white py-3 text-center font-medium text-black"
            >
              Start Workout
            </button>
          </form>
        )}

        {activeSession && (
          <div className="rounded-2xl border border-[#243000] bg-[#111111] p-4">
            <div className="text-xs uppercase tracking-wide text-[#97b800]">
              Active session
            </div>
            <div className="mt-2 text-lg font-medium text-white">
              Started today at {formatTime(activeSession.date)}
            </div>
            <div className="text-sm text-white/60">
              Add exercises and sets from the log screen when you are ready.
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-white/60">
              This week
            </div>
            <div className="mt-2 text-3xl font-semibold">{weekCount}</div>
            <div className="text-white/60">workouts</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-white/60">
              Last session
            </div>
            <div className="mt-2 text-base font-medium">
              {lastFinished ? formatDate(lastFinished.date) : "No sessions yet"}
            </div>
            <div className="text-white/60">
              {lastFinished ? formatTime(lastFinished.date) : "log one to start"}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs uppercase tracking-wide text-white/60">
          Quick links
        </div>
        <div className="mt-3 flex gap-3">
          <Link
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80"
            href="/history"
          >
            View History
          </Link>
          <Link
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80"
            href="/progress"
          >
            Track Progress
          </Link>
        </div>
      </div>
    </main>
  );
}
