"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      Sign Out
    </button>
  );
}
