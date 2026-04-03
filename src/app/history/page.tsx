import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { listFinishedSessions } from "@/actions/workout";
import { getCurrentViewer } from "@/lib/current-user";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function HistoryPage() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/");
  }

  const sessions = await listFinishedSessions();

  return (
    <div className="min-h-screen">
      <PageHeader
        title="History"
        subtitle={`${sessions.length} completed workout${
          sessions.length !== 1 ? "s" : ""
        }`}
      />
      <div className="px-5 space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <p
              className="text-4xl text-[#333] mb-3"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              No workouts yet
            </p>
            <p className="text-sm text-[#444]">
              Finish a session to see it here
            </p>
            <Link
              href="/log"
              className="inline-block mt-6 px-6 py-3 rounded-xl text-sm font-semibold text-black"
              style={{ backgroundColor: "#c8ff00" }}
            >
              Start a Workout
            </Link>
          </div>
        ) : (
          sessions.map((session) => {
            const exerciseCount = session.exercises.length;
            const setCount = session.sets.length;
            const totalVolume = session.sets.reduce(
              (sum, set) => sum + set.weight * set.reps,
              0
            );

            return (
              <Link
                key={session.id}
                href={`/history/${session.id}`}
                className="block rounded-2xl p-4"
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid #1f1f1f",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">
                      {session.name ?? formatDate(session.date)}
                    </p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {formatTime(session.date)}
                    </p>
                  </div>
                  <span className="text-[#c8ff00] text-sm">→</span>
                </div>

                <div
                  className="flex gap-4 mt-3 pt-3"
                  style={{ borderTop: "1px solid #1f1f1f" }}
                >
                  <div>
                    <p
                      className="text-2xl leading-none text-white"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {exerciseCount}
                    </p>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mt-0.5">
                      Exercises
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-2xl leading-none text-white"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {setCount}
                    </p>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mt-0.5">
                      Sets
                    </p>
                  </div>

                  {totalVolume > 0 && (
                    <div>
                      <p
                        className="text-2xl leading-none text-white"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        {totalVolume >= 1000
                          ? `${(totalVolume / 1000).toFixed(1)}t`
                          : totalVolume.toFixed(0)}
                      </p>
                      <p className="text-[10px] text-[#555] uppercase tracking-wider mt-0.5">
                        {totalVolume >= 1000 ? "Volume" : "kg vol"}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
