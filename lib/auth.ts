import { connectDB } from '@/lib/mongodb';
import User from '@/Models/user.Model';
import bcrypt from 'bcryptjs';
import { AccountStatus } from '@/Models/user.Model';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user) {
          throw new Error('Invalid credentials');
        }

        if (user.isAccountLocked()) {
          throw new Error('Account is locked. Please try again later');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          await user.incrementLoginAttempts();
          throw new Error('Invalid credentials');
        }

        if (!user.isEmailVerified) {
          throw new Error('Please verify your email before logging in');
        }

        if (user.accountStatus !== AccountStatus.ACTIVE) {
          throw new Error(`Account status: ${user.accountStatus}`);
        }

        user.failedLoginAttempts = 0;
        user.accountLockedUntil = undefined;
        user.lastLoginAt = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName,
          image: null,
          accountNumber: user.accountNumber,
          accountType: user.accountType,
          balance: user.balance,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.accountNumber = token.accountNumber as string;
        session.user.accountType = token.accountType as string;
        session.user.balance = token.balance as number;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accountNumber = user.accountNumber;
        token.accountType = user.accountType;
        token.balance = user.balance;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
