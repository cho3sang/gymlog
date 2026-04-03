import { redirect } from "next/navigation";
import { listExercisesForUser } from "@/actions/workout";
import PageHeader from "@/components/PageHeader";
import { getCurrentViewer } from "@/lib/current-user";
import ProgressClient from "./ProgressClient";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/");
  }

  const exercises = await listExercisesForUser();

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Progress"
        subtitle={
          exercises.length
            ? `${exercises.length} exercise${
                exercises.length !== 1 ? "s" : ""
              } with logged history`
            : "No finished exercise history yet"
        }
      />

      <div className="px-5 pb-4">
        {exercises.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
          >
            <p
              className="text-4xl text-[#333] mb-3"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              No progress yet
            </p>
            <p className="text-sm text-[#444]">
              Finish a workout with logged sets to start tracking PRs and e1RM.
            </p>
          </div>
        ) : (
          <ProgressClient exercises={exercises} />
        )}
      </div>
    </div>
  );
}
