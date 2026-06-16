import bcrypt from "bcryptjs";
import { createAdminClient } from "./supabase/admin";

// Server-only credential check against the `users` table. Uses the
// service-role client (RLS-bypassing) and bcrypt — never import into the Edge
// middleware or a client component.

export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  if (!username || !password) return false;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("password_hash")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) return false;

  return bcrypt.compare(password, data.password_hash);
}
