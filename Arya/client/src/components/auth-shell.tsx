import { Sparkles, ShieldCheck, Zap } from "lucide-react"
import type { ReactNode } from "react"

import logo from "@/assets/logo.png"
import { cn } from "@/lib/utils"

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  className
}: AuthShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_32px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl",
        className
      )}
    >
      <div className="grid min-h-[42rem] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.18),transparent_28%),linear-gradient(180deg,#050816_0%,#070b14_100%)] p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:28px_28px]" />

          

          <div className="relative max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Platform update v2.0
            </div>
            <h1 className="max-w-lg text-4xl font-semibold leading-tight text-white md:text-5xl">
              Build faster with AI-powered components.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 md:text-lg">
              Access a polished developer workspace with fast authentication,
              production-ready tooling, and a cleaner path into your projects.
            </p>

            <div className="mt-8 space-y-4 text-sm text-slate-200">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-sky-400/20 bg-sky-400/10 p-2 text-sky-200">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                Secure account access
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-sky-400/20 bg-sky-400/10 p-2 text-sky-200">
                  <Zap className="h-4 w-4" />
                </div>
                Fast onboarding flow
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-sky-400/20 bg-sky-400/10 p-2 text-sky-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                Clean interface for developers
              </div>
            </div>
          </div>

          <div className="relative text-xs text-slate-400">
            Streamlined for focused sign in and sign up flows.
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#06070d] px-5 py-8 sm:px-8 md:px-10">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#0b0d14]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <img
                src={logo}
                alt="Buildify logo"
                className="h-16 w-auto rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
              />
            </div>

            <div className="mb-8">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-emerald-300">
                {eyebrow}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {description}
              </p>
            </div>

            {children}

            {footer ? <div className="mt-8">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  )
}
