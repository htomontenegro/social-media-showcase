import { isGoogleAuthEnabled } from "@/lib/auth-providers";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return <LoginForm googleAuthEnabled={isGoogleAuthEnabled()} />;
}
