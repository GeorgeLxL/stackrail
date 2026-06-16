import Link from "next/link";
import { getCounts, getMessages } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const counts = await getCounts();
  let recent: Awaited<ReturnType<typeof getMessages>> = [];
  try {
    recent = (await getMessages()).slice(0, 5);
  } catch {
    recent = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-medium">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Overview of your site content.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Stat label="Contact messages" value={counts.messages} href="/admin/messages" />
        <Stat label="Team members" value={counts.team} href="/admin/team" />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent messages</h2>
          <Link href="/admin/messages" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted">No messages yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((c) => (
              <li
                key={c.id}
                className="flex items-baseline justify-between gap-4 rounded-lg border border-line/15 bg-surface/30 px-4 py-3"
              >
                <span className="truncate">
                  <span className="text-ink">{c.name}</span>{" "}
                  <span className="text-muted">— {c.message}</span>
                </span>
                <time className="shrink-0 font-mono text-xs text-muted">
                  {new Date(c.created_at).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-line/15 bg-surface/30 p-6 transition-colors hover:border-accent/40"
    >
      <div className="font-mono text-3xl text-accent">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </Link>
  );
}
