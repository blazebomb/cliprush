// Import types and providers needed for setting up authentication with NextAuth
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Import database connection and user model
import { connectToDatabase } from "./db";
import User from "../models/Users";
import bcrypt from "bcryptjs"; // Used to compare the hashed password

// This object defines all the options and logic for how authentication works
export const authOptions: NextAuthOptions = {
  // Define the authentication providers (we are using credentials here, i.e. email & password)
  providers: [
    CredentialsProvider({
      name: "Creadentials", // Display name of the provider (can be anything)

      // These fields will appear in the login form (handled by NextAuth automatically)
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      // This function runs when a user submits the login form
      async authorize(credentials) {
        // Check if email and password are provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing Email or Password");
        }

        try {
          // Connect to MongoDB
          await connectToDatabase();

          // Find a user with the given email in the database
          const user = await User.findOne({ email: credentials.email });

          // If no user is found, return an error
          if (!user) {
            throw new Error("No user found");
          }

          // Compare the provided password with the hashed password in the DB
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password // Make sure your field names match correctly (case-sensitive)
          );

          // If password doesn't match, throw an error
          if (!isValid) {
            throw new Error("Invalid Password");
          }

          // If everything is valid, return basic user info
          return {
            id: user._id.toString(),
            email: user.email,
          };
        } catch (error) {
          throw error; // Forward any errors
        }
      },
    }),
  ],

  // Callbacks allow customizing JWT tokens and sessions
  callbacks: {
    // This callback runs whenever a JWT token is created or updated
    async jwt({ token, user }) {
      // If a user just signed in, attach their ID to the token
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // This callback modifies the session object that the client receives
    async session({ session, token }) {
      // Add user ID from token to session so it's accessible on the client
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },

  // Customize the routes/pages used for authentication
  pages: {
    signIn: "/login",  // Page to show when sign-in is needed
    error: "/login",   // Redirect to login page on auth errors
  },

  // Define how session management works
  session: {
    strategy: "jwt",                // Use JWT-based sessions (no database sessions)
    maxAge: 30 * 24 * 60 * 60,      // Session validity: 30 days
  },

  // Secret key to encrypt the JWTs and sessions
  secret: process.env.NEXTAUTH_SECRET,
};

