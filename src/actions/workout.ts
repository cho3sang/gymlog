"use server";

import { prisma } from "@/lib/prisma";
import {
  BUILT_IN_PLANS,
  EXERCISE_LIBRARY,
  findBuiltInPlan,
  findLibraryExercise,
} from "@/lib/workoutData";
import { revalidatePath } from "next/cache";

const DEMO_USER = "demo";

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

async function ensureDemoUser() {
  return prisma.user.upsert({
    where: { id: DEMO_USER },
    update: {},
    create: { id: DEMO_USER },
  });
}

async function ensureExerciseLibrary() {
  await Promise.all(
    EXERCISE_LIBRARY.map((exercise) =>
      prisma.exercise.upsert({
        where: { name: exercise.name },
        update: {
          category: exercise.category,
          description: exercise.description,
          isLibrary: true,
        },
        create: {
          name: exercise.name,
          category: exercise.category,
          description: exercise.description,
          isLibrary: true,
        },
      })
    )
  );
}

async function syncSessionExercise(sessionId: string, exerciseId: string) {
  return prisma.sessionExercise.upsert({
    where: {
      sessionId_exerciseId: {
        sessionId,
        exerciseId,
      },
    },
    update: {},
    create: { sessionId, exerciseId },
    include: { exercise: true },
  });
}

async function getOrCreateActiveSession(name?: string | null) {
  const normalizedName = name ? normalizeName(name) : "";
  const existing = await getActiveSession();

  if (existing) {
    if (normalizedName && !existing.name) {
      return prisma.workoutSession.update({
        where: { id: existing.id },
        data: { name: normalizedName },
      });
    }

    return existing;
  }

  await ensureDemoUser();

  return prisma.workoutSession.create({
    data: {
      userId: DEMO_USER,
      name: normalizedName || null,
    },
  });
}

async function addExercisesToSession(sessionId: string, exerciseIds: string[]) {
  const uniqueExerciseIds = Array.from(new Set(exerciseIds));

  await Promise.all(
    uniqueExerciseIds.map((exerciseId) => syncSessionExercise(sessionId, exerciseId))
  );
}

async function getOrCreateExerciseByName(name: string) {
  const normalized = normalizeName(name);
  if (!normalized) throw new Error("Exercise name cannot be empty");

  const libraryExercise = findLibraryExercise(normalized);

  if (libraryExercise) {
    return prisma.exercise.upsert({
      where: { name: libraryExercise.name },
      update: {
        category: libraryExercise.category,
        description: libraryExercise.description,
        isLibrary: true,
      },
      create: {
        name: libraryExercise.name,
        category: libraryExercise.category,
        description: libraryExercise.description,
        isLibrary: true,
      },
    });
  }

  return prisma.exercise.upsert({
    where: { name: normalized },
    update: {},
    create: { name: normalized },
  });
}

function revalidateWorkoutViews() {
  revalidatePath("/");
  revalidatePath("/log");
  revalidatePath("/history");
  revalidatePath("/plans");
}

// ─── Session ───────────────────────────────────────────────────────────────

export async function getActiveSession() {
  return prisma.workoutSession.findFirst({
    where: { userId: DEMO_USER, isFinished: false },
    orderBy: { createdAt: "desc" },
  });
}

export async function startSession(name?: string | null): Promise<{ id: string }> {
  const session = await getOrCreateActiveSession(name);
  revalidatePath("/");
  revalidatePath("/log");
  return { id: session.id };
}

export async function finishSession(sessionId: string) {
  await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { isFinished: true },
  });

  revalidateWorkoutViews();
}

export async function listFinishedSessions() {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: DEMO_USER, isFinished: true },
    orderBy: { date: "desc" },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
      },
      sets: true,
    },
  });

  return sessions;
}

export async function getSessionDetails(sessionId: string) {
  return prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: DEMO_USER, isFinished: true },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
        orderBy: {
          id: "asc",
        },
      },
      sets: {
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
      },
    },
  });
}

// ─── Exercises ─────────────────────────────────────────────────────────────

export async function upsertExerciseByName(name: string) {
  await ensureExerciseLibrary();
  return getOrCreateExerciseByName(name);
}

export async function addExerciseToSession(sessionId: string, exerciseName: string) {
  const exercise = await upsertExerciseByName(exerciseName);
  const sessionExercise = await syncSessionExercise(sessionId, exercise.id);

  revalidatePath("/log");
  return sessionExercise;
}

export async function addExistingExerciseToSession(
  sessionId: string,
  exerciseId: string
) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
  });

  if (!exercise) {
    throw new Error("Exercise not found");
  }

  const sessionExercise = await syncSessionExercise(sessionId, exercise.id);

  revalidatePath("/log");
  return sessionExercise;
}

export async function updateSessionExerciseNotes(
  sessionExerciseId: string,
  notes: string
) {
  const sessionExercise = await prisma.sessionExercise.findFirst({
    where: {
      id: sessionExerciseId,
      session: { userId: DEMO_USER },
    },
  });

  if (!sessionExercise) {
    throw new Error("Exercise entry not found");
  }

  const savedNotes = notes.trim();

  const updated = await prisma.sessionExercise.update({
    where: { id: sessionExerciseId },
    data: {
      notes: savedNotes || null,
    },
  });

  revalidatePath("/log");
  revalidatePath("/history");
  return updated;
}

export async function listSessionExercises(sessionId: string) {
  return prisma.sessionExercise.findMany({
    where: { sessionId },
    include: { exercise: true },
    orderBy: { id: "asc" },
  });
}

export async function listAllExercises() {
  await ensureExerciseLibrary();

  return prisma.exercise.findMany({
    orderBy: [{ isLibrary: "desc" }, { category: "asc" }, { name: "asc" }],
  });
}

