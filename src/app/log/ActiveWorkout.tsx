"use client";

// src/app/log/ActiveWorkout.tsx
import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addExerciseToSession,
  addSet,
  deleteSet,
  finishSession,
} from "@/actions/workout";

interface Exercise {
  id: string;
  name: string;
}

interface SetRow {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
}

interface Props {
  session: { id: string; date: Date; isFinished: boolean };
  initialExercises: Exercise[];
  initialSets: SetRow[];
}

export default function ActiveWorkout({
  session,
  initialExercises,
  initialSets,
}: Props) {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [sets, setSets] = useState<SetRow[]>(initialSets);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [addingExercise, setAddingExercise] = useState(false);
  const [error, setError] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Per-exercise weight/reps inputs
  const [setInputs, setSetInputs] = useState<
    Record<string, { weight: string; reps: string; error: string }>
  >({});

  const getInput = (exerciseId: string) =>
    setInputs[exerciseId] ?? { weight: "", reps: "", error: "" };

  const updateInput = (
    exerciseId: string,
    field: "weight" | "reps",
    value: string
  ) => {
    setSetInputs((prev) => ({
      ...prev,
      [exerciseId]: { ...getInput(exerciseId), [field]: value, error: "" },
    }));
  };

  const handleAddExercise = async () => {
    const name = exerciseSearch.trim();
    if (!name) return;
    setAddingExercise(true);
    setError("");
    try {
      const exercise = await addExerciseToSession(session.id, name);
      setExercises((prev) => {
        if (prev.find((e) => e.id === exercise.id)) return prev;
        return [...prev, { id: exercise.id, name: exercise.name }];
      });
      setExerciseSearch("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add exercise");
    } finally {
      setAddingExercise(false);
    }
  };

  const handleAddSet = async (exerciseId: string) => {
    const input = getInput(exerciseId);
    const weight = parseFloat(input.weight);
    const reps = parseInt(input.reps, 10);

    if (isNaN(reps) || reps <= 0) {
      setSetInputs((prev) => ({
        ...prev,
        [exerciseId]: { ...input, error: "Reps must be > 0" },
      }));
      return;
    }
    if (isNaN(weight) || weight < 0) {
      setSetInputs((prev) => ({
        ...prev,
        [exerciseId]: { ...input, error: "Weight must be ≥ 0" },
      }));
      return;
    }

    try {
      const newSet = await addSet(session.id, exerciseId, weight, reps);
      setSets((prev) => [
        ...prev,
        {
          id: newSet.id,
          exerciseId: newSet.exerciseId,
          setNumber: newSet.setNumber,
          weight: newSet.weight,
          reps: newSet.reps,
        },
      ]);
      setSetInputs((prev) => ({
        ...prev,
        [exerciseId]: { weight: input.weight, reps: "", error: "" },
      }));
    } catch (e: unknown) {
      setSetInputs((prev) => ({
        ...prev,
        [exerciseId]: {
          ...input,
          error: e instanceof Error ? e.message : "Error adding set",
        },
      }));
    }
  };

  const handleDeleteSet = async (setId: string) => {
    setSets((prev) => prev.filter((s) => s.id !== setId));
    await deleteSet(setId);
  };

  const handleFinish = async () => {
    if (!confirm("Finish this workout?")) return;
    setFinishing(true);
    await finishSession(session.id);
    router.push("/history");
  };

  const setsForExercise = (exerciseId: string) =>
    sets.filter((s) => s.exerciseId === exerciseId);

  return (
    <div className="px-5 space-y-4">
      {/* Add Exercise */}
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
      >
        <p className="text-xs text-[#666] uppercase tracking-widest mb-3">
          Add Exercise
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={exerciseSearch}
            onChange={(e) => setExerciseSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddExercise()}
            placeholder="e.g. Bench Press"
            className="flex-1 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white placeholder-[#444] focus:border-[#c8ff00] focus:outline-none"
          />
          <button
            onClick={handleAddExercise}
            disabled={addingExercise || !exerciseSearch.trim()}
            className="px-5 py-3 rounded-xl font-semibold text-sm text-black disabled:opacity-40"
            style={{ backgroundColor: "#c8ff00" }}
          >
            {addingExercise ? "…" : "Add"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      {/* Exercise Cards */}
      {exercises.length === 0 ? (
        <div className="text-center py-12 text-[#444]">
          <p className="text-4xl mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>No exercises yet</p>
          <p className="text-sm">Add an exercise above to get started</p>
        </div>
      ) : (
        exercises.map((exercise) => {
          const exSets = setsForExercise(exercise.id);
          const input = getInput(exercise.id);
          return (
            <div
              key={exercise.id}
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
            >
              {/* Exercise header */}
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid #1f1f1f" }}
              >
                <h3 className="font-semibold text-white">{exercise.name}</h3>
                <p className="text-xs text-[#666]">
                  {exSets.length} set{exSets.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Sets table */}
              {exSets.length > 0 && (
                <div className="px-4 py-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#666] text-xs uppercase tracking-wider">
                        <th className="text-left py-1 w-10">Set</th>
                        <th className="text-right py-1">kg</th>
                        <th className="text-right py-1">Reps</th>
                        <th className="w-6"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {exSets.map((s) => (
                        <tr
                          key={s.id}
                          className="border-t"
                          style={{ borderColor: "#1f1f1f" }}
                        >
                          <td
                            className="py-2 text-[#c8ff00] font-mono text-xs"
                          >
                            {s.setNumber}
                          </td>
                          <td className="py-2 text-right font-mono text-white">
                            {s.weight}
                          </td>
                          <td className="py-2 text-right font-mono text-white">
                            {s.reps}
                          </td>
                          <td className="py-2 text-right">
                            <button
                              onClick={() => handleDeleteSet(s.id)}
                              className="text-[#444] hover:text-red-400 transition-colors pl-3"
                              title="Delete set"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add set form */}
              <div
                className="px-4 py-3"
                style={{ borderTop: exSets.length ? "1px solid #1f1f1f" : undefined }}
              >
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-[10px] text-[#666] uppercase tracking-widest block mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min="0"
                      value={input.weight}
                      onChange={(e) =>
                        updateInput(exercise.id, "weight", e.target.value)
                      }
                      placeholder="0"
                      className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:border-[#c8ff00] focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-[#666] uppercase tracking-widest block mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={input.reps}
                      onChange={(e) =>
                        updateInput(exercise.id, "reps", e.target.value)
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddSet(exercise.id)
                      }
                      placeholder="0"
                      className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:border-[#c8ff00] focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleAddSet(exercise.id)}
                    className="pb-0.5 w-12 h-10 rounded-lg text-black font-bold text-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#c8ff00" }}
                  >
                    +
                  </button>
                </div>
                {input.error && (
                  <p className="text-xs text-red-400 mt-1.5">{input.error}</p>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Finish Workout */}
      {exercises.length > 0 && (
        <div className="pt-2 pb-4">
          <button
            onClick={handleFinish}
            disabled={finishing}
            className="w-full py-4 rounded-2xl text-center font-semibold text-sm border disabled:opacity-50"
            style={{ borderColor: "#2e2e2e", color: "#c8ff00" }}
          >
            {finishing ? "Finishing…" : "Finish Workout"}
          </button>
        </div>
      )}
    </div>
  );
}
