import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'hospice-tracker-secret-key-change-in-production';

export interface User {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  role: string;
  created_at: string;
  preferences: Record<string, unknown>;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function registerUser(email: string, password: string, name?: string, company?: string): Promise<AuthResult> {
  try {
    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return { success: false, error: 'Email already registered' };
    }

    const passwordHash = await hashPassword(password);
    const result = await sql`
      INSERT INTO users (email, password_hash, name, company)
      VALUES (${email}, ${passwordHash}, ${name || null}, ${company || null})
      RETURNING id, email, name, company, role, created_at, preferences
    `;

    const user = result[0] as User;
    const token = generateToken(user.id);

    return { success: true, user, token };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await sql`
      SELECT id, email, name, company, role, created_at, preferences, password_hash
      FROM users WHERE email = ${email}
    `;

    if (result.length === 0) {
      return { success: false, error: 'Invalid credentials' };
    }

    const user = result[0];
    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Update last login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    const token = generateToken(user.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;

    return { success: true, user: safeUser as User, token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, company, role, created_at, preferences
      FROM users WHERE id = ${id}
    `;
    return result[0] as User || null;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: Request): Promise<User | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    // Try cookie
    const cookie = request.headers.get('cookie');
    const token = cookie?.match(/auth_token=([^;]+)/)?.[1];
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;
    return getUserById(payload.userId);
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) return null;

  return getUserById(payload.userId);
}

// API Key functions
export async function generateApiKey(userId: string, name: string): Promise<string | null> {
  try {
    const key = `ht_${crypto.randomUUID().replace(/-/g, '')}`;
    const keyHash = await hashPassword(key);

    await sql`
      INSERT INTO api_keys (user_id, key_hash, name)
      VALUES (${userId}, ${keyHash}, ${name})
    `;

    return key; // Return unhashed key only once
  } catch (error) {
    console.error('API key generation error:', error);
    return null;
  }
}

export async function validateApiKey(key: string): Promise<{ userId: string; permissions: Record<string, boolean> } | null> {
  try {
    // Get all active keys and check
    const keys = await sql`
      SELECT id, user_id, key_hash, permissions, rate_limit, requests_today, last_reset
      FROM api_keys WHERE active = true
    `;

    for (const k of keys) {
      const valid = await verifyPassword(key, k.key_hash);
      if (valid) {
        // Check rate limit
        const today = new Date().toISOString().split('T')[0];
        if (k.last_reset !== today) {
          await sql`UPDATE api_keys SET requests_today = 1, last_reset = ${today} WHERE id = ${k.id}`;
        } else if (k.requests_today >= k.rate_limit) {
          return null; // Rate limited
        } else {
          await sql`UPDATE api_keys SET requests_today = requests_today + 1, last_used = NOW() WHERE id = ${k.id}`;
        }

        return { userId: k.user_id, permissions: k.permissions || { read: true } };
      }
    }

    return null;
  } catch {
    return null;
  }
}