export async function listExercisesForUser() {
  const sets = await prisma.setEntry.findMany({
    where: { session: { userId: DEMO_USER } },
    select: { exercise: true },
    distinct: ["exerciseId"],
  });

  return sets.map((set) => set.exercise);
}

// ─── Plans ─────────────────────────────────────────────────────────────────

export async function listBuiltInPlans() {
  await ensureExerciseLibrary();
  return BUILT_IN_PLANS;
}

export async function listWorkoutPlans() {
  await ensureExerciseLibrary();

  return prisma.workoutPlan.findMany({
    where: { userId: DEMO_USER },
    orderBy: { updatedAt: "desc" },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
        include: { exercise: true },
      },
    },
  });
}

export async function createWorkoutPlan(name: string, exerciseIds: string[]) {
  const normalizedName = normalizeName(name);

  if (!normalizedName) {
    throw new Error("Plan name cannot be empty");
  }

  const uniqueExerciseIds = Array.from(
    new Set(exerciseIds.map(String).filter(Boolean))
  );

  if (!uniqueExerciseIds.length) {
    throw new Error("Select at least one exercise for the plan");
  }

  await ensureDemoUser();
  await ensureExerciseLibrary();

  const plan = await prisma.workoutPlan.upsert({
    where: {
      userId_name: {
        userId: DEMO_USER,
        name: normalizedName,
      },
    },
    update: {
      exercises: {
        deleteMany: {},
        create: uniqueExerciseIds.map((exerciseId, index) => ({
          exerciseId,
          sortOrder: index,
        })),
      },
    },
    create: {
      userId: DEMO_USER,
      name: normalizedName,
      exercises: {
        create: uniqueExerciseIds.map((exerciseId, index) => ({
          exerciseId,
          sortOrder: index,
        })),
      },
    },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
        include: { exercise: true },
      },
    },
  });

  revalidatePath("/plans");
  revalidatePath("/");
  return plan;
}

export async function startBuiltInPlan(planSlug: string) {
  await ensureExerciseLibrary();

  const plan = findBuiltInPlan(planSlug);
  if (!plan) {
    throw new Error("Plan not found");
  }

  const exercises = await Promise.all(
    plan.exerciseNames.map((exerciseName) => getOrCreateExerciseByName(exerciseName))
  );

  const session = await getOrCreateActiveSession(plan.name);
  await addExercisesToSession(
    session.id,
    exercises.map((exercise) => exercise.id)
  );

  revalidateWorkoutViews();
  return { id: session.id };
}

export async function startCustomPlan(planId: string) {
  const plan = await prisma.workoutPlan.findFirst({
    where: { id: planId, userId: DEMO_USER },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  const session = await getOrCreateActiveSession(plan.name);
  await addExercisesToSession(
    session.id,
    plan.exercises.map((exercise) => exercise.exerciseId)
  );

  revalidateWorkoutViews();
  return { id: session.id };
}

// ─── Sets ───────────────────────────────────────────────────────────────────

export async function addSet(
  sessionId: string,
  exerciseId: string,
  weight: number,
  reps: number
) {
  if (reps <= 0) throw new Error("Reps must be greater than 0");
  if (weight < 0) throw new Error("Weight cannot be negative");

  const lastSet = await prisma.setEntry.findFirst({
    where: { sessionId, exerciseId },
    orderBy: { setNumber: "desc" },
  });

  const setNumber = (lastSet?.setNumber ?? 0) + 1;

  const entry = await prisma.setEntry.create({
    data: { sessionId, exerciseId, setNumber, reps, weight },
  });

  revalidatePath("/log");
  return entry;
}

export async function deleteSet(setId: string) {
  await prisma.setEntry.delete({ where: { id: setId } });
  revalidatePath("/log");
}

export async function listSetsForSession(sessionId: string) {
  return prisma.setEntry.findMany({
    where: { sessionId },
    orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
    include: { exercise: true },
  });
}

// ─── Progress ───────────────────────────────────────────────────────────────

export async function getProgressForExercise(exerciseId: string) {
  const sets = await prisma.setEntry.findMany({
    where: {
      exerciseId,
      session: { userId: DEMO_USER, isFinished: true },
    },
    orderBy: { createdAt: "asc" },
    include: { session: { select: { date: true } } },
  });

  if (!sets.length) {
    return { sets: [], bestSet: null, bestE1RM: null, bestE1RM30: null };
  }

  const withE1RM = sets.map((set) => ({
    ...set,
    e1rm: set.weight * (1 + set.reps / 30),
  }));

  const bestSet = withE1RM.reduce((best, current) =>
    current.weight > best.weight ? current : best
  );
  const bestE1RM = withE1RM.reduce((best, current) =>
    current.e1rm > best.e1rm ? current : best
  );

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recent = withE1RM.filter((set) => set.session.date >= cutoff);
  const bestE1RM30 = recent.length
    ? recent.reduce((best, current) =>
        current.e1rm > best.e1rm ? current : best
      )
    : null;

  return { sets: withE1RM, bestSet, bestE1RM, bestE1RM30 };
}

// ─── Home stats ─────────────────────────────────────────────────────────────

export async function getHomeStats() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [activeSession, lastFinished, weekCount] = await Promise.all([
    getActiveSession(),
    prisma.workoutSession.findFirst({
      where: { userId: DEMO_USER, isFinished: true },
      orderBy: { date: "desc" },
    }),
    prisma.workoutSession.count({
      where: {
        userId: DEMO_USER,
        isFinished: true,
        date: { gte: startOfWeek },
      },
    }),
  ]);

  return { activeSession, lastFinished, weekCount };
}
