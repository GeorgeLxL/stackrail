import { NextResponse } from "next/server";
import { isValidPhoneNumber } from "libphonenumber-js";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX = { name: 120, email: 200, phone: 40, message: 4000 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !phone || !message) {
    return NextResponse.json(
      { error: "Name, email, phone, and message are required." },
      { status: 400 }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (!isValidPhoneNumber(phone)) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }

  if (
    name.length > MAX.name ||
    email.length > MAX.email ||
    phone.length > MAX.phone ||
    message.length > MAX.message
  ) {
    return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("contacts").insert({
      name,
      email,
      phone: phone || null,
      message,
    });

    if (error) {
      console.error("Failed to insert contact:", error.message);
      return NextResponse.json(
        { error: "Could not save your message. Please try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { error: "Server is not configured to receive messages yet." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
