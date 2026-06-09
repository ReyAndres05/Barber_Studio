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
        const adminExists = await prisma.users.findUnique({
          where: { email: adminEmail },
        });

        if (!adminExists) {
          const defaultAdminPassword = await bcrypt.hash("Admin123*", 10);
          await prisma.users.create({
            data: {
              name: "Administrador Principal",
              email: adminEmail,
              password: defaultAdminPassword,
              role: "admin",
              phone: "1234567890",
              needspasswordchange: true,
            },
          });
        }

        const user = await prisma.users.findUnique({
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
          needspasswordchange: user.needspasswordchange,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.needspasswordchange = user.needspasswordchange;
      } else if (token?.id) {
        const dbUser = await prisma.users.findUnique({
          where: { id: token.id as string },
          select: { needspasswordchange: true },
        });
        if (dbUser) {
          token.needspasswordchange = dbUser.needspasswordchange;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.needspasswordchange = token.needspasswordchange as boolean;
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
