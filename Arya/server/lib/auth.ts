import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from './prisma.js';
import { getTrustedOrigins, normalizeOrigin } from "./origins.js";

const baseURL = process.env.BETTER_AUTH_URL
  ? normalizeOrigin(process.env.BETTER_AUTH_URL)
  : undefined;

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
     //...other options
  emailAndPassword: { 
    enabled: true, 
    sendResetPassword: async ({ user, url }) => {
      // Dev fallback: log reset link. Replace with real email sender in prod.
      console.log(`[Better Auth] Reset password link for ${user.email}: ${url}`);
    }
  }, 
  user:{
    deleteUser: { enabled: true },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({
        user,
        newEmail,
        url
      }: {
        user: { email: string };
        newEmail: string;
        url: string;
      }) => {
        // Dev fallback: log change-email verification link.
        console.log(
          `[Better Auth] Change email verification for ${user.email} -> ${newEmail}: ${url}`
        );
      }
    }
  },
  /*socialProviders: { 
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID as string, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    },
  },*/ 
  trustedOrigins: getTrustedOrigins(),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET!,
  advanced:{
    cookies:{
        session_token:{
            name: 'auth_session',
            attributes:{
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                path: '/',
            }
        }
    }
  }
});
