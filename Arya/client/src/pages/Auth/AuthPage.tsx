import { useParams } from "react-router-dom"
import { Auth } from "@/components/auth"

export default function AuthPage() {
  const { pathname } = useParams()

  return (
    <main className="dark min-h-[calc(100vh-4rem)] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.25),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_24%),linear-gradient(180deg,_#050816_0%,_#080a13_58%,_#020203_100%)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-7xl items-center justify-center rounded-[2rem] border border-white/8 bg-white/[0.02] p-6 shadow-[0_32px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl md:p-10">
        <Auth
          path={pathname}
          className="w-full max-w-md border border-white/12 bg-slate-950/70 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/8 backdrop-blur-xl"
        />
      </div>
    </main>
  )
}
