import React from 'react'

const Footer = () => {
  return (
    <footer className="mx-auto mt-8 max-w-7xl px-4 pb-8 sm:px-6 sm:pb-10">
      <div className="overflow-hidden rounded-2xl border border-cyan-900/35 bg-gradient-to-br from-[#0a1220] via-[#0a111b] to-[#060b14] shadow-[inset_0_0_0_1px_rgba(14,116,144,0.14)]">
        <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <h3 className="text-3xl font-bold tracking-tight text-white">
              Buildify
            </h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              From prompt to website — instantly.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://github.com/Nipun1a"
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-cyan-900/50 bg-[#0a1422] px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-500/60 hover:text-cyan-200"
              >
                GitHub
              </a>
              <a
                href="www.linkedin.com/in/nipun-pal-450805294"
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-cyan-900/50 bg-[#0a1422] px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-500/60 hover:text-cyan-200"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-white">Project Info</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>[1] Build the Website </li>
              <li>[2] Do the Real Time changes</li>
              <li>[3] Download it </li>
              
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold text-white">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                Developer: <span className="text-white">Nipun</span>
              </li>
              <li>
                Email:{' '}
                <a href="mailto:nipun7abc@gmail.com" className="text-cyan-400 transition hover:text-cyan-300">
                  nipun7abc@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold text-white">Legal</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="transition hover:text-slate-200">Privacy Policy</li>
              <li className="transition hover:text-slate-200">Terms of Service</li>
              <li className="transition hover:text-slate-200">Cookie Policy</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-cyan-950/60 px-6 py-5 text-xs text-slate-400 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 Buildify. Made by Nipun.</p>
          
        </div>
      </div>
    </footer>
  )
}

export default Footer
