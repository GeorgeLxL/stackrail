import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import type { Contact } from "@/lib/types";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Middleware guards this route, but verify again as defense in depth.
  const session = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/admin/login");
  }

  let contacts: Contact[] = [];
  let loadError: string | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    contacts = (data ?? []) as Contact[];
  } catch {
    loadError =
      "Could not load messages. Check the Supabase environment variables and that the contacts table exists.";
  }

  return (
    <main className="mx-auto max-w-page px-6 py-12 md:px-12">
      <div className="flex items-center justify-between border-b border-line/12 pb-6">
        <div>
          <p className="font-mono text-sm tracking-[0.16em] text-ink">STACKRAIL</p>
          <h1 className="mt-1 text-2xl font-medium">Contact messages</h1>
          <p className="mt-1 text-sm text-muted">
            {contacts.length} {contacts.length === 1 ? "message" : "messages"} · signed in as {String(session.sub)}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border border-line/25 px-5 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Sign out
          </button>
        </form>
      </div>

      {loadError ? (
        <p className="mt-10 rounded-md border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500">
          {loadError}
        </p>
      ) : contacts.length === 0 ? (
        <p className="mt-10 text-muted">No messages yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {contacts.map((c) => (
            <li key={c.id} className="rounded-lg border border-line/15 bg-surface/40 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-medium text-ink">{c.name}</h2>
                <time className="font-mono text-xs text-muted">
                  {new Date(c.created_at).toLocaleString()}
                </time>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <a href={`mailto:${c.email}`} className="text-accent hover:underline">
                  {c.email}
                </a>
                {c.phone && <span className="text-muted">{c.phone}</span>}
              </div>
              <p className="mt-4 whitespace-pre-wrap text-ink/90">{c.message}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
