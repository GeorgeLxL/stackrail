import { getMessages } from "@/lib/data";
import type { Contact } from "@/lib/types";
import { deleteMessage } from "../actions";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  let contacts: Contact[] = [];
  let loadError: string | null = null;
  try {
    contacts = await getMessages();
  } catch {
    loadError =
      "Could not load messages. Check the Supabase environment variables and that the contacts table exists.";
  }

  return (
    <div>
      <h1 className="text-2xl font-medium">Contact messages</h1>
      <p className="mt-1 text-sm text-muted">
        {contacts.length} {contacts.length === 1 ? "message" : "messages"}
      </p>

      {loadError ? (
        <p className="mt-8 rounded-md border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500">
          {loadError}
        </p>
      ) : contacts.length === 0 ? (
        <p className="mt-8 text-muted">No messages yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {contacts.map((c) => (
            <li key={c.id} className="rounded-lg border border-line/15 bg-surface/30 p-6">
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
              <form action={deleteMessage} className="mt-4">
                <input type="hidden" name="id" value={c.id} />
                <button
                  type="submit"
                  className="text-xs text-muted transition-colors hover:text-red-500"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
