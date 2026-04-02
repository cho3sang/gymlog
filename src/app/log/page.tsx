import { getActiveSession, listSessionExercises, listSetsForSession, startSession } from "@/actions/workout";
import PageHeader from "@/components/PageHeader";
import ActiveWorkout from "./ActiveWorkout";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function handleStart() {
  "use server";
  await startSession();
  redirect("/log");
}

export default async function LogPage() {
  const session = await getActiveSession();
  if (!session) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Log" subtitle="No active session" />
        <div className="px-5">
          <form action={handleStart}>
            <button type="submit" className="w-full py-5 rounded-2xl text-center font-semibold text-lg text-black" style={{ backgroundColor: "#c8ff00" }}>
              Start Workout
            </button>
          </form>
        </div>
      </div>
    );
  }
  const [sessionExercises, allSets] = await Promise.all([
    listSessionExercises(session.id),
    listSetsForSession(session.id),
  ]);
  return (
    <div className="min-h-screen">
      <PageHeader title="Log" subtitle={`Started ${new Date(session.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`} />
      <ActiveWorkout
        session={session}
        initialExercises={sessionExercises.map((se) => ({ id: se.exercise.id, name: se.exercise.name }))}
        initialSets={allSets.map((s) => ({ id: s.id, exerciseId: s.exerciseId, setNumber: s.setNumber, weight: s.weight, reps: s.reps }))}
      />
    </div>
  );
}
