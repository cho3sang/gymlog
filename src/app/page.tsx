import Link from "next/link";
import { redirect } from "next/navigation";
import { getHomeStats, startBuiltInPlan, startSession } from "@/actions/workout";
import { BUILT_IN_PLANS } from "@/lib/workoutData";

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

async function handleStartPlan(formData: FormData) {
  "use server";
  const slug = String(formData.get("slug") ?? "");
  await startBuiltInPlan(slug);
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
              {activeSession.name
                ? `${activeSession.name} started at ${formatTime(activeSession.date)}`
                : `Started today at ${formatTime(activeSession.date)}`}
            </div>
            <div className="text-sm text-white/60">
              Add exercises, notes, and sets from the log screen when you are ready.
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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-white/60">
            Workout Plans
          </div>
          <p className="text-sm text-white/60 mt-2">
            Start with a built-in split or build your own custom routine.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {BUILT_IN_PLANS.map((plan) => (
            <form
              key={plan.slug}
              action={handleStartPlan}
              className="rounded-2xl border border-white/10 bg-[#111111] p-3"
            >
              <input type="hidden" name="slug" value={plan.slug} />
              <p
                className="text-2xl leading-none text-white"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {plan.name}
              </p>
              <p className="text-xs text-white/50 mt-2 min-h-[2.5rem]">
                {plan.description}
              </p>
              <button
                type="submit"
                className="mt-3 w-full rounded-xl px-3 py-2 text-sm font-semibold text-black"
                style={{ backgroundColor: "#c8ff00" }}
              >
                Start
              </button>
            </form>
          ))}
        </div>

        <Link
          href="/plans"
          className="block rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80 text-center"
        >
          View all plans and create your own
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-xs uppercase tracking-wide text-white/60">
          Quick links
        </div>
        <div className="mt-3 flex gap-3 flex-wrap">
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
          <Link
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/80"
            href="/plans"
          >
            Manage Plans
          </Link>
        </div>
      </div>
    </main>
  );
}
