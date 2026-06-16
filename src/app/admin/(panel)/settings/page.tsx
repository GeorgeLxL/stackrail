import { getContactInfo, DEFAULT_CONTACT } from "@/lib/data";
import { updateContactInfo } from "../actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const contact = await getContactInfo();

  const field =
    "rounded-md border border-line/20 bg-surface/60 px-3 py-2 text-ink outline-none transition-colors focus:border-accent";

  return (
    <div>
      <h1 className="text-2xl font-medium">Contact info</h1>
      <p className="mt-1 text-sm text-muted">
        Shown in the landing page&apos;s contact section. Leave a field empty to fall
        back to the default.
      </p>

      <form
        action={updateContactInfo}
        className="mt-8 flex max-w-md flex-col gap-5 rounded-lg border border-line/15 bg-surface/30 p-6"
      >
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={contact.email}
            placeholder={DEFAULT_CONTACT.email}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="eyebrow">Telegram</span>
          <input
            name="telegram"
            type="text"
            defaultValue={contact.telegram}
            placeholder={DEFAULT_CONTACT.telegram}
            className={field}
          />
          <span className="text-xs text-muted">
            A handle (@name), username, or full URL.
          </span>
        </label>
        <button
          type="submit"
          className="self-start rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
