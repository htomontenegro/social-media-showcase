import Link from "next/link";
import { auth } from "@/lib/auth";
import { REGISTRATION_ENABLED } from "@/lib/app-config";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-violet-400">Curate & embed</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-50">{APP_NAME}</h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">{APP_TAGLINE}</p>
      </div>
      <div className="mt-10 flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
        >
          Sign in
        </Link>
        {REGISTRATION_ENABLED ? (
          <Link
            href="/register"
            className="rounded-lg border border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            Register
          </Link>
        ) : null}
      </div>
    </div>
  );
}
