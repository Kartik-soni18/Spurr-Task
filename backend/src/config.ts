export interface Config {
  PORT: number;
  LLM_API_KEY: string;
  LLM_MODEL: string;
  LLM_BASE_URL: string | undefined;
  MAX_TOKENS: number;
  DB_PATH: string;
  NODE_ENV: "development" | "production";
  FRONTEND_URL: string;
  REDIS_URL: string | undefined;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return undefined as unknown as string;
  }
  return value;
}

function getIntEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    console.error(`Invalid integer value for ${key}: "${value}"`);
    process.exit(1);
  }
  return parsed;
}

export const config: Config = {
  PORT: getIntEnvVar("PORT", 3001),
  LLM_API_KEY: getEnvVar("OPENAI_API_KEY"),
  LLM_MODEL: getEnvVar("OPENAI_MODEL", "gpt-4o-mini"),
  LLM_BASE_URL: getEnvVar("OPENAI_BASE_URL", "") || undefined,
  MAX_TOKENS: getIntEnvVar("MAX_TOKENS", 500),
  DB_PATH: getEnvVar("DB_PATH", "./chat.db"),
  NODE_ENV: (getEnvVar("NODE_ENV", "development") as "development" | "production") === "production" ? "production" : "development",
  FRONTEND_URL: getEnvVar("FRONTEND_URL", "*"),
  REDIS_URL: getEnvVar("REDIS_URL", "") || undefined,
};

if (!config.LLM_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY is required.");
  process.exit(1);
}
