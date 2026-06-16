"use client";

import { useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { ThemeToggle } from "./ThemeToggle";
import type { ContactInfo, TeamMember } from "@/lib/types";

/* ---- design constants (ported verbatim from the original) ---- */
const m = "var(--font-serif), 'Playfair Display', Georgia, serif";
const a = "var(--font-sans), 'DM Sans', system-ui, sans-serif";
const s = "var(--font-mono), 'JetBrains Mono', monospace";
const l = "#c9a84c";
const g = "rgba(201, 168, 76, 0.13)";
const x = "rgba(201, 168, 76, 0.35)";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

// Centered max-width wrapper. Sections own their horizontal padding.
const WRAP = "mx-auto w-full max-w-[1200px]";

// Build a Telegram URL from a handle ("@name"), username, or full URL.
function tgHref(value: string) {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return `https://t.me/${v.replace(/^@/, "")}`;
}

/* ---- Brand mark — stacked-rail monogram with gold gradient ---- */
function BrandMark({ size, id }: { size: number; id: string }) {
  return (
    <svg
      className="transition-[transform,filter] duration-300 group-hover:translate-x-px group-hover:[filter:drop-shadow(0_0_7px_rgba(201,168,76,0.55))]"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efd793" />
          <stop offset="1" stopColor="#b4901f" />
        </linearGradient>
      </defs>
      <rect x="3" y="6" width="26" height="4.2" rx="2.1" fill={`url(#${id})`} />
      <rect x="8" y="13.9" width="21" height="4.2" rx="2.1" fill={`url(#${id})`} opacity="0.62" />
      <rect x="13" y="21.8" width="16" height="4.2" rx="2.1" fill={`url(#${id})`} opacity="0.36" />
    </svg>
  );
}

/* ---- Brand lockup (mark + two-tone wordmark) ---- */
function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const icon = size === "lg" ? 30 : 23;
  return (
    <span
      className={`group inline-flex items-center ${size === "lg" ? "gap-[0.7rem]" : "gap-[0.6rem]"}`}
    >
      <BrandMark size={icon} id={`brand-${size}`} />
      <span
        className={`font-mono font-semibold leading-none whitespace-nowrap ${
          size === "lg" ? "text-[1.05rem] tracking-[0.18em]" : "text-[0.74rem] tracking-[0.12em]"
        }`}
      >
        <span className="text-ink">STRANTA</span>
        <span className="text-accent transition-[text-shadow] duration-300 group-hover:[text-shadow:0_0_14px_rgba(201,168,76,0.55)]">
          DIGITAL
        </span>
      </span>
    </span>
  );
}

/* ---- Giant faint section number (editorial watermark) ---- */
function SectionNumber({ n, color }: { n: string; color?: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-4 right-3 select-none text-[7rem] font-bold leading-none md:right-10 md:text-[15rem]"
      style={{ fontFamily: m, color: color ?? "var(--watermark)" }}
    >
      {n}
    </span>
  );
}

/* ---- Divider (f) ---- */
function Divider({
  vertical = false,
  className = "",
}: {
  vertical?: boolean;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: `linear-gradient(${vertical ? "to bottom" : "to right"}, transparent, ${l}, transparent)`,
        [vertical ? "width" : "height"]: "1px",
        [vertical ? "height" : "width"]: "100%",
        opacity: 0.5,
      }}
    />
  );
}

/* ---- Eyebrow label (u) ---- */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: s,
        fontSize: "0.62rem",
        letterSpacing: "0.18em",
        color: l,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

