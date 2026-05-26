"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-sm text-zinc-400 hover:text-zinc-100"
    >
      Sign out
    </button>
  );
}
