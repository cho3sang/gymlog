"use client";

// src/app/progress/ProgressClient.tsx
import { useState, useEffect } from "react";
import { getProgressForExercise } from "@/actions/workout";

interface Exercise {
  id: string;
  name: string;
}

interface SetWithE1RM {
  id: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  e1rm: number;
  session: { date: Date };
}

interface ProgressData {
  sets: SetWithE1RM[];
  bestSet: SetWithE1RM | null;
  bestE1RM: SetWithE1RM | null;
  bestE1RM30: SetWithE1RM | null;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ProgressClient({
  exercises,
}: {
  exercises: Exercise[];
}) {
  const [selectedId, setSelectedId] = useState(exercises[0]?.id ?? "");
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    getProgressForExercise(selectedId)
      .then((d) => setData(d as ProgressData))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const recentSets = data
    ? [...data.sets].reverse().slice(0, 20)
    : [];

  return (
    <div className="space-y-4">
      {/* Exercise selector */}
      <div>
        <label className="text-xs text-[#666] uppercase tracking-widest block mb-2">
          Exercise
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full bg-[#111111] border border-[#2e2e2e] rounded-xl px-4 py-3 text-white text-sm focus:border-[#c8ff00] focus:outline-none appearance-none"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-center py-8 text-[#444] text-sm">Loading…</div>
      )}

      {!loading && data && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-2xl p-4"
              style={{
                backgroundColor: "#111111",
                border: "1px solid #1f1f1f",
              }}
            >
              <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">
                Best Set
              </p>
              {data.bestSet ? (
                <>
                  <p
                    className="text-3xl leading-none text-white"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {data.bestSet.weight}
                    <span className="text-lg text-[#666]">kg</span>
                  </p>
                  <p className="text-xs text-[#666] mt-1">
                    × {data.bestSet.reps} reps
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#444]">—</p>
              )}
            </div>

            <div
              className="rounded-2xl p-4"
              style={{
                backgroundColor: "#111111",
                border: "1px solid #1f1f1f",
              }}
            >
              <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">
                Best e1RM
              </p>
              {data.bestE1RM ? (
                <>
                  <p
                    className="text-3xl leading-none"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      color: "#c8ff00",
                    }}
                  >
                    {data.bestE1RM.e1rm.toFixed(1)}
                    <span className="text-lg text-[#666]">kg</span>
                  </p>
                  <p className="text-xs text-[#666] mt-1">
                    {data.bestE1RM.weight}kg × {data.bestE1RM.reps}
                  </p>
                </>
              ) : (
                <p className="text-sm text-[#444]">—</p>
              )}
            </div>

            <div
              className="rounded-2xl p-4 col-span-2"
              style={{
                backgroundColor: "#111111",
                border: "1px solid #1f1f1f",
              }}
            >
              <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">
                Best e1RM — Last 30 Days
              </p>
              {data.bestE1RM30 ? (
                <div className="flex items-baseline gap-4">
                  <p
                    className="text-3xl leading-none text-white"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {data.bestE1RM30.e1rm.toFixed(1)}
                    <span className="text-lg text-[#666]">kg</span>
                  </p>
                  <p className="text-xs text-[#666]">
                    {data.bestE1RM30.weight}kg × {data.bestE1RM30.reps} reps on{" "}
                    {formatDate(data.bestE1RM30.session.date)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#444]">No data in last 30 days</p>
              )}
            </div>
          </div>

          {/* Recent sets table */}
          {recentSets.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: "#111111",
                border: "1px solid #1f1f1f",
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid #1f1f1f" }}>
                <p className="text-xs text-[#666] uppercase tracking-widest">
                  Recent Sets
                </p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#555] text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-right px-4 py-2">kg</th>
                    <th className="text-right px-4 py-2">Reps</th>
                    <th className="text-right px-4 py-2">e1RM</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSets.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t"
                      style={{ borderColor: "#1a1a1a" }}
                    >
                      <td className="px-4 py-2.5 text-xs text-[#666]">
                        {formatDate(s.session.date)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-white text-xs">
                        {s.weight}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-white text-xs">
                        {s.reps}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-[#c8ff00] text-xs">
                        {s.e1rm.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data.sets.length === 0 && (
            <p className="text-center py-8 text-sm text-[#444]">
              No completed sets for this exercise yet
            </p>
          )}
        </>
      )}
    </div>
  );
}
