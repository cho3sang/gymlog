import Link from "next/link";
import {
  getActiveSession,
  listAllExercises,
  listSessionExercises,
  listSetsForSession,
  startSession,
} from "@/actions/workout";
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
        <div className="px-5 space-y-3">
          <form action={handleStart}>
            <button
              type="submit"
              className="w-full py-5 rounded-2xl text-center font-semibold text-lg text-black"
              style={{ backgroundColor: "#c8ff00" }}
            >
              Start Workout
            </button>
          </form>

          <Link
            href="/plans"
            className="block w-full py-4 rounded-2xl text-center font-semibold text-sm border"
            style={{ borderColor: "#2e2e2e", color: "#c8ff00" }}
          >
            Choose a Plan
          </Link>
        </div>
      </div>
    );
  }

  const [sessionExercises, allSets, libraryExercises] = await Promise.all([
    listSessionExercises(session.id),
    listSetsForSession(session.id),
    listAllExercises(),
  ]);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Log"
        subtitle={`Started ${new Date(session.date).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`}
      />
      <ActiveWorkout
        session={session}
        initialExercises={sessionExercises.map((sessionExercise) => ({
          id: sessionExercise.exercise.id,
          sessionExerciseId: sessionExercise.id,
          name: sessionExercise.exercise.name,
          description: sessionExercise.exercise.description,
          category: sessionExercise.exercise.category,
          notes: sessionExercise.notes,
        }))}
        initialSets={allSets.map((set) => ({
          id: set.id,
          exerciseId: set.exerciseId,
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
        }))}
        libraryExercises={libraryExercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          category: exercise.category,
          isLibrary: exercise.isLibrary,
        }))}
      />
    </div>
  );
}
