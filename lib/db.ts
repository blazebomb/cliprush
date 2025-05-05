import mongoose from "mongoose";

// Get the MongoDB connection URI from environment variables, ! indicates that this variable should not be null or undefined
const MONGOdB_URI = process.env.MONGODB_URI!;

// Ensure that the MongoDB URI is defined, otherwise throw an error
if (!MONGOdB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Access a globally cached connection (useful to prevent multiple connections in development)
let cached = global.mongoose;

// If there's no cached object on first load, initialize it
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  //  1. If a connection has already been established earlier, reuse it
  if (cached.conn) {
    return cached.conn;
  }

  //  2. If there's no promise in progress (i.e., we're not currently connecting), start a new connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Do not queue operations before DB connects — fail early if not connected
      maxPoolSize: 10,       // Max number of simultaneous MongoDB connections in the pool
    };

    // Start connecting to the database and cache the promise
    cached.promise = mongoose
      .connect(MONGOdB_URI, opts) // Mongoose connects using the URI and options
      .then(() => mongoose.connection); // After connecting, return the underlying native connection
  }

  //  3. Await the connection promise and cache the resolved connection
  try {
    cached.conn = await cached.promise; // Wait for the connection to finish (or reuse if already done)
  } catch (error) {
    cached.promise = null; // Reset promise on failure so future calls can retry
    throw error;           // Throw the error up so you can handle/log it
  }

  //  4. Return the connected instance to be used for DB operations
  return cached.conn;
}
// la la l a l a lllllaaaaal ala la la la la la la la l l lal l la la lal la l lal la la la la