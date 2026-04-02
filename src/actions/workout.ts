"use server";

// src/actions/workout.ts
// All server actions for GymLog. Demo user id = "demo".

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEMO_USER = "demo";

// ─── Session ───────────────────────────────────────────────────────────────

export async function getActiveSession() {
  return prisma.workoutSession.findFirst({
    where: { userId: DEMO_USER, isFinished: false },
    orderBy: { createdAt: "desc" },
  });
}

export async function startSession(): Promise<{ id: string }> {
  const existing = await getActiveSession();
  if (existing) {
    return { id: existing.id };
  }

  // Ensure demo user exists
  await prisma.user.upsert({
    where: { id: DEMO_USER },
    update: {},
    create: { id: DEMO_USER },
  });

  const session = await prisma.workoutSession.create({
    data: { userId: DEMO_USER },
  });

  revalidatePath("/");
  revalidatePath("/log");
  return { id: session.id };
}

export async function finishSession(sessionId: string) {
  await prisma.workoutSession.update({
    where: { id: sessionId },
    data: { isFinished: true },
  });

  revalidatePath("/");
  revalidatePath("/log");
  revalidatePath("/history");
}

export async function listFinishedSessions() {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId: DEMO_USER, isFinished: true },
    orderBy: { date: "desc" },
    include: {
      exercises: { include: { exercise: true } },
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
      },
      sets: {
        orderBy: [{ exerciseId: "asc" }, { setNumber: "asc" }],
      },
    },
  });
}

// ─── Exercises ─────────────────────────────────────────────────────────────

export async function upsertExerciseByName(name: string) {
  const normalized = name.trim();
  if (!normalized) throw new Error("Exercise name cannot be empty");

  return prisma.exercise.upsert({
    where: { name: normalized },
    update: {},
    create: { name: normalized },
  });
}

export async function addExerciseToSession(
  sessionId: string,
  exerciseName: string
) {
  const exercise = await upsertExerciseByName(exerciseName);

  try {
    await prisma.sessionExercise.create({
      data: { sessionId, exerciseId: exercise.id },
    });
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    ) {
      throw error;
    }
  }

  revalidatePath("/log");
  return exercise;
}

export async function listSessionExercises(sessionId: string) {
  return prisma.sessionExercise.findMany({
    where: { sessionId },
    include: { exercise: true },
    orderBy: { id: "asc" },
  });
}

export async function listAllExercises() {
  return prisma.exercise.findMany({ orderBy: { name: "asc" } });
}

export async function listExercisesForUser() {
  // Exercises that the demo user has logged at least once
  const sets = await prisma.setEntry.findMany({
    where: { session: { userId: DEMO_USER } },
    select: { exercise: true },
    distinct: ["exerciseId"],
  });
  return sets.map((s) => s.exercise);
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

  if (!sets.length) return { sets: [], bestSet: null, bestE1RM: null, bestE1RM30: null };

  const withE1RM = sets.map((s) => ({
    ...s,
    e1rm: s.weight * (1 + s.reps / 30),
  }));

  const bestSet = withE1RM.reduce((a, b) => (b.weight > a.weight ? b : a));
  const bestE1RM = withE1RM.reduce((a, b) => (b.e1rm > a.e1rm ? b : a));

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recent = withE1RM.filter((s) => s.session.date >= cutoff);
  const bestE1RM30 = recent.length
    ? recent.reduce((a, b) => (b.e1rm > a.e1rm ? b : a))
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
      where: { userId: DEMO_USER, isFinished: true, date: { gte: startOfWeek } },
    }),
  ]);

  return { activeSession, lastFinished, weekCount };
}
