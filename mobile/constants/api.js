function resolveApiBase() {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (raw) {
    const base = raw.replace(/\/$/, "");
    return base.endsWith("/api") ? base : `${base}/api`;
  }
  return "http://localhost:5001/api";
}

// Local: default localhost. Production device: set EXPO_PUBLIC_API_URL in mobile/.env to your Railway URL (https://… .railway.app).
export const API_URL = resolveApiBase();
