import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credenciales inválidas");
        }

        // Auto-creación del admin si no existe
        const adminEmail = "admin@barberstudio.com";
        const adminExists = await prisma.user.findUnique({
          where: { email: adminEmail },
        });

        if (!adminExists) {
          const defaultAdminPassword = await bcrypt.hash("Admin123*", 10);
          await prisma.user.create({
            data: {
              name: "Administrador Principal",
              email: adminEmail,
              password: defaultAdminPassword,
              role: "admin",
              phone: "1234567890",
              needsPasswordChange: true,
            },
          });
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Usuario no encontrado");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          needsPasswordChange: user.needsPasswordChange,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.needsPasswordChange = user.needsPasswordChange;
      } else if (token?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { needsPasswordChange: true },
        });
        if (dbUser) {
          token.needsPasswordChange = dbUser.needsPasswordChange;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.needsPasswordChange = token.needsPasswordChange as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};
