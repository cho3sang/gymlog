import type { NextAuthConfig } from "next-auth";

const PROTECTED_PATHS = [
  "/dashboard",
  "/guest",
  "/log",
  "/plans",
  "/history",
  "/progress",
];

export const authConfig = {
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = PROTECTED_PATHS.some(
        (path) =>
          nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`)
      );

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      if (isLoggedIn && nextUrl.pathname === "/") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
