import Link from "next/link";
import { redirect } from "next/navigation";
import GuestUpgradeForm from "@/components/GuestUpgradeForm";
import { getCurrentViewer } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function GuestUpgradePage() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    redirect("/");
  }

  if (!viewer.isGuest) {
    redirect("/dashboard");
  }

  const defaultName = viewer.name === "Guest User" ? "" : viewer.name ?? "";

  return (
    <main className="space-y-6">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-[#666]">
          Save Guest Data
        </p>
        <h1
          className="text-5xl leading-none text-white"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Create Your Account
        </h1>
        <p className="text-sm text-[#8a8a8a] max-w-sm">
          Turn this guest session into a real account so your workouts,
          progress, plans, and custom exercises stay saved.
        </p>
      </section>

      <GuestUpgradeForm defaultName={defaultName} />

      <Link
        href="/guest/exit"
        className="block text-center text-sm text-[#8a8a8a]"
      >
        Back to sign out warning
      </Link>
    </main>
  );
}
