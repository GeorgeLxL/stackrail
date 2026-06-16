import { createAdminClient } from "./supabase/admin";
import type { Contact, ContactInfo, TeamMember } from "./types";

// Built-in fallbacks used when settings are unset or Supabase is unreachable.
export const DEFAULT_CONTACT: ContactInfo = {
  email: "hello@strantadigital.com",
  telegram: "@strantadigital",
};

export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as TeamMember[];
  } catch {
    return [];
  }
}

export async function getContactInfo(): Promise<ContactInfo> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("contact_email, contact_telegram")
      .eq("id", 1)
      .maybeSingle();
    return {
      email: data?.contact_email?.trim() || DEFAULT_CONTACT.email,
      telegram: data?.contact_telegram?.trim() || DEFAULT_CONTACT.telegram,
    };
  } catch {
    return DEFAULT_CONTACT;
  }
}

export async function getMessages(): Promise<Contact[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Contact[];
}

export async function getCounts(): Promise<{ messages: number; team: number }> {
  try {
    const supabase = createAdminClient();
    const [messages, team] = await Promise.all([
      supabase.from("contacts").select("*", { count: "exact", head: true }),
      supabase.from("team_members").select("*", { count: "exact", head: true }),
    ]);
    return { messages: messages.count ?? 0, team: team.count ?? 0 };
  } catch {
    return { messages: 0, team: 0 };
  }
}

// Build a Telegram URL from a stored handle ("@name", "name", or a full URL).
export function telegramHref(value: string): string {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return `https://t.me/${v.replace(/^@/, "")}`;
}
