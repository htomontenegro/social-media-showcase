const REQUIRED_ENV = ["DATABASE_URL", "AUTH_SECRET"] as const;

export async function register() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
