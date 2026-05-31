import type { FormEvent } from 'react'
import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import api from '@/configs/axios'
import { authClient } from '@/lib/auth-client'

const Home = () => {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (loading) {
      return
    }

    if (!session?.user) {
      toast.error('Please sign in to create a project')
      return
    }

    const initialPrompt = input.trim()

    if (!initialPrompt) {
      toast.error('Please enter a message')
      return
    }

    try {
      setLoading(true)

      const { data } = await api.post<{ projectId: string }>('/api/user/project', {
        initial_prompt: initialPrompt
      })

      navigate(`/projects/${data.projectId}`)
    } catch (error: unknown) {
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
            : 'Failed to create project'

      toast.error(message)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-col items-center text-white text-sm pb-20 px-4 font-poppins">
      <a href="/" className="flex items-center gap-2 border border-slate-700 rounded-full p-1 pr-3 text-sm mt-20">
        <span className="bg-indigo-600 text-xs px-3 py-1 rounded-full">NEW</span>
        <p className="flex items-center gap-2">
          <span>Free credits Start building today</span>
          <svg className="mt-px" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="m1 1 4 3.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </p>
      </a>

      <h1 className="text-center text-[40px] leading-[48px] md:text-6xl md:leading-[70px] mt-4 font-semibold max-w-3xl">
        Turn thoughts into Websites instantly, with AI.
      </h1>

      <p className="text-center text-base max-w-md mt-2">
        Create, customize and publish website faster than ever with intelligent design powered by AI.
      </p>

      <form onSubmit={onSubmitHandler} className="bg-white/10 max-w-2xl w-full rounded-xl p-4 mt-10 border border-indigo-600/70 focus-within:ring-2 ring-indigo-500 transition-all">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent outline-none text-gray-300 resize-none w-full"
          rows={4}
          placeholder="Describe your presentation in details"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="ml-auto flex items-center gap-2 bg-gradient-to-r from-[#CB52D4] to-indigo-600 rounded-md px-4 py-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {!loading ? 'Create with AI' : (
            <>
              Creating <Loader2Icon className="animate-spin size-4 text-white" />
            </>
          )}
        </button>
      </form>
    </section>
  )
}

export default Home
