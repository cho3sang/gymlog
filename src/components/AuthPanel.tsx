"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import {
  authenticate,
  continueAsGuest,
  registerAccount,
} from "@/actions/auth";
import FormSubmitButton from "@/components/FormSubmitButton";

export default function AuthPanel() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginError, loginAction] = useFormState(authenticate, undefined);
  const [signupError, signupAction] = useFormState(registerAccount, undefined);
  const [guestError, guestAction] = useFormState(continueAsGuest, undefined);

  return (
    <div className="space-y-4">
      <div
        className="rounded-[28px] border p-2"
        style={{ backgroundColor: "#111111", borderColor: "#1f1f1f" }}
      >
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className="rounded-2xl px-4 py-3 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: mode === "login" ? "#c8ff00" : "#171717",
              color: mode === "login" ? "#0d0d0d" : "#f0f0f0",
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="rounded-2xl px-4 py-3 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: mode === "signup" ? "#c8ff00" : "#171717",
              color: mode === "signup" ? "#0d0d0d" : "#f0f0f0",
            }}
          >
            Create Account
          </button>
        </div>
      </div>

      {mode === "login" ? (
        <form
          action={loginAction}
          className="rounded-[28px] border p-5 space-y-4"
          style={{ backgroundColor: "#111111", borderColor: "#1f1f1f" }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#666]">
              Welcome Back
            </p>
            <h2
              className="text-4xl leading-none text-white mt-2"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Log In
            </h2>
          </div>

          <input type="hidden" name="redirectTo" value={callbackUrl} />

          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.24em] text-[#666] block mb-2">
                Email
              </label>
              <input
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
              <label className="text-[10px] uppercase tracking-[0.24em] text-[#666] block mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete="current-password"
                placeholder="At least 8 characters"
                className="w-full rounded-2xl border px-4 py-3 text-sm text-white placeholder-[#4d4d4d] focus:outline-none"
                style={{ backgroundColor: "#181818", borderColor: "#262626" }}
              />
            </div>
          </div>

          {loginError && <p className="text-sm text-red-400">{loginError}</p>}

          <FormSubmitButton
            label="Enter GymLog"
            pendingLabel="Logging In..."
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
            style={{ backgroundColor: "#c8ff00" }}
          />
        </form>
      ) : (
        <form
          action={signupAction}
          className="rounded-[28px] border p-5 space-y-4"
          style={{ backgroundColor: "#111111", borderColor: "#1f1f1f" }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#666]">
              New Here
            </p>
            <h2
              className="text-4xl leading-none text-white mt-2"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              Create Account
            </h2>
          </div>

          <input type="hidden" name="redirectTo" value={callbackUrl} />

          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-[0.24em] text-[#666] block mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={40}
                autoComplete="name"
                placeholder="Your name"
                className="w-full rounded-2xl border px-4 py-3 text-sm text-white placeholder-[#4d4d4d] focus:outline-none"
                style={{ backgroundColor: "#181818", borderColor: "#262626" }}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.24em] text-[#666] block mb-2">
                Email
              </label>
              <input
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
              <label className="text-[10px] uppercase tracking-[0.24em] text-[#666] block mb-2">
                Password
              </label>
              <input
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

          {signupError && <p className="text-sm text-red-400">{signupError}</p>}

          <FormSubmitButton
            label="Create and Continue"
            pendingLabel="Creating Account..."
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-black disabled:opacity-60"
            style={{ backgroundColor: "#c8ff00" }}
          />
        </form>
      )}

      <form
        action={guestAction}
        className="rounded-[28px] border p-5 space-y-3"
        style={{ backgroundColor: "#111111", borderColor: "#1f1f1f" }}
      >
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#666]">
            Guest Mode
          </p>
          <p className="text-sm text-[#777] mt-2">
            Jump straight into the app without an account. Good for demos and
            trying the flow quickly.
          </p>
        </div>

        {guestError && <p className="text-sm text-red-400">{guestError}</p>}

        <FormSubmitButton
          label="Continue as Guest"
          pendingLabel="Starting Guest Session..."
          className="w-full rounded-2xl px-4 py-3 text-sm font-semibold border disabled:opacity-60"
          style={{
            borderColor: "#2e2e2e",
            color: "#c8ff00",
            backgroundColor: "#151515",
          }}
        />
      </form>
    </div>
  );
}
