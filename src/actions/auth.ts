"use server";

import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { requireCurrentViewer } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  redirectTo: z.string().optional(),
});

const signupSchema = z.object({
  name: z.string().trim().min(2).max(40),
  email: z.string().email(),
  password: z.string().min(8),
  redirectTo: z.string().optional(),
});

function getRedirectTo(value: string | undefined) {
  return value && value.startsWith("/") ? value : "/dashboard";
}

function buildCredentialsFormData(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
) {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    redirectTo: String(formData.get("redirectTo") ?? ""),
  });

  if (!parsed.success) {
    return "Enter a valid email and a password with at least 8 characters.";
  }

  const email = parsed.data.email.toLowerCase();

  try {
    await signIn(
      "credentials",
      buildCredentialsFormData({
        email,
        password: parsed.data.password,
        redirectTo: getRedirectTo(parsed.data.redirectTo),
      })
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid email or password.";
    }

    throw error;
  }
}

export async function registerAccount(
  _prevState: string | undefined,
  formData: FormData
) {
  const parsed = signupSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    redirectTo: String(formData.get("redirectTo") ?? ""),
  });

  if (!parsed.success) {
    return "Name, email, and an 8+ character password are required.";
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return "An account with that email already exists.";
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      isGuest: false,
    },
  });

  try {
    await signIn(
      "credentials",
      buildCredentialsFormData({
        email,
        password: parsed.data.password,
        redirectTo: getRedirectTo(parsed.data.redirectTo),
      })
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return "Account created, but auto sign-in failed. Try logging in.";
    }

    throw error;
  }
}

export async function continueAsGuest(
  _prevState: string | undefined,
  formData: FormData
) {
  const redirectTo = getRedirectTo(String(formData.get("redirectTo") ?? ""));

  try {
    await signIn(
      "guest",
      buildCredentialsFormData({
        token: randomUUID(),
        redirectTo,
      })
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return "Could not start a guest session.";
    }

    throw error;
  }
}

export async function upgradeGuestAccount(
  _prevState: string | undefined,
  formData: FormData
) {
  const viewer = await requireCurrentViewer();

  if (!viewer.isGuest) {
    return "This account is already saved.";
  }

  const parsed = signupSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    redirectTo: String(formData.get("redirectTo") ?? ""),
  });

  if (!parsed.success) {
    return "Name, email, and an 8+ character password are required.";
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.id !== viewer.id) {
    return "An account with that email already exists.";
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({
    where: { id: viewer.id },
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      isGuest: false,
    },
  });

  try {
    await signIn(
      "credentials",
      buildCredentialsFormData({
        email,
        password: parsed.data.password,
        redirectTo: getRedirectTo(parsed.data.redirectTo),
      })
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return "Your data was saved, but auto sign-in failed. Try logging in.";
    }

    throw error;
  }
}

export async function discardGuestSession() {
  const viewer = await requireCurrentViewer();

  if (viewer.isGuest) {
    await prisma.$transaction(async (tx) => {
      await tx.workoutSession.deleteMany({
        where: { userId: viewer.id },
      });

      await tx.workoutPlan.deleteMany({
        where: { userId: viewer.id },
      });

      await tx.exercise.deleteMany({
        where: {
          createdById: viewer.id,
          isLibrary: false,
        },
      });

      await tx.user.delete({
        where: { id: viewer.id },
      });
    });
  }

  await signOut({ redirectTo: "/" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
