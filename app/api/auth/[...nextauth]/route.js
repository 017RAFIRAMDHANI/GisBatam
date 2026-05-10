import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "../../../lib/db";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        nama_lengkap: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const namaLengkap = credentials?.nama_lengkap?.trim();
        const password = credentials?.password;

        if (!namaLengkap || !password) {
          return null;
        }

        const result = await pool.query(
          `
          SELECT id, nama_lengkap, email, password_hash, is_active
          FROM users
          WHERE LOWER(nama_lengkap) = LOWER($1)
             OR LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [namaLengkap]
        );

        const user = result.rows[0];

        if (!user) {
          return null;
        }

        if (user.is_active === false) {
          return null;
        }

        if (!user.password_hash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
          return null;
        }

        return {
          id: String(user.id),
          name: user.nama_lengkap,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nama_lengkap = user.nama_lengkap;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.nama_lengkap = token.nama_lengkap;
      }

      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
    updateAge: 0,
  },

  jwt: {
    maxAge: 60 * 60,
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };