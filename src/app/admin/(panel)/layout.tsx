import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";
import { logout } from "../actions";
import { SidebarNav } from "./SidebarNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-line/12 bg-surface/30 px-5 py-6 md:w-60 md:border-b-0 md:border-r">
        <p className="font-mono text-sm tracking-[0.16em] text-ink">STRANTADIGITAL</p>
        <p className="mt-0.5 mb-7 text-xs text-muted">Admin</p>

        <SidebarNav />

        <form action={logout} className="mt-8 md:mt-auto md:pt-8">
          <p className="mb-2 text-xs text-muted">
            Signed in as{" "}
            <span className="text-ink">{String(session.sub)}</span>
          </p>
          <button
            type="submit"
            className="w-full rounded-md border border-line/20 px-3 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="flex-1 px-5 py-10 md:px-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
