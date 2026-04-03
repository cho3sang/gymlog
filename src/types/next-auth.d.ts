import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      isGuest: boolean;
    };
  }

  interface User {
    id: string;
    isGuest?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isGuest?: boolean;
  }
}
