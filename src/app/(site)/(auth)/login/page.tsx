import { isGoogleAuthEnabled } from "@/lib/auth-providers";
import { SEED_LOGIN_WIDGET_TOKEN } from "@/lib/seed-demo";
import { LoginShowcase } from "./LoginShowcase";

function embedBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ??
    process.env.CDN_BASE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export default function LoginPage() {
  return (
    <LoginShowcase
      widgetToken={SEED_LOGIN_WIDGET_TOKEN}
      embedBaseUrl={embedBaseUrl()}
      googleAuthEnabled={isGoogleAuthEnabled()}
    />
  );
}
