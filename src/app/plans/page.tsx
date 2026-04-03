import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ExerciseVisual from "@/components/ExerciseVisual";
import {
  createWorkoutPlan,
  listAllExercises,
  listWorkoutPlans,
  startBuiltInPlan,
  startCustomPlan,
} from "@/actions/workout";
import { BUILT_IN_PLANS } from "@/lib/workoutData";

export const dynamic = "force-dynamic";

async function handleCreatePlan(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "");
  const exerciseIds = formData.getAll("exerciseIds").map(String);

  await createWorkoutPlan(name, exerciseIds);
  redirect("/plans");
}

async function handleStartBuiltInPlan(formData: FormData) {
  "use server";

  const slug = String(formData.get("slug") ?? "");
  await startBuiltInPlan(slug);
  redirect("/log");
}

async function handleStartCustomPlan(formData: FormData) {
  "use server";

  const planId = String(formData.get("planId") ?? "");
  await startCustomPlan(planId);
  redirect("/log");
}

export default async function PlansPage() {
  const [customPlans, exercises] = await Promise.all([
    listWorkoutPlans(),
    listAllExercises(),
  ]);
  const exerciseByName = Object.fromEntries(
    exercises.map((exercise) => [exercise.name, exercise])
  );

  const groupedExercises = exercises.reduce<
    Record<string, typeof exercises>
  >((groups, exercise) => {
    const key = exercise.category ?? "Other";
    groups[key] = [...(groups[key] ?? []), exercise];
    return groups;
  }, {});

  const categories = Object.keys(groupedExercises).sort();

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Plans"
        subtitle={`${BUILT_IN_PLANS.length} built-in routines and ${customPlans.length} saved custom plan${
          customPlans.length !== 1 ? "s" : ""
        }`}
      />

      <div className="px-5 pb-4 space-y-5">
        <section className="space-y-3">
          <div>
            <p className="text-xs text-[#666] uppercase tracking-widest">
              Built-In Routines
            </p>
            <p className="text-sm text-[#555] mt-1">
              Start with a simple template and adjust inside the workout screen.
              Everything here uses bundled visuals and local exercise metadata,
              so there is nothing extra to sign up for.
            </p>
          </div>

          {BUILT_IN_PLANS.map((plan) => (
            <div
              key={plan.slug}
              className="rounded-2xl p-4 space-y-3"
              style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
            >
              <div className="grid grid-cols-[92px_1fr] gap-4 items-start">
                {exerciseByName[plan.exerciseNames[0]] ? (
                  <ExerciseVisual
                    name={exerciseByName[plan.exerciseNames[0]].name}
                    category={exerciseByName[plan.exerciseNames[0]].category}
                    visualPath={exerciseByName[plan.exerciseNames[0]].visualPath}
                    accentColor={exerciseByName[plan.exerciseNames[0]].accentColor}
                    accentSoft={exerciseByName[plan.exerciseNames[0]].accentSoft}
                  />
                ) : (
                  <div
                    className="rounded-2xl h-24"
                    style={{ backgroundColor: "#171717" }}
                  />
                )}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className="text-3xl leading-none text-white"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {plan.name}
                    </h2>
                    <p className="text-sm text-[#666] mt-2">{plan.description}</p>
                  </div>
                  <form action={handleStartBuiltInPlan}>
                    <input type="hidden" name="slug" value={plan.slug} />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
                      style={{ backgroundColor: "#c8ff00" }}
                    >
                      Start
                    </button>
                  </form>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {plan.exerciseNames.map((exerciseName) => (
                  <span
                    key={exerciseName}
                    className="px-3 py-1.5 rounded-full text-[11px] border"
                    style={{
                      borderColor: "#262626",
                      backgroundColor: "#171717",
                      color: "#d0d0d0",
                    }}
                  >
                    {exerciseName}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section
          className="rounded-2xl p-4 space-y-4"
          style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
        >
          <div>
            <p className="text-xs text-[#666] uppercase tracking-widest">
              Create Custom Plan
            </p>
            <p className="text-sm text-[#555] mt-1">
              Save your own routine. Reusing the same name will update the plan.
            </p>
          </div>

          <form action={handleCreatePlan} className="space-y-4">
            <div>
              <label className="text-[10px] text-[#666] uppercase tracking-widest block mb-1">
                Plan Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Upper A"
                className="w-full bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl px-4 py-3 text-sm text-white placeholder-[#444] focus:border-[#c8ff00] focus:outline-none"
              />
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-[#666] uppercase tracking-widest">
                Exercises
              </p>

              {categories.map((category) => (
                <div key={category} className="space-y-2">
                  <p className="text-sm font-semibold text-white">{category}</p>
                  <div className="space-y-2">
                    {groupedExercises[category].map((exercise) => (
                      <label
                        key={exercise.id}
                        className="grid grid-cols-[64px_1fr] gap-3 rounded-xl px-3 py-3 border"
                        style={{
                          borderColor: "#222",
                          backgroundColor: "#171717",
                        }}
                      >
                        <ExerciseVisual
                          name={exercise.name}
                          category={exercise.category}
                          visualPath={exercise.visualPath}
                          accentColor={exercise.accentColor}
                          accentSoft={exercise.accentSoft}
                          size="sm"
                        />
                        <span className="block">
                          <span className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              name="exerciseIds"
                              value={exercise.id}
                              className="mt-1"
                            />
                            <span className="block min-w-0">
                              <span className="block text-sm text-white">
                                {exercise.name}
                              </span>
                              {exercise.description && (
                                <span className="block text-xs text-[#666] mt-1">
                                  {exercise.description}
                                </span>
                              )}
                              <span className="flex flex-wrap gap-2 mt-2">
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
                                {exercise.primaryMuscles
                                  .slice(0, 2)
                                  .map((muscle) => (
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
                              </span>
                            </span>
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold text-black"
              style={{ backgroundColor: "#c8ff00" }}
            >
              Save Plan
            </button>
          </form>
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-xs text-[#666] uppercase tracking-widest">
              Your Plans
            </p>
            <p className="text-sm text-[#555] mt-1">
              Start any saved routine and the exercises will be added to your active workout.
            </p>
          </div>

          {customPlans.length === 0 ? (
            <div
              className="rounded-2xl p-4 text-sm text-[#555]"
              style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
            >
              No custom plans yet.
            </div>
          ) : (
            customPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl p-4 space-y-3"
                style={{ backgroundColor: "#111111", border: "1px solid #1f1f1f" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-white">{plan.name}</h2>
                    <p className="text-xs text-[#666] mt-1">
                      {plan.exercises.length} exercise
                      {plan.exercises.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <form action={handleStartCustomPlan}>
                    <input type="hidden" name="planId" value={plan.id} />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
                      style={{ backgroundColor: "#c8ff00" }}
                    >
                      Start
                    </button>
                  </form>
                </div>

                <div className="flex flex-wrap gap-2">
                  {plan.exercises.map((exercise) => (
                    <span
                      key={exercise.id}
                      className="px-3 py-1.5 rounded-full text-[11px] border"
                      style={{
                        borderColor: "#262626",
                        backgroundColor: "#171717",
                        color: "#d0d0d0",
                      }}
                    >
                      {exercise.exercise.name}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
