import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@better-auth-ui/react'

import { assets } from '../assets/assets'
import { UserAvatar } from '@/components/user-avatar'
import { authClient } from '@/lib/auth-client'
import api from '@/configs/axios'
import { toast } from 'sonner'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false)
  const profileMenuRef = React.useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()
  const { viewPaths } = useAuth()
  const [credits, setCredits] = useState(0)


  const { data: session } = authClient.useSession()

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current) return
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    if (!session?.user) {
      return
    }

    let isMounted = true

    api
      .get<{ credits: number }>('/api/user/credits')
      .then(({ data }) => {
        if (isMounted) {
          setCredits(data.credits)
        }
      })
      .catch((error: unknown) => {
        const message =
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof error.response === 'object' &&
          error.response !== null &&
          'data' in error.response &&
          typeof error.response.data === 'object' &&
          error.response.data !== null &&
          'message' in error.response.data &&
          typeof error.response.data.message === 'string'
            ? error.response.data.message
            : error instanceof Error
              ? error.message
              : 'Failed to load credits'

        toast.error(message)
        console.log(error)
      })

    return () => {
      isMounted = false
    }
  }, [session?.user])

  return (
    <header className="relative">
      <nav className="fixed inset-x-0 top-0 z-50 flex w-full items-center justify-between border-b border-transparent bg-transparent px-4 py-4 text-white backdrop-blur-sm md:px-16 lg:px-24 xl:px-32">
        <Link to="/" className="flex items-center gap-3 rounded-full transition hover:opacity-90">
          <span className="flex h-10 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 shadow-lg shadow-black/10 backdrop-blur-sm sm:h-18 sm:w-44">
            <img
              src={assets.logo}
              alt="logo"
              className="h-30 w-30 rounded-xl object-contain"
            />
          </span>
        </Link>

        <div className="hidden items-center gap-8 transition duration-500 md:flex">
          <Link to="/">Home</Link>
          <Link to="/projects">My Projects</Link>
          <Link to="/community">Community</Link>
          <Link to="/pricing">Pricing</Link>
        </div>

        <div className="flex items-center gap-3">
          {!session?.user ? (
            <>
              <button
                className="rounded-md bg-indigo-600 px-6 py-2 transition active:scale-95 hover:bg-indigo-700"
                onClick={() => navigate(`/auth/${viewPaths.auth.signIn}`)}
              >
                Get started
              </button>
              <button
                id="open-menu"
                className="transition active:scale-90 md:hidden"
                title="Open menu"
                onClick={() => setMenuOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 5h16" />
                  <path d="M4 12h16" />
                  <path d="M4 19h16" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm">
                Credits: <span className="text-indigo-300">{credits}</span>
              </button>
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="rounded-full border border-white/10 bg-white/5 p-1.5 transition hover:bg-white/10"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  title="Open profile menu"
                >
                  <UserAvatar />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 z-[120] min-w-40 rounded-xl border border-white/10 bg-slate-950/95 p-1 text-sm shadow-xl backdrop-blur">
                    <button
                      className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/10"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        navigate('/settings')
                      }}
                    >
                      Profile
                    </button>
                    <button
                      className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/10"
                      onClick={() => {
                        setProfileMenuOpen(false)
                        navigate(`/auth/${viewPaths.auth.signOut}`)
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
              <button
                id="open-menu"
                className="transition active:scale-90 md:hidden"
                title="Open menu"
                onClick={() => setMenuOpen(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 5h16" />
                  <path d="M4 12h16" />
                  <path d="M4 19h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </nav>

      <div aria-hidden="true" className="h-[84px]" />

      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-black/60 text-lg text-white backdrop-blur transition-transform duration-300 md:hidden">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/projects" onClick={() => setMenuOpen(false)}>
            My Projects
          </Link>
          <Link to="/community" onClick={() => setMenuOpen(false)}>
            Community
          </Link>
          <Link to="/pricing" onClick={() => setMenuOpen(false)}>
            Pricing
          </Link>

          {session?.user ? (
            <Link to="/settings" onClick={() => setMenuOpen(false)}>
              Profile
            </Link>
          ) : (
            <Link
              to={`/auth/${viewPaths.auth.signIn}`}
              onClick={() => setMenuOpen(false)}
            >
              Sign in
            </Link>
          )}

          <button
            className="flex size-10 items-center justify-center rounded-md bg-slate-100 p-1 text-black transition hover:bg-slate-200 active:ring-4 active:ring-white"
            title="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      )}

      <img
        src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/hero/bg-gradient-2.png"
        className="absolute inset-0 -z-10 size-full opacity-10"
        alt=""
      />
    </header>
  )
}

export default Navbar
