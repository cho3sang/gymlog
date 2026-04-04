"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ExerciseVisual from "@/components/ExerciseVisual";
import {
  addExistingExerciseToSession,
  addExerciseToSession,
  addSet,
  deleteSet,
  finishSession,
  updateSessionExerciseNotes,
} from "@/actions/workout";

interface Exercise {
  id: string;
  sessionExerciseId: string;
  name: string;
  description: string | null;
  category: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  coachingCues: string[];
  visualPath: string;
  accentColor: string;
  accentSoft: string;
  notes: string | null;
}

interface LibraryExercise {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  coachingCues: string[];
  visualPath: string;
  accentColor: string;
  accentSoft: string;
  isLibrary: boolean;
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
  libraryExercises: LibraryExercise[];
}

export default function ActiveWorkout({
  session,
  initialExercises,
  initialSets,
  libraryExercises,
}: Props) {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [sets, setSets] = useState<SetRow[]>(initialSets);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [addingExerciseKey, setAddingExerciseKey] = useState("");
  const [error, setError] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [savingNotesId, setSavingNotesId] = useState("");
  const [noteStatus, setNoteStatus] = useState<Record<string, string>>(
    Object.fromEntries(
      initialExercises.map((exercise) => [exercise.sessionExerciseId, ""])
    )
  );

  const [setInputs, setSetInputs] = useState<
    Record<string, { weight: string; reps: string; error: string }>
  >({});
  const [exerciseNotes, setExerciseNotes] = useState<Record<string, string>>(
    Object.fromEntries(
      initialExercises.map((exercise) => [
        exercise.sessionExerciseId,
        exercise.notes ?? "",
      ])
    )
  );

  const currentExerciseIds = new Set(exercises.map((exercise) => exercise.id));
  const availableExercises = libraryExercises.filter(
    (exercise) => !currentExerciseIds.has(exercise.id)
  );

  const normalizedSearch = exerciseSearch.trim().toLowerCase();
  const matchingExercises = normalizedSearch
    ? availableExercises.filter((exercise) => {
        const nameMatch = exercise.name.toLowerCase().includes(normalizedSearch);
        const descriptionMatch = exercise.description
          ?.toLowerCase()
          .includes(normalizedSearch);
        const categoryMatch = exercise.category
          ?.toLowerCase()
          .includes(normalizedSearch);
        const equipmentMatch = exercise.equipment
          ?.toLowerCase()
          .includes(normalizedSearch);
        const muscleMatch = exercise.primaryMuscles.some((muscle) =>
          muscle.toLowerCase().includes(normalizedSearch)
        );

        return (
          nameMatch ||
          descriptionMatch ||
          categoryMatch ||
          equipmentMatch ||
          muscleMatch
        );
      })
    : [];

  const quickPickExercises = availableExercises.slice(0, 8);
  const hasExactMatch = availableExercises.some(
    (exercise) => exercise.name.toLowerCase() === normalizedSearch
  );
  const customExerciseName = exerciseSearch.trim();
  const customExerciseKey = `custom:${customExerciseName}`;
  const canAddCustomExercise = Boolean(customExerciseName) && !hasExactMatch;

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

  const insertExercise = (sessionExercise: {
    id: string;
    notes: string | null;
    exercise: {
      id: string;
      name: string;
      description: string | null;
      category: string | null;
      equipment: string | null;
      primaryMuscles: string[];
      coachingCues: string[];
      visualPath: string;
      accentColor: string;
      accentSoft: string;
    };
  }) => {
    setExercises((prev) => {
      if (prev.some((exercise) => exercise.id === sessionExercise.exercise.id)) {
        return prev;
      }

      return [
        ...prev,
        {
          id: sessionExercise.exercise.id,
          sessionExerciseId: sessionExercise.id,
          name: sessionExercise.exercise.name,
          description: sessionExercise.exercise.description,
          category: sessionExercise.exercise.category,
          equipment: sessionExercise.exercise.equipment,
          primaryMuscles: sessionExercise.exercise.primaryMuscles,
          coachingCues: sessionExercise.exercise.coachingCues,
          visualPath: sessionExercise.exercise.visualPath,
          accentColor: sessionExercise.exercise.accentColor,
          accentSoft: sessionExercise.exercise.accentSoft,
          notes: sessionExercise.notes,
        },
      ];
    });

    setExerciseNotes((prev) => ({
      ...prev,
      [sessionExercise.id]: sessionExercise.notes ?? "",
    }));
    setNoteStatus((prev) => ({
      ...prev,
      [sessionExercise.id]: "",
    }));
  };

  const handleAddExistingExercise = async (
    exerciseId: string,
    displayName: string
  ) => {
    setAddingExerciseKey(exerciseId);
    setError("");

    try {
      const sessionExercise = await addExistingExerciseToSession(
        session.id,
        exerciseId
      );
      insertExercise(sessionExercise);
      setExerciseSearch("");
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : `Failed to add ${displayName}`
      );
    } finally {
      setAddingExerciseKey("");
    }
  };

  const handleAddCustomExercise = async () => {
    const name = customExerciseName;
    if (!name) return;

    setAddingExerciseKey(customExerciseKey);
    setError("");

    try {
      const sessionExercise = await addExerciseToSession(session.id, name);
      insertExercise(sessionExercise);
      setExerciseSearch("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add exercise");
    } finally {
      setAddingExerciseKey("");
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
    setSets((prev) => prev.filter((set) => set.id !== setId));
    await deleteSet(setId);
  };

  const handleSaveNotes = async (sessionExerciseId: string) => {
    setSavingNotesId(sessionExerciseId);
    setNoteStatus((prev) => ({ ...prev, [sessionExerciseId]: "" }));

    try {
      const updated = await updateSessionExerciseNotes(
        sessionExerciseId,
        exerciseNotes[sessionExerciseId] ?? ""
      );

      setExercises((prev) =>
        prev.map((exercise) =>
          exercise.sessionExerciseId === sessionExerciseId
            ? { ...exercise, notes: updated.notes }
            : exercise
        )
      );
      setExerciseNotes((prev) => ({
        ...prev,
        [sessionExerciseId]: updated.notes ?? "",
      }));
      setNoteStatus((prev) => ({ ...prev, [sessionExerciseId]: "Saved" }));
    } catch (e: unknown) {
      setNoteStatus((prev) => ({
        ...prev,
        [sessionExerciseId]:
          e instanceof Error ? e.message : "Could not save notes",
      }));
    } finally {
      setSavingNotesId("");
    }
  };

  const handleFinish = async () => {
    if (!confirm("Finish this workout?")) return;
    setFinishing(true);
    await finishSession(session.id);
    router.push("/history");
  };

  const setsForExercise = (exerciseId: string) =>
    sets.filter((set) => set.exerciseId === exerciseId);

  return (
    <div className="px-5 space-y-4">
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[#666] uppercase tracking-widest">
              Exercise Library
            </p>
            <p className="text-sm text-[#555] mt-1">
              Pick from the built-in library or add a custom movement if yours
              is not listed.
            </p>
          </div>
          <Link href="/plans" className="text-xs text-[#c8ff00]">
            Plans
          </Link>
        </div>

        <input
          type="text"
          value={exerciseSearch}
          onChange={(e) => setExerciseSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && normalizedSearch && !hasExactMatch) {
              e.preventDefault();
              handleAddCustomExercise();
            }
          }}
          placeholder="Search bench, squat, row..."
          className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white placeholder-[#444] focus:border-[#c8ff00] focus:outline-none"
        />

        <div
          className="rounded-xl border px-3 py-3"
          style={{ borderColor: "#252525", backgroundColor: "#151515" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-[#666] uppercase tracking-widest">
                Custom Exercise
              </p>
              <p className="text-xs text-[#777] mt-1">
                {!customExerciseName
                  ? "Type a name above if your exercise is not in the library."
                  : hasExactMatch
                    ? `"${customExerciseName}" is already in the library.`
                    : `Add "${customExerciseName}" just for your account.`}
              </p>
            </div>

            <button
              onClick={handleAddCustomExercise}
              disabled={!canAddCustomExercise || addingExerciseKey === customExerciseKey}
              className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"
              style={{ backgroundColor: "#c8ff00" }}
            >
              {addingExerciseKey === customExerciseKey ? "Adding..." : "Add Custom"}
            </button>
          </div>
        </div>

        {normalizedSearch ? (
          <div className="space-y-2">
            {matchingExercises.length > 0 ? (
              matchingExercises.slice(0, 6).map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() =>
                    handleAddExistingExercise(exercise.id, exercise.name)
                  }
                  disabled={addingExerciseKey === exercise.id}
                  className="w-full text-left rounded-xl px-4 py-3 border disabled:opacity-50"
                  style={{
                    backgroundColor: "#151515",
                    borderColor: "#252525",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 shrink-0">
                      <ExerciseVisual
                        name={exercise.name}
                        category={exercise.category}
                        visualPath={exercise.visualPath}
                        accentColor={exercise.accentColor}
                        accentSoft={exercise.accentSoft}
                        size="sm"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">
                            {exercise.name}
                          </p>
                          {exercise.description && (
                            <p className="text-xs text-[#666] mt-1">
                              {exercise.description}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-[#c8ff00]">
                          {addingExerciseKey === exercise.id ? "Adding" : "Add"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {exercise.equipment && (
                          <span
                            className="px-2 py-1 rounded-full text-[10px]"
                            style={{
                              backgroundColor: "#1d1d1d",
                              color: "#adadad",
                            }}
                          >
                            {exercise.equipment}
                          </span>
                        )}
                        {exercise.primaryMuscles.slice(0, 2).map((muscle) => (
                          <span
                            key={muscle}
                            className="px-2 py-1 rounded-full text-[10px]"
                            style={{
                              backgroundColor: exercise.accentSoft,
                              color: "#f0f0f0",
                            }}
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>

                      {exercise.coachingCues[0] && (
                        <p className="text-[11px] text-[#777] mt-2">
                          Cue: {exercise.coachingCues[0]}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-[#555]">
                No library matches for &quot;{exerciseSearch.trim()}&quot;.
              </p>
            )}

            {!hasExactMatch && (
              <p className="text-xs text-[#666]">
                No exact match? Use `Add Custom` above.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-[#666] uppercase tracking-widest">
              Quick Picks
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPickExercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() =>
                    handleAddExistingExercise(exercise.id, exercise.name)
                  }
                  disabled={addingExerciseKey === exercise.id}
                  className="px-3 py-2 rounded-full text-xs border disabled:opacity-50"
                  style={{
                    borderColor: "#2a2a2a",
                    backgroundColor: "#181818",
                    color: "#f0f0f0",
                  }}
                >
                  {addingExerciseKey === exercise.id ? "Adding…" : exercise.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#555]">
              Visuals are bundled into the app, so there are no external media
              accounts or paid APIs to set up.
            </p>
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {exercises.length === 0 ? (
        <div className="text-center py-12 text-[#444]">
          <p
            className="text-4xl mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            No exercises yet
          </p>
          <p className="text-sm">
            Start with a quick pick, search the library, or add your own.
          </p>
        </div>
      ) : (
        exercises.map((exercise) => {
          const exSets = setsForExercise(exercise.id);
          const input = getInput(exercise.id);
          const notesValue = exerciseNotes[exercise.sessionExerciseId] ?? "";
          const notesStatus = noteStatus[exercise.sessionExerciseId] ?? "";

          return (
            <div
              key={exercise.id}
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid #1f1f1f" }}
              >
                <div className="grid grid-cols-[88px_1fr] gap-3 items-start">
                  <ExerciseVisual
                    name={exercise.name}
                    category={exercise.category}
                    visualPath={exercise.visualPath}
                    accentColor={exercise.accentColor}
                    accentSoft={exercise.accentSoft}
                  />

                  <div>
                    <h3 className="font-semibold text-white">{exercise.name}</h3>
                    {exercise.description && (
                      <p className="text-xs text-[#666] mt-1">
                        {exercise.description}
                      </p>
                    )}
                    <p className="text-xs text-[#666] mt-1">
                      {exSets.length} set{exSets.length !== 1 ? "s" : ""}
                      {exercise.category ? ` • ${exercise.category}` : ""}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {exercise.equipment && (
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px]"
                          style={{
                            backgroundColor: "#1d1d1d",
                            color: "#d0d0d0",
                          }}
                        >
                          {exercise.equipment}
                        </span>
                      )}
                      {exercise.primaryMuscles.slice(0, 3).map((muscle) => (
                        <span
                          key={muscle}
                          className="px-2.5 py-1 rounded-full text-[10px]"
                          style={{
                            backgroundColor: exercise.accentSoft,
                            color: "#f3f3f3",
                          }}
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>

                    {exercise.coachingCues.length > 0 && (
                      <p className="text-[11px] text-[#777] mt-3">
                        {exercise.coachingCues.slice(0, 2).join(" • ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="px-4 py-3 space-y-2"
                style={{ borderBottom: "1px solid #1f1f1f" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[10px] text-[#666] uppercase tracking-widest">
                    Notes
                  </label>
                  {notesStatus && (
                    <p
                      className={`text-[10px] uppercase tracking-widest ${
                        notesStatus === "Saved"
                          ? "text-[#c8ff00]"
                          : "text-red-400"
                      }`}
                    >
                      {notesStatus}
                    </p>
                  )}
                </div>
                <textarea
                  value={notesValue}
                  onChange={(e) => {
                    setExerciseNotes((prev) => ({
                      ...prev,
                      [exercise.sessionExerciseId]: e.target.value,
                    }));
                    setNoteStatus((prev) => ({
                      ...prev,
                      [exercise.sessionExerciseId]: "",
                    }));
                  }}
                  placeholder="Optional notes, cues, machine settings..."
                  rows={2}
                  className="w-full resize-none bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#444] focus:border-[#c8ff00] focus:outline-none"
                />
                <button
                  onClick={() => handleSaveNotes(exercise.sessionExerciseId)}
                  disabled={savingNotesId === exercise.sessionExerciseId}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-black disabled:opacity-50"
                  style={{ backgroundColor: "#c8ff00" }}
                >
                  {savingNotesId === exercise.sessionExerciseId
                    ? "Saving…"
                    : "Save Notes"}
                </button>
              </div>

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
                      {exSets.map((set) => (
                        <tr
                          key={set.id}
                          className="border-t"
                          style={{ borderColor: "#1f1f1f" }}
                        >
                          <td className="py-2 text-[#c8ff00] font-mono text-xs">
                            {set.setNumber}
                          </td>
                          <td className="py-2 text-right font-mono text-white">
                            {set.weight}
                          </td>
                          <td className="py-2 text-right font-mono text-white">
                            {set.reps}
                          </td>
                          <td className="py-2 text-right">
                            <button
                              onClick={() => handleDeleteSet(set.id)}
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

              <div
                className="px-4 py-3"
                style={{
                  borderTop: exSets.length ? "1px solid #1f1f1f" : undefined,
                }}
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
