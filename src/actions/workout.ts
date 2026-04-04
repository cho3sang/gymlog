"use server";

import { prisma } from "@/lib/prisma";
import { requireCurrentViewer } from "@/lib/current-user";
import {
  getLibraryExerciseLookupKey,
  getUserExerciseLookupKey,
  normalizeExerciseName,
} from "@/lib/exercise-lookup";
import {
  BUILT_IN_PLANS,
  EXERCISE_LIBRARY,
  findBuiltInPlan,
  findLibraryExercise,
  getExerciseLibraryDetails,
} from "@/lib/workoutData";
import { revalidatePath } from "next/cache";

function normalizeName(value: string) {
  return normalizeExerciseName(value);
}

function decorateExercise<T extends {
  name: string;
  category: string | null;
  description: string | null;
}>(exercise: T) {
  return {
    ...exercise,
    ...getExerciseLibraryDetails(exercise),
  };
}

function decorateSessionExercise<
  T extends {
    exercise: {
      name: string;
      category: string | null;
      description: string | null;
    };
  },
>(sessionExercise: T) {
  return {
    ...sessionExercise,
    exercise: decorateExercise(sessionExercise.exercise),
  };
}

function revalidateWorkoutViews() {
  revalidatePath("/dashboard");
  revalidatePath("/log");
  revalidatePath("/history");
  revalidatePath("/plans");
  revalidatePath("/progress");
}

async function ensureExerciseLibrary() {
  await Promise.all(
    EXERCISE_LIBRARY.map((exercise) =>
      prisma.exercise.upsert({
        where: { lookupKey: getLibraryExerciseLookupKey(exercise.name) },
        update: {
          name: exercise.name,
          category: exercise.category,
          description: exercise.description,
          isLibrary: true,
        },
        create: {
          name: exercise.name,
          lookupKey: getLibraryExerciseLookupKey(exercise.name),
          category: exercise.category,
          description: exercise.description,
          isLibrary: true,
        },
      })
    )
  );
}

async function getActiveSessionForUser(userId: string) {
  return prisma.workoutSession.findFirst({
    where: { userId, isFinished: false },
    orderBy: { createdAt: "desc" },
  });
}

async function ensureSessionOwned(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new Error("Workout session not found");
  }

  return session;
}

async function ensureActiveSessionOwned(sessionId: string, userId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId, isFinished: false },
  });

  if (!session) {
    throw new Error("Active workout session not found");
  }

  return session;
}

async function getVisibleExercise(userId: string, exerciseId: string) {
  const exercise = await prisma.exercise.findFirst({
    where: {
      id: exerciseId,
      OR: [
        { isLibrary: true },
        { createdById: userId },
        { sessions: { some: { session: { userId } } } },
        { planEntries: { some: { plan: { userId } } } },
      ],
    },
  });

  if (!exercise) {
    throw new Error("Exercise not found");
  }

  return exercise;
}

async function getVisibleExercises(userId: string, exerciseIds: string[]) {
  const uniqueExerciseIds = Array.from(new Set(exerciseIds));

  const exercises = await prisma.exercise.findMany({
    where: {
      id: { in: uniqueExerciseIds },
      OR: [
        { isLibrary: true },
        { createdById: userId },
        { sessions: { some: { session: { userId } } } },
        { planEntries: { some: { plan: { userId } } } },
      ],
    },
  });

  if (exercises.length !== uniqueExerciseIds.length) {
    throw new Error("One or more selected exercises are not available");
  }

  return exercises;
}

