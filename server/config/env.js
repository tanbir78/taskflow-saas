
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  MONGODB_URI: z.string().min(1),
  DB_NAME: z.string().default('taskflow'),

  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),

  CLIENT_URL: z.string().url(),
  ADMIN_BOOTSTRAP_EMAIL: z.string().optional(),

  BILLING_ENABLED: z.enum(['true', 'false']).default('false'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  console.error(
    `\nMissing/invalid server configuration:\n${missing}\nCopy server/.env.example to server/.env and fill it in.\n`
  );

  process.exit(1);
}

export const env = {
  ...parsed.data,
  FIREBASE_PRIVATE_KEY: parsed.data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};
