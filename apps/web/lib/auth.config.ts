import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe Auth.js configuration.
// This must not import Node-only dependencies (bcryptjs, the Prisma adapter, etc.)
// because it is consumed by the middleware, which runs on the Edge Runtime.
// The Credentials provider (which needs bcryptjs) and the Prisma adapter are
// added on top of this in lib/auth.ts, used only in Node.js server contexts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/connexion",
    newUser: "/dashboard",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
