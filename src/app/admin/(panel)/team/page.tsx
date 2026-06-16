import { getTeamMembers } from "@/lib/data";
import type { TeamMember } from "@/lib/types";
import { addTeamMember, deleteTeamMember } from "../actions";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  let members: TeamMember[] = [];
  let loadError: string | null = null;
  try {
    members = await getTeamMembers();
  } catch {
    loadError =
      "Could not load team members. Check the Supabase environment variables and that the team_members table exists.";
  }

  const field =
    "rounded-md border border-line/20 bg-surface/60 px-3 py-2 text-ink outline-none transition-colors focus:border-accent";

  return (
    <div>
      <h1 className="text-2xl font-medium">Team members</h1>
      <p className="mt-1 text-sm text-muted">
        When at least one member exists, an &ldquo;About us&rdquo; section appears on the
        landing page.
      </p>

      {/* Add form */}
      <form
        action={addTeamMember}
        className="mt-8 grid grid-cols-1 gap-4 rounded-lg border border-line/15 bg-surface/30 p-6 sm:grid-cols-2"
      >
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Name</span>
          <input name="name" type="text" required className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Role</span>
          <input name="role" type="text" required className={field} placeholder="e.g. Backend Engineer" />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="eyebrow">Bio (optional)</span>
          <textarea name="bio" rows={2} className={`${field} resize-none`} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Sort order</span>
          <input name="sort_order" type="number" defaultValue={members.length} className={field} />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Add member
          </button>
        </div>
      </form>

      {/* List */}
      {loadError ? (
        <p className="mt-8 rounded-md border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-500">
          {loadError}
        </p>
      ) : members.length === 0 ? (
        <p className="mt-8 text-muted">No team members yet.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-line/15 bg-surface/30 p-5"
            >
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-medium text-ink">{member.name}</span>
                  <span className="eyebrow">{member.role}</span>
                </div>
                {member.bio && <p className="mt-1.5 text-sm text-muted">{member.bio}</p>}
              </div>
              <form action={deleteTeamMember} className="shrink-0">
                <input type="hidden" name="id" value={member.id} />
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
