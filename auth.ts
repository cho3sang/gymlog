import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash || user.isGuest) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.email ?? "GymLog User",
          email: user.email,
          isGuest: user.isGuest,
        };
      },
    }),
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize() {
        const guest = await prisma.user.create({
          data: {
            name: "Guest User",
            isGuest: true,
          },
        });

        return {
          id: guest.id,
          name: guest.name ?? "Guest User",
          email: guest.email,
          isGuest: true,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.isGuest = Boolean(user.isGuest);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.isGuest = Boolean(token.isGuest);
      }

      return session;
    },
  },
});
