"use client";

import { useActionState } from "react";
import { Wordmark } from "@/site/chrome";
import { Button, Panel } from "@/ui";
import { login } from "../actions";

export default function AdminLogin() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="grid min-h-svh place-items-center px-5">
      <Panel className="w-full max-w-sm p-8">
        <Wordmark />
        <p className="mt-6 text-title">Admin sign in</p>
        <form action={action} className="mt-4 space-y-3">
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoFocus
            placeholder="Password"
            className="w-full rounded-field border border-line bg-surface px-3.5 py-3 text-[15px] outline-none focus:border-ink"
          />
          {state?.error && <p className="text-body text-[#8a1c1c]">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Panel>
    </main>
  );
}
