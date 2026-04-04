import Link from "next/link";
import { redirect } from "next/navigation";
import { discardGuestSession } from "@/actions/auth";
import { getCurrentViewer } from "@/lib/current-user";
import FormSubmitButton from "@/components/FormSubmitButton";

export const dynamic = "force-dynamic";

export default async function GuestExitPage() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/");
  }

  if (!viewer.isGuest) {
    redirect("/dashboard");
  }

  return (
    <main className="space-y-6">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-[#666]">
          Guest Warning
        </p>
        <h1
          className="text-5xl leading-none text-white"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Sign Out?
        </h1>
        <p className="text-sm text-[#8a8a8a] max-w-sm">
          If you sign out of this guest session, your guest workouts, plans,
          history, and custom exercises will be deleted.
        </p>
      </section>

      <section
        className="rounded-[32px] border p-5 space-y-4"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(200,255,0,0.08), transparent 45%), #111111",
          borderColor: "#1f1f1f",
        }}
      >
        <div className="rounded-2xl border px-4 py-4" style={{ borderColor: "#262626" }}>
          <p className="text-sm text-[#d7d7d7]">
            Keep this guest session if you want your progress to stay attached
            to an account.
          </p>
        </div>

        <Link
          href="/guest/upgrade"
          className="block w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold text-black"
          style={{ backgroundColor: "#c8ff00" }}
        >
          Save Data by Creating an Account
        </Link>

        <form action={discardGuestSession} className="space-y-3">
          <FormSubmitButton
            label="Exit Guest Session and Lose Data"
            pendingLabel="Removing Guest Session..."
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold border disabled:opacity-60"
            style={{
              borderColor: "#3a2323",
              color: "#ffb0b0",
              backgroundColor: "#171111",
            }}
          />
        </form>

        <Link
          href="/dashboard"
          className="block text-center text-sm text-[#8a8a8a]"
        >
          Go back to dashboard
        </Link>
      </section>
    </main>
  );
}
