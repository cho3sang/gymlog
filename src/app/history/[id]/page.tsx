import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { getSessionDetails } from "@/actions/workout";
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

export default async function HistoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/");
  }

  const session = await getSessionDetails(params.id);

  if (!session) {
    notFound();
  }

  const totalVolume = session.sets.reduce(
    (sum, set) => sum + set.weight * set.reps,
    0
  );

  return (
    <div className="min-h-screen">
      <PageHeader
        title={session.name ?? "Workout"}
        subtitle={`${formatDate(session.date)} at ${formatTime(session.date)}`}
      />

      <div className="px-5 space-y-3">
        <Link
          href="/history"
          className="inline-flex items-center text-sm text-[#c8ff00]"
        >
          ← Back to history
        </Link>

        <div className="grid grid-cols-3 gap-3">
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
          >
            <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">
              Exercises
            </p>
            <p
              className="text-3xl leading-none text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {session.exercises.length}
            </p>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
          >
            <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">
              Sets
            </p>
            <p
              className="text-3xl leading-none text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {session.sets.length}
            </p>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
          >
            <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">
              Volume
            </p>
            <p
              className="text-3xl leading-none text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {totalVolume.toFixed(0)}
            </p>
            <p className="text-xs text-[#666] mt-1">kg</p>
          </div>
        </div>

        {session.exercises.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
          >
            <p className="text-sm text-[#444]">No exercises were logged.</p>
          </div>
        ) : (
          session.exercises.map((sessionExercise) => {
            const exerciseSets = session.sets.filter(
              (set) => set.exerciseId === sessionExercise.exerciseId
            );

            return (
              <div
                key={sessionExercise.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: "#111111",
                  border: "1px solid #1f1f1f",
                }}
              >
                <div
                  className="px-4 py-3"
                  style={{ borderBottom: "1px solid #1f1f1f" }}
                >
                  <h2 className="font-semibold text-white">
                    {sessionExercise.exercise.name}
                  </h2>
                  {sessionExercise.exercise.description && (
                    <p className="text-xs text-[#666] mt-1">
                      {sessionExercise.exercise.description}
                    </p>
                  )}
                  <p className="text-xs text-[#666] mt-0.5">
                    {exerciseSets.length} set
                    {exerciseSets.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {sessionExercise.notes && (
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid #1f1f1f" }}
                  >
                    <p className="text-[10px] text-[#666] uppercase tracking-widest mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-[#d0d0d0]">{sessionExercise.notes}</p>
                  </div>
                )}

                {exerciseSets.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#666] text-xs uppercase tracking-wider">
                        <th className="text-left px-4 py-2">Set</th>
                        <th className="text-right px-4 py-2">kg</th>
                        <th className="text-right px-4 py-2">Reps</th>
                        <th className="text-right px-4 py-2">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exerciseSets.map((set) => (
                        <tr
                          key={set.id}
                          className="border-t"
                          style={{ borderColor: "#1f1f1f" }}
                        >
                          <td className="px-4 py-2.5 text-[#c8ff00] font-mono text-xs">
                            {set.setNumber}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-white text-xs">
                            {set.weight}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-white text-xs">
                            {set.reps}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-white text-xs">
                            {(set.weight * set.reps).toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-4 py-4 text-sm text-[#444]">
                    No sets recorded for this exercise.
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
