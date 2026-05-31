import { Loader2Icon } from 'lucide-react'
import { useEffect } from 'react'

const Loading = () => {
    useEffect(() =>{
        const timeoutId = window.setTimeout(() => {
            window.location.href = '/'

        },6000)
        return () => window.clearTimeout(timeoutId)
    },[])

  return (
    <div className='h-screen flex flex-col'>
        <div className='flex items-center justify-center flex-1'>
            <Loader2Icon className='size-7 animate-spin text-indigo-200' />
        </div>
      
    </div>
  )
}
export default Loading
