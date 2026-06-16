"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

// Defense in depth — middleware already guards /admin, but mutations re-check.
async function requireSession() {
  const session = await verifySessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");
}

export async function addTeamMember(formData: FormData) {
  await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const sort_order = Number(formData.get("sort_order") ?? 0) || 0;

  if (!name || !role) return;

  const supabase = createAdminClient();
  await supabase.from("team_members").insert({
    name,
    role,
    bio: bio || null,
    sort_order,
  });

  revalidatePath("/admin/team");
  revalidatePath("/");
}

export async function deleteTeamMember(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createAdminClient();
  await supabase.from("team_members").delete().eq("id", id);

  revalidatePath("/admin/team");
  revalidatePath("/");
}

export async function updateContactInfo(formData: FormData) {
  await requireSession();
  const email = String(formData.get("email") ?? "").trim();
  const telegram = String(formData.get("telegram") ?? "").trim();

  const supabase = createAdminClient();
  await supabase.from("site_settings").upsert(
    {
      id: 1,
      contact_email: email || null,
      contact_telegram: telegram || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function deleteMessage(formData: FormData) {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = createAdminClient();
  await supabase.from("contacts").delete().eq("id", id);

  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
