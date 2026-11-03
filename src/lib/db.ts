import mongoose from 'mongoose';
import { env, isMongoDBConfigured, isDemoMode } from './env';

/**
 * Global cache interface for Mongoose connection reuse in Next.js HMR.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  hasEventListeners: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null, hasEventListeners: false };
}

/**
 * Attach lifecycle listeners once to monitor Atlas connection state.
 */
function attachConnectionListeners() {
  if (cached!.hasEventListeners) return;

  mongoose.connection.on('connected', () => {
    console.log('[MongoDB Atlas] Active connection established.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB Atlas] Connection runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB Atlas] Connection disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB Atlas] Connection re-established.');
  });

  cached!.hasEventListeners = true;
}

/**
 * Connect to MongoDB Atlas with connection caching, pooling, and production safety.
 *
 * CRITICAL SAFETY REQUIREMENT:
 * In production (NODE_ENV === 'production'), if MONGODB_URI is missing or fails,
 * it will throw a fatal error. Silent in-memory fallback is strictly FORBIDDEN in production.
 */
export async function connectToDatabase(): Promise<typeof mongoose | null> {
  // Explicit Demo Mode: Completely bypass MongoDB connection
  if (isDemoMode()) {
    return null;
  }

  // Production Safety Guard (Normal database mode)
  if (env.NODE_ENV === 'production' && !isMongoDBConfigured()) {
    const errorMsg = '[FATAL] MONGODB_URI is not configured in production environment. In-memory database fallback is disabled.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!isMongoDBConfigured()) {
    if (env.ALLOW_IN_MEMORY_FALLBACK) {
      // In development/test mode only: explicit fallback permitted
      return null;
    } else {
      throw new Error('[Database] MongoDB is not configured and in-memory fallback is disabled.');
    }
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  attachConnectionListeners();

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 15,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
    };

    cached!.promise = mongoose
      .connect(env.MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('[MongoDB Atlas] Connection pool initialized successfully.');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('[MongoDB Atlas] Initial connection attempt failed:', err.message);
        cached!.promise = null;

        if (env.NODE_ENV === 'production') {
          throw new Error(`[FATAL] Failed to connect to MongoDB Atlas in production: ${err.message}`);
        }

        return null;
      }) as Promise<typeof mongoose>;
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e: any) {
    cached!.promise = null;
    console.error('[MongoDB Atlas] Connection resolution error:', e.message);

    if (env.NODE_ENV === 'production') {
      throw e;
    }

    return null;
  }

  return cached!.conn;
}

/**
 * Check if the active connection to MongoDB is healthy (1 = connected).
 */
export function isDatabaseConnected(): boolean {
  if (isDemoMode()) return false;
  return mongoose.connection.readyState === 1;
}

/**
 * Check if the connected MongoDB deployment supports multi-document transactions.
 * Transactions require a replica set or sharded cluster (standard on MongoDB Atlas).
 */
export async function supportsTransactions(): Promise<boolean> {
  if (!isDatabaseConnected()) return false;

  try {
    const adminDb = mongoose.connection.db?.admin();
    if (!adminDb) return false;

    const serverStatus = await adminDb.command({ serverStatus: 1 });
    // ReplSet present indicates replica set
    return Boolean(serverStatus.repl || serverStatus.sharding);
  } catch {
    // If permission to query serverStatus is restricted, attempt a dry session check
    try {
      const session = await mongoose.startSession();
      const hasRepl = Boolean(session.transaction);
      await session.endSession();
      return hasRepl;
    } catch {
      return false;
    }
  }
}

/**
 * Gracefully close the MongoDB connection (useful for testing and process shutdown).
 */
export async function disconnectDatabase(): Promise<void> {
  if (cached?.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('[MongoDB Atlas] Connection gracefully closed.');
  }
}
