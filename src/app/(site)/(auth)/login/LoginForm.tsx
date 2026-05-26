"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { REGISTRATION_ENABLED } from "@/lib/app-config";
import { APP_NAME } from "@/lib/brand";
import { safeCallbackUrl } from "@/lib/safe-callback-url";

type Props = {
  googleAuthEnabled: boolean;
  compact?: boolean;
};

export function LoginForm({ googleAuthEnabled, compact = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  const inputClass = compact
    ? "mt-1 w-full rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
    : "mt-1 w-full rounded-md border px-3 py-2 text-sm";

  const form = (
    <form onSubmit={onSubmit} className={compact ? "space-y-3" : "mt-6 space-y-4"}>
      <div>
        <label className="block text-sm font-medium text-zinc-200">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-200">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        className={
          compact
            ? "w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500"
            : "w-full rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500"
        }
      >
        Sign in
      </button>
    </form>
  );

  if (compact) {
    return (
      <div>
        {form}
        {googleAuthEnabled ? (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="mt-2 w-full rounded-md border border-zinc-600 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            Continue with Google
          </button>
        ) : null}
        {REGISTRATION_ENABLED ? (
          <p className="mt-3 text-center text-xs text-zinc-400">
            No account?{" "}
            <Link href="/register" className="font-medium text-zinc-100 underline hover:text-white">
              Register
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wider text-violet-400">{APP_NAME}</p>
        <h1 className="mt-2 text-xl font-bold text-zinc-50">Sign in</h1>
        {form}
        {googleAuthEnabled ? (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="mt-3 w-full rounded-md border border-zinc-600 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            Continue with Google
          </button>
        ) : null}
        {REGISTRATION_ENABLED ? (
          <p className="mt-4 text-center text-sm text-zinc-400">
            No account?{" "}
            <Link href="/register" className="font-medium text-zinc-100 underline hover:text-white">
              Register
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}
