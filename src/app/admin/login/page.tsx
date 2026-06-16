"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login } from "../actions";

const initialState: { error?: string } = {};

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-sm tracking-[0.16em] text-ink">STACKRAIL</p>
        <h1 className="mt-2 text-2xl font-medium">Admin access</h1>
        <p className="mt-1 text-sm text-muted">Sign in to view contact messages.</p>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="eyebrow">Username</span>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              className="rounded-md border border-line/20 bg-surface/60 px-4 py-3 text-ink outline-none transition-colors focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="eyebrow">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border border-line/20 bg-surface/60 px-4 py-3 text-ink outline-none transition-colors focus:border-accent"
            />
          </label>

          {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

          <SubmitButton />
        </form>
      </div>
    </main>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 rounded-full bg-ink px-8 py-3 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
