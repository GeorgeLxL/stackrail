// Seeds the single admin user. Run with: npm run seed
// Reads env from .env.local (via `node --env-file`).
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Create .env.local from .env.local.example before seeding."
  );
  process.exit(1);
}

// The one admin account — read from .env.local (seed-time only, never needed
// by the running app or in production).
const USERNAME = process.env.ADMIN_USERNAME;
const PASSWORD = process.env.ADMIN_PASSWORD;

if (!USERNAME || !PASSWORD) {
  console.error(
    "Missing ADMIN_USERNAME or ADMIN_PASSWORD in .env.local.\n" +
      "Add them (see .env.local.example) before seeding."
  );
  process.exit(1);
}

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const password_hash = await bcrypt.hash(PASSWORD, 10);

const { error } = await supabase
  .from("users")
  .upsert({ username: USERNAME, password_hash }, { onConflict: "username" });

if (error) {
  console.error("Seed failed:", error.message);
  console.error(
    "Make sure you ran supabase/schema.sql so the `users` table exists."
  );
  process.exit(1);
}

console.log(`✓ Seeded admin user "${USERNAME}". You can now sign in at /admin.`);