async function syncSessionExercise(sessionId: string, exerciseId: string) {
  const sessionExercise = await prisma.sessionExercise.upsert({
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

  return decorateSessionExercise(sessionExercise);
}

async function getOrCreateActiveSession(userId: string, name?: string | null) {
  const normalizedName = name ? normalizeName(name) : "";
  const existing = await getActiveSessionForUser(userId);

  if (existing) {
    if (normalizedName && !existing.name) {
      return prisma.workoutSession.update({
        where: { id: existing.id },
        data: { name: normalizedName },
      });
    }

    return existing;
  }

  return prisma.workoutSession.create({
    data: {
      userId,
      name: normalizedName || null,
    },
  });
}

async function addExercisesToSession(sessionId: string, exerciseIds: string[]) {
  const uniqueExerciseIds = Array.from(new Set(exerciseIds));

  await Promise.all(
    uniqueExerciseIds.map((exerciseId) =>
      syncSessionExercise(sessionId, exerciseId)
    )
  );
}

async function getOrCreateExerciseByName(userId: string, name: string) {
  const normalized = normalizeName(name);

  if (!normalized) {
    throw new Error("Exercise name cannot be empty");
  }

  const libraryExercise = findLibraryExercise(normalized);

  if (libraryExercise) {
    return prisma.exercise.upsert({
      where: { lookupKey: getLibraryExerciseLookupKey(libraryExercise.name) },
      update: {
        name: libraryExercise.name,
        category: libraryExercise.category,
        description: libraryExercise.description,
        isLibrary: true,
      },
      create: {
        name: libraryExercise.name,
        lookupKey: getLibraryExerciseLookupKey(libraryExercise.name),
        category: libraryExercise.category,
        description: libraryExercise.description,
        isLibrary: true,
      },
    });
  }

  const existingExercise = await prisma.exercise.findUnique({
    where: {
      lookupKey: getUserExerciseLookupKey(userId, normalized),
    },
  });

  if (existingExercise) {
    return existingExercise;
  }

  return prisma.exercise.create({
    data: {
      name: normalized,
      lookupKey: getUserExerciseLookupKey(userId, normalized),
      createdById: userId,
    },
  });
}

// ─── Session ───────────────────────────────────────────────────────────────

export async function getActiveSession() {
  const viewer = await requireCurrentViewer();
  return getActiveSessionForUser(viewer.id);
}

export async function startSession(name?: string | null): Promise<{ id: string }> {
  const viewer = await requireCurrentViewer();
  const session = await getOrCreateActiveSession(viewer.id, name);

  revalidatePath("/dashboard");
  revalidatePath("/log");
  return { id: session.id };
}

export async function finishSession(sessionId: string) {
  const viewer = await requireCurrentViewer();
  await ensureActiveSessionOwned(sessionId, viewer.id);

  await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { isFinished: true },
  });

  revalidateWorkoutViews();
}

