import { env } from '@/data/env/server';
import * as schema from '@/drizzle/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(env.DATABASE_URL, { schema });
