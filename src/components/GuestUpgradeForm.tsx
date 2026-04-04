"use client";

import { useFormState } from "react-dom";
import { upgradeGuestAccount } from "@/actions/auth";
import FormSubmitButton from "@/components/FormSubmitButton";

export default function GuestUpgradeForm({
  defaultName,
}: {
  defaultName: string;
}) {
  const [error, action] = useFormState(upgradeGuestAccount, undefined);

  return (
    <form
      action={action}
      className="rounded-[28px] border p-5 space-y-4"
      style={{ backgroundColor: "#111111", borderColor: "#1f1f1f" }}
    >
      <input type="hidden" name="redirectTo" value="/dashboard" />

      <div className="space-y-3">
        <div>
          <label
            htmlFor="guest-upgrade-name"
            className="text-[10px] uppercase tracking-[0.24em] text-[#666] block mb-2"
          >
            Name
          </label>
          <input
            id="guest-upgrade-name"
            type="text"
            name="name"
            required
            minLength={2}
            maxLength={40}
            autoComplete="name"
            defaultValue={defaultName}
            placeholder="Your name"
            className="w-full rounded-2xl border px-4 py-3 text-sm text-white placeholder-[#4d4d4d] focus:outline-none"
            style={{ backgroundColor: "#181818", borderColor: "#262626" }}
          />
        </div>

        <div>
          <label
            htmlFor="guest-upgrade-email"
            className="text-[10px] uppercase tracking-[0.24em] text-[#666] block mb-2"
          >
            Email
          </label>
          <input
            id="guest-upgrade-email"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border px-4 py-3 text-sm text-white placeholder-[#4d4d4d] focus:outline-none"
            style={{ backgroundColor: "#181818", borderColor: "#262626" }}
          />
        </div>

        <div>
          <label
            htmlFor="guest-upgrade-password"
            className="text-[10px] uppercase tracking-[0.24em] text-[#666] block mb-2"
          >
            Password
          </label>
          <input
            id="guest-upgrade-password"
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="w-full rounded-2xl border px-4 py-3 text-sm text-white placeholder-[#4d4d4d] focus:outline-none"
            style={{ backgroundColor: "#181818", borderColor: "#262626" }}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <FormSubmitButton
        label="Create Account and Save Data"
        pendingLabel="Saving Guest Session..."
        className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
        style={{ backgroundColor: "#c8ff00" }}
      />
    </form>
  );
}