/* ---- Button (v) ---- */
function Btn({
  children,
  onClick,
  filled = false,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  filled?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const [i, c] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => c(true)}
      onMouseLeave={() => c(false)}
      style={{
        fontFamily: s,
        fontSize: "0.7rem",
        letterSpacing: "0.16em",
        padding: "0.875rem 2.25rem",
        border: `1px solid ${l}`,
        backgroundColor: filled ? (i ? "transparent" : l) : i ? l : "transparent",
        color: filled ? (i ? l : "#08080a") : i ? "#08080a" : l,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "all 0.2s ease",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
}

/* ---- Header (F) — with section links + theme toggle added ---- */
const NAV: [string, string][] = [
  ["context", "Context"],
  ["team", "Who we are"],
  ["looking-for", "What we're looking for"],
  ["bring", "What we bring"],
  ["collaboration", "How it works"],
  ["why", "Why"],
];

function Header({ onContact, hasTeam }: { onContact: () => void; hasTeam: boolean }) {
  const [n, o] = useState(false);
  useEffect(() => {
    const i = () => o(window.scrollY > 40);
    window.addEventListener("scroll", i);
    return () => window.removeEventListener("scroll", i);
  }, []);

  const nav: [string, string][] = hasTeam
    ? [...NAV.slice(0, 2), ["about", "About"], ...NAV.slice(2)]
    : NAV;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: n ? "var(--header-bg)" : "transparent",
        borderBottom: n ? `1px solid ${g}` : "1px solid transparent",
        backdropFilter: n ? "blur(12px)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div className="px-5 md:px-12">
        <div className={`${WRAP} flex h-16 items-center justify-between gap-4`}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="StrantaDigital — back to top"
          className="flex shrink-0 cursor-pointer items-center border-0 bg-transparent p-0"
        >
          <Logo size="sm" />
        </button>

        <nav className="hidden lg:flex" style={{ alignItems: "center", gap: "1.75rem" }}>
          {nav.map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollToId(id)}
              style={{
                fontFamily: s,
                fontSize: "0.62rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = l)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 sm:gap-3.5">
          <Btn onClick={onContact}>Contact</Btn>
          <ThemeToggle />
        </div>
        </div>
      </div>
    </header>
  );
}

/* ---- Hero (W) — team-size references removed ---- */
function Hero({ onContact, onLearnMore }: { onContact: () => void; onLearnMore: () => void }) {
  const stats = [
    { n: "1", label: "coordinated team" },
    { n: "∞", label: "long-term focus" },
  ];
  return (
    <section
      className="relative flex min-h-screen flex-col justify-end overflow-hidden px-5 pb-20 md:px-12 md:pb-24"
    >
      <div className="absolute left-5 right-5 top-[30%] md:left-12 md:right-12">
        <Divider />
      </div>
      <div className={`relative ${WRAP}`}>
        <div style={{ marginBottom: "2rem" }}>
          <Label>— Open for partnership</Label>
        </div>
        <h1
          style={{
            fontFamily: m,
            fontSize: "clamp(2.25rem, 6vw, 5.25rem)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--foreground)",
            maxWidth: "780px",
            marginBottom: "2.5rem",
          }}
        >
          We&apos;re looking for a US-based partner to build with us.
        </h1>
        <div className="mb-14 flex flex-wrap items-start gap-8 md:gap-16">
          <p style={{ fontFamily: a, fontSize: "1.0625rem", lineHeight: 1.85, color: "var(--muted-foreground)", maxWidth: "440px", margin: 0 }}>
            A dedicated engineering team — backend, frontend, infrastructure — operating as one unit. Not a freelance pool. Not an agency. A collective looking for the right person to grow with us in the US market.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: "200px" }}>
            {stats.map((st) => (
              <div key={st.label} style={{ display: "flex", alignItems: "baseline", gap: "0.875rem" }}>
                <span style={{ fontFamily: m, fontSize: "1.75rem", color: l, lineHeight: 1 }}>{st.n}</span>
                <span style={{ fontFamily: s, fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--muted-foreground)" }}>
                  {st.label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Btn onClick={onContact} filled>
            Let&apos;s talk
          </Btn>
          <Btn onClick={onLearnMore}>Learn how we work</Btn>
        </div>
      </div>
      <div className="absolute bottom-10 left-5 right-5 flex items-center justify-between md:left-12 md:right-12">
        <Divider className="flex-1" />
        <span style={{ fontFamily: s, fontSize: "0.58rem", letterSpacing: "0.2em", color: "var(--muted-foreground)", marginLeft: "1.5rem" }}>
          SCROLL
        </span>
      </div>
    </section>
  );
}

/* ---- 01 Context (k) ---- */
function Context() {
  return (
    <section id="context" className="relative overflow-hidden px-5 md:px-12">
      <SectionNumber n="01" />
      <Divider />
      <div
        className={`${WRAP} grid grid-cols-1 items-center gap-10 py-20 md:grid-cols-[1fr_2.5fr] md:gap-20 md:py-28`}
      >
        <div>
          <Label>01 — Context</Label>
          <div style={{ marginTop: "2rem", width: "1px", height: "80px", background: `linear-gradient(to bottom, ${l}, transparent)` }} />
        </div>
        <div>
          <p style={{ fontFamily: m, fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.55, color: "var(--foreground)", marginBottom: "2rem" }}>
            &ldquo;We already function as a complete engineering team. What we don&apos;t have is a strong presence in the US market.&rdquo;
          </p>
          <p style={{ fontFamily: a, fontSize: "1rem", lineHeight: 1.85, color: "var(--muted-foreground)", maxWidth: "520px" }}>
            We&apos;re not looking to be hired. We&apos;re looking for someone who can work alongside us — to bridge business gaps, navigate the market, and grow together long-term.
          </p>
        </div>
      </div>
      <Divider />
    </section>
  );
}

/* ---- 02 Who we are (z) — heading edited ---- */
function WhoWeAre() {
  const cards = [
    { id: "01", title: "System Design", desc: "Architecture for scale from the first line." },
    { id: "02", title: "Backend Systems", desc: "Production-grade, maintained, reliable." },
    { id: "03", title: "API Development", desc: "Clean contracts, internal and external." },
    { id: "04", title: "Cloud Infrastructure", desc: "We own the stack end to end." },
    { id: "05", title: "Long-term Maintenance", desc: "We stay. We don't disappear after launch." },
  ];
  return (
    <section id="team" className="relative overflow-hidden px-5 py-16 md:px-12 md:py-28">
      <SectionNumber n="02" />
      <div className={WRAP}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <Label>02 — Who we are</Label>
            <h2 style={{ fontFamily: m, fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 400, lineHeight: 1.2, color: "var(--foreground)", marginTop: "1.25rem", maxWidth: "480px" }}>
              One unit.
              <br />
              Not contractors.
            </h2>
          </div>
          <p style={{ fontFamily: a, fontSize: "1rem", lineHeight: 1.85, color: "var(--muted-foreground)", maxWidth: "380px" }}>
            We&apos;ve worked together long enough to move as one. Same codebase standards, same communication rhythm, same expectations about quality.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-px lg:grid-cols-5" style={{ backgroundColor: g }}>
          {cards.map((c) => (
            <Card key={c.id} id={c.id} title={c.title} desc={c.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- card (E) ---- */
function Card({ id, title, desc }: { id: string; title: string; desc: string }) {
  const [i, c] = useState(false);
  return (
    <div
      onMouseEnter={() => c(true)}
      onMouseLeave={() => c(false)}
      style={{ backgroundColor: i ? g : "var(--card)", padding: "2.25rem 2rem", transition: "background-color 0.2s ease", cursor: "default" }}
    >
      <div style={{ fontFamily: s, fontSize: "0.6rem", color: l, letterSpacing: "0.14em", marginBottom: "1.5rem" }}>{id}</div>
      <div style={{ fontFamily: m, fontSize: "1.125rem", color: "var(--foreground)", marginBottom: "0.875rem", lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontFamily: a, fontSize: "0.875rem", color: "var(--muted-foreground)", lineHeight: 1.7 }}>{desc}</div>
      <div style={{ marginTop: "1.5rem", width: i ? "32px" : "16px", height: "1px", backgroundColor: l, transition: "width 0.2s ease" }} />
    </div>
  );
}

/* ---- About us / Team (shown only when members exist) ---- */
function AboutUs({ team }: { team: TeamMember[] }) {
  if (!team.length) return null;
  return (
    <section id="about" className="px-5 py-16 md:px-12 md:py-28">
      <div className={WRAP}>
        <Label>— Our team</Label>
        <h2 style={{ fontFamily: m, fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 400, lineHeight: 1.2, color: "var(--foreground)", marginTop: "1.25rem", maxWidth: "640px" }}>
          The people behind the work.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <div key={member.id} style={{ borderTop: `1px solid ${g}`, paddingTop: "1.5rem" }}>
              <div style={{ fontFamily: m, fontSize: "1.25rem", color: "var(--foreground)", lineHeight: 1.25 }}>{member.name}</div>
              <div style={{ fontFamily: s, fontSize: "0.6rem", letterSpacing: "0.14em", color: l, textTransform: "uppercase", marginTop: "0.45rem" }}>{member.role}</div>
              {member.bio && (
                <p style={{ fontFamily: a, fontSize: "0.9rem", color: "var(--muted-foreground)", lineHeight: 1.7, marginTop: "0.9rem" }}>{member.bio}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- 03 What we're looking for (T) ---- */
function LookingFor() {
  const r = [
    "Work with us in the US market context",
    "Bridge communication and business coordination gaps",
    "Join stakeholder and client conversations when needed",
    "Help align opportunities with what we can build",
    "Grow alongside us — long-term, not transactional",
  ];
  return (
    <section id="looking-for" className="px-5 md:px-12">
      <div
        className={`${WRAP} relative overflow-hidden px-6 py-12 md:px-20 md:py-24`}
        style={{ backgroundColor: l }}
      >
        <SectionNumber n="03" color="rgba(8,8,10,0.07)" />
        <div className="relative grid grid-cols-1 items-start gap-10 md:grid-cols-[1fr_1.8fr] md:gap-20">
          <div>
            <span style={{ fontFamily: s, fontSize: "0.62rem", letterSpacing: "0.18em", color: "rgba(8,8,10,0.5)", display: "block", marginBottom: "1.5rem" }}>
              03 — WHAT WE&apos;RE LOOKING FOR
            </span>
            <h2 style={{ fontFamily: m, fontSize: "clamp(1.75rem, 3vw, 2.75rem)", fontWeight: 400, lineHeight: 1.2, color: "#08080a" }}>
              A partner,
              <br />
              not a vendor.
            </h2>
            <p style={{ fontFamily: a, fontSize: "0.9375rem", lineHeight: 1.8, color: "rgba(8,8,10,0.65)", marginTop: "1.5rem", maxWidth: "280px" }}>
              This is a collaboration. Not a job offer.
            </p>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
            {r.map((n, o) => (
              <li key={o} style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem", padding: "1.5rem 0", borderBottom: o < r.length - 1 ? "1px solid rgba(8,8,10,0.12)" : "none" }}>
                <span style={{ fontFamily: s, fontSize: "0.58rem", color: "rgba(8,8,10,0.45)", minWidth: "1.5rem", paddingTop: "0.2rem", letterSpacing: "0.1em" }}>
                  {String(o + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: a, fontSize: "1rem", color: "#08080a", lineHeight: 1.65 }}>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---- 04 What we bring (_) — table team-size value removed ---- */
function WhatWeBring() {
  const rows = [
    { label: "Team composition", value: "Senior, cross-functional" },
    { label: "Specializations", value: "Backend, frontend, infrastructure" },
    { label: "Delivery speed", value: "Fast cycles, no handoff friction" },
    { label: "Scale", value: "Adjusts to project size" },
    { label: "Execution model", value: "Fully internal, single unit" },
  ];
  return (
    <section id="bring" className="relative overflow-hidden px-5 py-16 md:px-12 md:py-28">
      <SectionNumber n="04" />
      <div className={`${WRAP} grid grid-cols-1 gap-10 md:grid-cols-[1fr_2fr] md:gap-20`}>
        <div>
          <Label>04 — What we bring</Label>
          <h2 style={{ fontFamily: m, fontSize: "clamp(1.75rem, 3vw, 2.75rem)", fontWeight: 400, lineHeight: 1.2, color: "var(--foreground)", marginTop: "1.25rem" }}>
            Complete
            <br />
            engineering
            <br />
            capacity.
          </h2>
        </div>
        <div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${g}` }}>
                  <td style={{ padding: "1.5rem 1rem 1.5rem 0", fontFamily: s, fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--muted-foreground)", width: "45%", verticalAlign: "top" }}>
                    {row.label.toUpperCase()}
                  </td>
                  <td style={{ padding: "1.5rem 0", fontFamily: a, fontSize: "1rem", color: "var(--foreground)" }}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---- 05 How collaboration works (L) ---- */
function Collaboration() {
  const cols = [
    { heading: "You", sub: "Business collaboration", lines: ["US market presence", "External communication", "Opportunity alignment", "Client-facing coordination"] },
    { heading: "Together", sub: "Shared decisions", lines: ["Project direction", "Client scope", "Growth strategy", "Long-term planning"] },
    { heading: "We", sub: "Engineering execution", lines: ["System architecture", "All development", "Infrastructure", "Ongoing maintenance"] },
  ];
  return (
    <section id="collaboration" className="relative overflow-hidden px-5 pb-16 md:px-12 md:pb-28">
      <SectionNumber n="05" />
      <Divider />
      <div className={`${WRAP} pt-20 md:pt-28`}>
        <div style={{ marginBottom: "4rem" }}>
          <Label>05 — How collaboration works</Label>
        </div>
        <div className="grid grid-cols-1 gap-px sm:grid-cols-3" style={{ backgroundColor: g }}>
          {cols.map((col) => (
            <CollabCol key={col.heading} heading={col.heading} sub={col.sub} lines={col.lines} />
          ))}
        </div>
        <div style={{ marginTop: "3rem", maxWidth: "560px" }}>
          <p style={{ fontFamily: a, fontSize: "1rem", lineHeight: 1.85, color: "var(--muted-foreground)" }}>
            We don&apos;t have a fixed structure yet — we prefer to define it together with the right person. Simple, direct, and built around trust.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---- collab column (B) ---- */
function CollabCol({ heading, sub, lines }: { heading: string; sub: string; lines: string[] }) {
  const i = heading === "Together";
  return (
    <div style={{ backgroundColor: i ? g : "var(--card)", padding: "3rem 2.5rem" }}>
      <div style={{ marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: m, fontSize: "2rem", fontWeight: 400, color: i ? l : "var(--foreground)" }}>{heading}</span>
      </div>
      <div style={{ fontFamily: s, fontSize: "0.58rem", letterSpacing: "0.14em", color: l, marginBottom: "2rem", opacity: i ? 1 : 0.7 }}>
        {sub.toUpperCase()}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
        {lines.map((c, d) => (
          <li key={d} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "4px", height: "4px", backgroundColor: l, opacity: i ? 1 : 0.4, flexShrink: 0 }} />
            <span style={{ fontFamily: a, fontSize: "0.875rem", color: "var(--muted-foreground)", lineHeight: 1.5 }}>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- 06 Why this matters (I) ---- */
function Why() {
  return (
    <section id="why" className="relative overflow-hidden px-5 pb-16 md:px-12 md:pb-28">
      <SectionNumber n="06" />
      <div
        className={`${WRAP} grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_2fr] md:gap-20`}
      >
        <div>
          <Label>06 — Why this matters</Label>
          <div style={{ marginTop: "2rem", width: "1px", height: "80px", background: `linear-gradient(to bottom, ${l}, transparent)` }} />
        </div>
        <div>
          <p style={{ fontFamily: m, fontSize: "clamp(1.2rem, 2.2vw, 1.75rem)", fontStyle: "italic", lineHeight: 1.65, color: "var(--foreground)", marginBottom: "2rem" }}>
            &ldquo;We are trying to enter the US market as a long-term engineering group — not as freelancers, not as contractors. Strong products come from stable collaboration, not fragmented outsourcing.&rdquo;
          </p>
          <p style={{ fontFamily: a, fontSize: "0.9375rem", lineHeight: 1.85, color: "var(--muted-foreground)" }}>
            That&apos;s why we&apos;re looking for the right partner — not just opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---- 07 Contact (H) — phone added + wired to Supabase ---- */
function Contact({ contact }: { contact: ContactInfo }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.phone || !isValidPhoneNumber(form.phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const contactLinks = [
    { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { label: "Telegram", value: contact.telegram, href: tgHref(contact.telegram) },
  ];

  return (
    <section id="contact" className="relative overflow-hidden px-5 md:px-12">
      <SectionNumber n="07" />
      <Divider />
      <div
        className={`${WRAP} grid grid-cols-1 items-start gap-12 py-20 md:grid-cols-[1fr_1.5fr] md:gap-24 md:py-28`}
      >
        <div>
          <Label>07 — Start a conversation</Label>
          <h2 style={{ fontFamily: m, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, lineHeight: 1.15, color: "var(--foreground)", marginTop: "1.5rem", marginBottom: "2rem" }}>
            If this sounds
            <br />
            like you, let&apos;s
            <br />
            talk.
          </h2>
          <p style={{ fontFamily: a, fontSize: "0.9375rem", lineHeight: 1.85, color: "var(--muted-foreground)", marginBottom: "3rem", maxWidth: "320px" }}>
            No pressure. No formal process. Just an honest conversation about fit.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {contactLinks.map((c) => (
              <a key={c.label} href={c.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <span style={{ fontFamily: s, fontSize: "0.58rem", letterSpacing: "0.16em", color: l }}>{c.label.toUpperCase()}</span>
                <span style={{ fontFamily: a, fontSize: "0.9375rem", color: "var(--foreground)", borderBottom: `1px solid ${g}`, paddingBottom: "0.25rem", wordBreak: "break-word" }}>{c.value}</span>
              </a>
            ))}
          </div>
        </div>

        {submitted ? (
          <div style={{ border: `1px solid ${g}`, padding: "3rem", alignSelf: "center" }}>
            <div style={{ fontFamily: s, fontSize: "0.62rem", letterSpacing: "0.14em", color: l, marginBottom: "1rem" }}>MESSAGE RECEIVED</div>
            <p style={{ fontFamily: a, fontSize: "1rem", color: "var(--muted-foreground)", lineHeight: 1.7 }}>We&apos;ll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Field id="name" label="Name" type="text" value={form.name} onChange={(b) => setForm((p) => ({ ...p, name: b }))} />
            <Field id="email" label="Email" type="email" value={form.email} onChange={(b) => setForm((p) => ({ ...p, email: b }))} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="phone" style={{ fontFamily: s, fontSize: "0.6rem", letterSpacing: "0.14em", color: l }}>PHONE</label>
              <PhoneInput
                id="phone"
                international
                defaultCountry="US"
                value={form.phone || undefined}
                onChange={(v) => setForm((p) => ({ ...p, phone: v ?? "" }))}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontFamily: s, fontSize: "0.6rem", letterSpacing: "0.14em", color: l }}>MESSAGE</label>
              <Area value={form.message} onChange={(d) => setForm((p) => ({ ...p, message: d }))} />
            </div>
            {error && <span style={{ fontFamily: a, fontSize: "0.85rem", color: "#e26d6d" }}>{error}</span>}
            <div style={{ paddingTop: "0.5rem" }}>
              <Btn type="submit" filled disabled={submitting}>
                {submitting ? "Sending…" : "Send message"}
              </Btn>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

/* ---- input (O) ---- */
function Field({
  id,
  label,
  type,
  value,
  onChange,
  required = true,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [d, p] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <label htmlFor={id} style={{ fontFamily: s, fontSize: "0.6rem", letterSpacing: "0.14em", color: l }}>
        {label.toUpperCase()}
        {!required && <span style={{ color: "var(--muted-foreground)" }}> (optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(y) => onChange(y.target.value)}
        onFocus={() => p(true)}
        onBlur={() => p(false)}
        style={{
          width: "100%",
          background: "transparent",
          border: `1px solid ${d ? x : g}`,
          padding: "0.875rem 1rem",
          color: "var(--foreground)",
          fontFamily: a,
          fontSize: "0.9375rem",
          outline: "none",
          transition: "border-color 0.15s",
        }}
      />
    </div>
  );
}

/* ---- textarea (D) ---- */
function Area({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [o, i] = useState(false);
  return (
    <textarea
      required
      rows={5}
      value={value}
      onChange={(c) => onChange(c.target.value)}
      onFocus={() => i(true)}
      onBlur={() => i(false)}
      style={{
        width: "100%",
        background: "transparent",
        border: `1px solid ${o ? x : g}`,
        padding: "0.875rem 1rem",
        color: "var(--foreground)",
        fontFamily: a,
        fontSize: "0.9375rem",
        outline: "none",
        resize: "none",
        transition: "border-color 0.15s",
      }}
    />
  );
}

/* ---- Footer (R) — team-size text removed ---- */
function Footer() {
  return (
    <footer className="px-5 md:px-12">
      <Divider />
      <div className={`${WRAP} flex flex-wrap items-center justify-between gap-4 py-10`}>
        <div className="flex items-center gap-[0.85rem]">
          <Logo size="lg" />
          <span className="pt-2 font-mono text-[0.58rem] tracking-[0.14em] text-muted">— 2026</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "5px", height: "5px", backgroundColor: l }} />
          <span style={{ fontFamily: s, fontSize: "0.58rem", letterSpacing: "0.14em", color: l }}>ONE TEAM. ONE UNIT.</span>
        </div>
      </div>
    </footer>
  );
}

/* ---- App (A) ---- */
export function Landing({ team, contact }: { team: TeamMember[]; contact: ContactInfo }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", color: "var(--foreground)", fontFamily: a }}>
      <Header onContact={() => scrollToId("contact")} hasTeam={team.length > 0} />
      <Hero onContact={() => scrollToId("contact")} onLearnMore={() => scrollToId("team")} />
      <Context />
      <WhoWeAre />
      <AboutUs team={team} />
      <LookingFor />
      <WhatWeBring />
      <Collaboration />
      <Why />
      <Contact contact={contact} />
      <Footer />
    </div>
  );
}
