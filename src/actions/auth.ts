"use server";

import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
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

export async function logout() {
  await signOut({ redirectTo: "/" });
}
