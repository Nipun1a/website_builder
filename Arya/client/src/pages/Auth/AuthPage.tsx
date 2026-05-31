import { useParams } from "react-router-dom"
import { Auth } from "@/components/auth"
import logo from "@/assets/logo.png"

export default function AuthPage() {
  const { pathname } = useParams()

  return (
    <main className="dark min-h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.16),_transparent_24%),linear-gradient(180deg,_#02040a_0%,_#050816_60%,_#020203_100%)] px-4 py-6 text-white md:px-6 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-1 py-2">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Buildify logo"
            className="h-16 w-auto rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
          />
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-7xl items-center justify-center py-6 md:py-10">
        <Auth path={pathname} className="w-full" />
      </div>
    </main>
  )
}
