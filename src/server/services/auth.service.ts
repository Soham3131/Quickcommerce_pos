import { connectToDatabase, isDatabaseConnected } from '@/lib/db';
import { UserModel, IUser } from '@/models/User';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signJwt, TokenPayload } from '@/lib/auth/jwt';
import { dataStore, StoredUser } from '../storage/dataStore';

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'cashier' | 'customer';
    avatar?: string;
    phone?: string;
    address?: string;
  };
  error?: string;
}

/**
 * Server-side login with password verification.
 */
export async function loginUser(email: string, passwordPlain: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  await connectToDatabase();

  let user: any = null;

  if (isDatabaseConnected()) {
    user = await UserModel.findOne({ email: normalizedEmail });
  } else {
    user = dataStore.users.get(normalizedEmail);
  }

  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  if (user.status === 'suspended') {
    return { success: false, error: 'Your account has been suspended. Please contact store management.' };
  }

  const isValidPassword = verifyPassword(passwordPlain, user.passwordHash);
  if (!isValidPassword) {
    return { success: false, error: 'Invalid email or password.' };
  }

  // Update last login
  const userId = user._id ? user._id.toString() : user.id;
  if (isDatabaseConnected()) {
    await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
  }

  const tokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
    userId,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const token = signJwt(tokenPayload);

  return {
    success: true,
    token,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
    },
  };
}

/**
 * Register a new customer securely.
 */
export async function registerCustomer(data: {
  name: string;
  email: string;
  phone: string;
  passwordPlain: string;
  address?: string;
}): Promise<AuthResult> {
  const normalizedEmail = data.email.trim().toLowerCase();

  await connectToDatabase();

  if (isDatabaseConnected()) {
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const passwordHash = hashPassword(data.passwordPlain);
    const newUser = await UserModel.create({
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
      passwordHash,
      role: 'customer',
      address: data.address || '',
      status: 'active',
      emailVerified: true,
    });

    const token = signJwt({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: 'customer',
      name: newUser.name,
    });

    return {
      success: true,
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: 'customer',
        phone: newUser.phone,
        address: newUser.address,
      },
    };
  } else {
    if (dataStore.users.has(normalizedEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const id = `cust-${Date.now()}`;
    const passwordHash = hashPassword(data.passwordPlain);
    const newUser: StoredUser = {
      id,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
      passwordHash,
      role: 'customer',
      address: data.address || '',
      status: 'active',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dataStore.users.set(normalizedEmail, newUser);

    const token = signJwt({
      userId: id,
      email: normalizedEmail,
      role: 'customer',
      name: newUser.name,
    });

    return {
      success: true,
      token,
      user: {
        id,
        name: newUser.name,
        email: newUser.email,
        role: 'customer',
        phone: newUser.phone,
        address: newUser.address,
      },
    };
  }
}

/**
 * Idempotently seed demo accounts (admin, cashier, customer) into MongoDB Atlas.
 */
export async function seedDemoAccountsServer(): Promise<void> {
  await connectToDatabase();
  if (!isDatabaseConnected()) return;

  const demoAccounts = [
    {
      name: 'Avani Admin',
      email: 'admin@avanigrocers.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Rohit Sharma (Cashier)',
      email: 'cashier@avanigrocers.com',
      password: 'User@123',
      role: 'cashier',
      phone: '+91 98765 12345',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Priya Sharma',
      email: 'customer@avanigrocers.com',
      password: 'Customer@123',
      role: 'customer',
      phone: '+91 98765 43210',
      address: 'Flat 402, Tower B, Palm Grove Heights, Golf Course Ext Road, Gurugram, 122018',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
  ];

  for (const acc of demoAccounts) {
    const existing = await UserModel.findOne({ email: acc.email });
    if (!existing) {
      await UserModel.create({
        name: acc.name,
        email: acc.email,
        passwordHash: hashPassword(acc.password),
        role: acc.role,
        phone: acc.phone,
        address: (acc as any).address,
        avatar: acc.avatar,
        status: 'active',
        emailVerified: true,
      });
      console.log(`[Auth Seeder] Created demo user: ${acc.email} (${acc.role})`);
    }
  }
}
