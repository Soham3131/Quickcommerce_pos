/**
 * Avani Grocers — Production Environment Configuration Manager
 * Centralizes environment variable extraction, type conversion, and production security rules.
 */

export type AppDataMode = 'demo' | 'database';

export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  APP_ENV: 'development' | 'test' | 'staging' | 'production';
  APP_DATA_MODE: AppDataMode;
  APP_URL: string;
  DEMO_MODE: boolean;
  ALLOW_IN_MEMORY_FALLBACK: boolean;
  MONGODB_URI: string;
  MONGODB_DB_NAME: string;
  AUTH_SECRET: string;
  NEXTAUTH_URL: string;
  SESSION_MAX_AGE_SECONDS: number;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  EMAIL_PROVIDER: string;
  EMAIL_FROM: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

const nodeEnv = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
const isProd = nodeEnv === 'production';
const appDataMode: AppDataMode =
  process.env.APP_DATA_MODE === 'demo' || process.env.NEXT_PUBLIC_APP_DATA_MODE === 'demo'
    ? 'demo'
    : 'database';

export const isDemoMode = (): boolean => {
  return (
    process.env.APP_DATA_MODE === 'demo' ||
    process.env.NEXT_PUBLIC_APP_DATA_MODE === 'demo'
  );
};

export const env: EnvConfig = {
  NODE_ENV: nodeEnv,
  APP_ENV: (process.env.APP_ENV as 'development' | 'test' | 'staging' | 'production') || (isProd ? 'production' : 'development'),
  APP_DATA_MODE: appDataMode,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  // In production, DEMO_MODE is FALSE by default unless explicitly set to 'true'
  DEMO_MODE: process.env.DEMO_MODE !== undefined ? process.env.DEMO_MODE === 'true' : !isProd,
  // In-memory fallback is strictly FORBIDDEN in production unless running in explicit demo mode
  ALLOW_IN_MEMORY_FALLBACK: isProd ? appDataMode === 'demo' : (process.env.ALLOW_IN_MEMORY_FALLBACK !== 'false'),
  MONGODB_URI: process.env.MONGODB_URI || '',
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'avani_grocers',
  AUTH_SECRET: process.env.AUTH_SECRET || (isProd && appDataMode !== 'demo' ? '' : 'avani_demo_secret_jwt_key_phase_6_vercel_32chars'),
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  SESSION_MAX_AGE_SECONDS: parseInt(process.env.SESSION_MAX_AGE_SECONDS || '604800', 10), // 7 days
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || 'smtp',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Avani Grocers <orders@avanigrocers.com>',
  LOG_LEVEL: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || (isProd ? 'info' : 'debug'),
};

/**
 * Validate that MongoDB URI is present and formatted properly.
 */
export const isMongoDBConfigured = (): boolean => {
  return Boolean(env.MONGODB_URI && (env.MONGODB_URI.startsWith('mongodb://') || env.MONGODB_URI.startsWith('mongodb+srv://')));
};

/**
 * Validate Razorpay credentials presence.
 */
export const isRazorpayConfigured = (): boolean => {
  return Boolean(
    env.RAZORPAY_KEY_ID &&
    env.RAZORPAY_KEY_SECRET &&
    !env.RAZORPAY_KEY_ID.includes('YourTestKeyId')
  );
};

/**
 * Validate Cloudinary credentials presence.
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET &&
    !env.CLOUDINARY_CLOUD_NAME.includes('your_cloud_name')
  );
};

/**
 * Perform startup validation.
 * Throws explicit errors in production if required configurations are absent.
 */
export function validateProductionConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // In explicit demo mode (APP_DATA_MODE=demo), MongoDB Atlas and external integrations are intentionally bypassed.
  if (isDemoMode()) {
    return {
      isValid: true,
      errors: [],
    };
  }

  // Normal database mode: require MONGODB_URI and AUTH_SECRET in production
  if (env.NODE_ENV === 'production') {
    if (!isMongoDBConfigured()) {
      errors.push('MONGODB_URI is required in production environment.');
    }
    if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
      errors.push('AUTH_SECRET must be at least 32 characters long in production.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
