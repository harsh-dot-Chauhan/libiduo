import { z } from "zod";

const optStr = (schema = z.string().min(1)) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),

  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  UPSTASH_REDIS_REST_URL: z.preprocess((v) => (v === "" ? undefined : v), z.string().url().optional()),
  UPSTASH_REDIS_REST_TOKEN: optStr(),

  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: optStr(),
  CLOUDINARY_API_KEY: optStr(),
  CLOUDINARY_API_SECRET: optStr(),

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optStr(),
  STRIPE_SECRET_KEY: optStr(),
  STRIPE_WEBHOOK_SECRET: optStr(),

  RESEND_API_KEY: optStr(),
  FROM_EMAIL: z.preprocess((v) => (v === "" ? undefined : v), z.string().email().optional()),
});

export const env =
  process.env.SKIP_ENV_VALIDATION
    ? (process.env as unknown as z.infer<typeof envSchema>)
    : envSchema.parse(process.env);