export async function listFinishedSessions() {
  const viewer = await requireCurrentViewer();

  return prisma.workoutSession.findMany({
    where: { userId: viewer.id, isFinished: true },
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
}

export async function getSessionDetails(sessionId: string) {
  const viewer = await requireCurrentViewer();

  return prisma.workoutSession.findFirst({
    where: { id: sessionId, userId: viewer.id, isFinished: true },
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
  const viewer = await requireCurrentViewer();
  await ensureExerciseLibrary();
  return getOrCreateExerciseByName(viewer.id, name);
}

export async function addExerciseToSession(
  sessionId: string,
  exerciseName: string
) {
  const viewer = await requireCurrentViewer();
  await ensureActiveSessionOwned(sessionId, viewer.id);

  const exercise = await getOrCreateExerciseByName(viewer.id, exerciseName);
  const sessionExercise = await syncSessionExercise(sessionId, exercise.id);

  revalidatePath("/log");
  return sessionExercise;
}

export async function addExistingExerciseToSession(
  sessionId: string,
  exerciseId: string
) {
  const viewer = await requireCurrentViewer();
  await ensureActiveSessionOwned(sessionId, viewer.id);
  const exercise = await getVisibleExercise(viewer.id, exerciseId);

  const sessionExercise = await syncSessionExercise(sessionId, exercise.id);

  revalidatePath("/log");
  return sessionExercise;
}

export async function updateSessionExerciseNotes(
  sessionExerciseId: string,
  notes: string
) {
  const viewer = await requireCurrentViewer();
  const sessionExercise = await prisma.sessionExercise.findFirst({
    where: {
      id: sessionExerciseId,
      session: { userId: viewer.id, isFinished: false },
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
  const viewer = await requireCurrentViewer();
  await ensureSessionOwned(sessionId, viewer.id);

  const sessionExercises = await prisma.sessionExercise.findMany({
    where: { sessionId },
    include: { exercise: true },
    orderBy: { id: "asc" },
  });

  return sessionExercises.map(decorateSessionExercise);
}

export async function listAllExercises() {
  const viewer = await requireCurrentViewer();
  await ensureExerciseLibrary();

  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [
        { isLibrary: true },
        { createdById: viewer.id },
        { sessions: { some: { session: { userId: viewer.id } } } },
        { planEntries: { some: { plan: { userId: viewer.id } } } },
      ],
    },
    orderBy: [{ isLibrary: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  return exercises.map(decorateExercise);
}

export async function listExercisesForUser() {
  const viewer = await requireCurrentViewer();
  const sets = await prisma.setEntry.findMany({
    where: { session: { userId: viewer.id } },
    select: { exercise: true },
    distinct: ["exerciseId"],
  });

  return sets.map((set) => decorateExercise(set.exercise));
}

// ─── Plans ─────────────────────────────────────────────────────────────────

export async function listBuiltInPlans() {
  await ensureExerciseLibrary();
  return BUILT_IN_PLANS;
}

export async function listWorkoutPlans() {
  const viewer = await requireCurrentViewer();
  await ensureExerciseLibrary();

  const plans = await prisma.workoutPlan.findMany({
    where: { userId: viewer.id },
    orderBy: { updatedAt: "desc" },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
        include: { exercise: true },
      },
    },
  });

  return plans.map((plan) => ({
    ...plan,
    exercises: plan.exercises.map((entry) => ({
      ...entry,
      exercise: decorateExercise(entry.exercise),
    })),
  }));
}

export async function createWorkoutPlan(name: string, exerciseIds: string[]) {
  const viewer = await requireCurrentViewer();
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

  await ensureExerciseLibrary();
  await getVisibleExercises(viewer.id, uniqueExerciseIds);

  const plan = await prisma.workoutPlan.upsert({
    where: {
      userId_name: {
        userId: viewer.id,
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
      userId: viewer.id,
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
  revalidatePath("/dashboard");
  return {
    ...plan,
    exercises: plan.exercises.map((entry) => ({
      ...entry,
      exercise: decorateExercise(entry.exercise),
    })),
  };
}

export async function startBuiltInPlan(planSlug: string) {
  const viewer = await requireCurrentViewer();
  await ensureExerciseLibrary();

  const plan = findBuiltInPlan(planSlug);
  if (!plan) {
    throw new Error("Plan not found");
  }

  const exercises = await Promise.all(
    plan.exerciseNames.map((exerciseName) =>
      getOrCreateExerciseByName(viewer.id, exerciseName)
    )
  );

  const session = await getOrCreateActiveSession(viewer.id, plan.name);
  await addExercisesToSession(
    session.id,
    exercises.map((exercise) => exercise.id)
  );

  revalidateWorkoutViews();
  return { id: session.id };
}

export async function startCustomPlan(planId: string) {
  const viewer = await requireCurrentViewer();
  const plan = await prisma.workoutPlan.findFirst({
    where: { id: planId, userId: viewer.id },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  const session = await getOrCreateActiveSession(viewer.id, plan.name);
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
  const viewer = await requireCurrentViewer();

  if (reps <= 0) throw new Error("Reps must be greater than 0");
  if (weight < 0) throw new Error("Weight cannot be negative");

  await ensureActiveSessionOwned(sessionId, viewer.id);
  await getVisibleExercise(viewer.id, exerciseId);

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
  const viewer = await requireCurrentViewer();
  const setEntry = await prisma.setEntry.findFirst({
    where: {
      id: setId,
      session: { userId: viewer.id, isFinished: false },
    },
  });

  if (!setEntry) {
    throw new Error("Set not found");
  }

  await prisma.setEntry.delete({ where: { id: setId } });
  revalidatePath("/log");
}

export async function listSetsForSession(sessionId: string) {
  const viewer = await requireCurrentViewer();
  await ensureSessionOwned(sessionId, viewer.id);

  return prisma.setEntry.findMany({
    where: { sessionId },
    orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
    include: { exercise: true },
  });
}

// ─── Progress ───────────────────────────────────────────────────────────────

export async function getProgressForExercise(exerciseId: string) {
  const viewer = await requireCurrentViewer();
  const sets = await prisma.setEntry.findMany({
    where: {
      exerciseId,
      session: { userId: viewer.id, isFinished: true },
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
  const viewer = await requireCurrentViewer();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [activeSession, lastFinished, weekCount] = await Promise.all([
    getActiveSessionForUser(viewer.id),
    prisma.workoutSession.findFirst({
      where: { userId: viewer.id, isFinished: true },
      orderBy: { date: "desc" },
    }),
    prisma.workoutSession.count({
      where: {
        userId: viewer.id,
        isFinished: true,
        date: { gte: startOfWeek },
      },
    }),
  ]);

  return { activeSession, lastFinished, weekCount };
}
