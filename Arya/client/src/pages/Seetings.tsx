import { AccountSettings  } from "@/components/account-settings"

export default function SettingsPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_35%),linear-gradient(180deg,_#050816_0%,_#080a13_100%)] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">
            Account
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Profile & Settings
          </h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            Update your name, avatar, and password details here. These controls
            are tied to the signed-in profile shown in the navbar.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6">
          <AccountSettings />
        </div>
      </div>
    </main>
  )
}
