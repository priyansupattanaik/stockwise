import { z } from 'zod';

const ApiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/stockwise?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  MARKET_DATA_PROVIDER: z.enum(['mock', 'stooq', 'alphavantage', 'finnhub']).default('mock'),
  MARKET_DATA_API_KEY: z.string().default(''),
  LLM_PROVIDER: z.enum(['deterministic', 'openai', 'anthropic']).default('deterministic'),
  LLM_API_KEY: z.string().default(''),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function loadEnv(overrideEnv: Record<string, string | undefined> = process.env): ApiEnv {
  const result = ApiEnvSchema.safeParse(overrideEnv);
  if (!result.success) {
    const formatted = result.error.format();
    const missing = Object.keys(formatted).filter((k) => k !== '_errors');
    throw new Error(
      `[FATAL] Missing or invalid API environment variables: ${missing.join(', ')}\nDetails: ${JSON.stringify(
        formatted,
        null,
        2
      )}`
    );
  }
  return result.data;
}

export const env = loadEnv();
