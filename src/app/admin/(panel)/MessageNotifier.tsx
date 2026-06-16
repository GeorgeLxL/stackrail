"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Contact } from "@/lib/types";

const POLL_MS = 12000;

// Watches for new contact messages: refreshes the admin UI (live list) and
// fires a desktop notification. Runs on every admin page (mounted in layout).
export function MessageNotifier() {
  const router = useRouter();
  const seen = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPerm("unsupported");
    } else {
      setPerm(Notification.permission);
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" });
      if (!res.ok) return;
      const { messages } = (await res.json()) as { messages: Contact[] };

      // First run establishes the baseline — don't notify for existing messages.
      if (!initialized.current) {
        messages.forEach((m) => seen.current.add(m.id));
        initialized.current = true;
        return;
      }

      const fresh = messages.filter((m) => !seen.current.has(m.id));
      if (fresh.length === 0) return;
      fresh.forEach((m) => seen.current.add(m.id));

      if ("Notification" in window && Notification.permission === "granted") {
        fresh.forEach((m) => {
          const note = new Notification("New contact message", {
            body: `${m.name}: ${m.message.slice(0, 120)}`,
            icon: "/favicon.ico",
            tag: m.id,
          });
          // Clicking the notification focuses THIS tab/window and opens Messages.
          note.onclick = () => {
            window.focus();
            router.push("/admin/messages");
            note.close();
          };
        });
      }

      // Refresh server components so the messages list / dashboard update live.
      router.refresh();
    } catch {
      // network hiccup — try again on the next tick
    }
  }, [router]);

  useEffect(() => {
    poll();
    const timer = setInterval(poll, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [poll]);

  async function enable() {
    if (!("Notification" in window)) return;
    setPerm(await Notification.requestPermission());
  }

  if (perm === "unsupported") return null;

  return (
    <div className="mt-6">
      {perm === "granted" ? (
        <p className="flex items-center gap-2 text-xs text-muted">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          Live · notifications on
        </p>
      ) : perm === "denied" ? (
        <p className="text-xs text-muted">
          Notifications blocked. Enable them for this site in your browser settings.
        </p>
      ) : (
        <button
          type="button"
          onClick={enable}
          className="w-full rounded-md border border-line/20 px-3 py-2 text-xs text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Enable desktop notifications
        </button>
      )}
    </div>
  );
}
