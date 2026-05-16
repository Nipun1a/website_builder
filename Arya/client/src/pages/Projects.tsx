import { ArrowBigDownDashIcon, FullscreenIcon, LaptopIcon, Loader2Icon, MessageSquareIcon, SaveIcon, SmartphoneIcon, TabletIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { dummyConversations, dummyProjects } from '../assets/assets'
import logo from '../assets/logo.svg'
import type { Project } from '../types'

const Projects = () => {

  const {projectId} = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const [isGenerating, setIsGenerating] = useState(true)
  const [device, setDevice] = useState<'phone'|'tablet'|'desktop'>('desktop')

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fetchProject = async () => {
    const project = dummyProjects.find(project => project.id === projectId)
    setTimeout(() => {
      if(project){
        setProject({...project, converstion: dummyConversations})
        setLoading(false)
        setIsGenerating(project.current_code ? false : true)
      }
    }, 500)

  }

  useEffect(() => {
    fetchProject()
  }, [])

  if(loading){
    return (
      <>
      <div className="flex items-center justify-center h-screen">
      <Loader2Icon className="h-7 w-7  animate-spin text-indigo-200" />
      </div>
      </>
    )
  }
  


  return project ? (
    <div className='flex flex-col h-screen w-full bg-gray-900 text-white'>
      {/* builder navbar */}
      <div className='flex max-sm:flex-col sm:items-center justify-between gap-4 px-4 py-2 no-scroller'>
        {/*left*/}
        <div className='flex items-center gap-2 text-nowrap'>
          <img src="/logo.svg" alt="logo" className='h-6 cursor-pointer' onClick={() => navigate('/')} />
          <div>
            <p>{project.name}</p>
            <p className='text-xs text-gray-400 mt-0.5 truncate'>Previewing the last saved version</p>
          </div>
          <div className='sm:hidden flex-1 flex justify-end'>
            <MessageSquareIcon onClick={() => setIsMenuOpen(true)} className='size-6 cursor-pointer' />
          </div>
        </div>
        {/* middle */}
        <div className='hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md'>
          <SmartphoneIcon onClick={() => setDevice('phone')} className={`size-6 p-1 rounded cursor-pointer ${device === 'phone' ? 'bg-grey-700' : ''}`} />
          <TabletIcon onClick={() => setDevice('tablet')} className={`size-6 p-1 rounded cursor-pointer ${device === 'tablet' ? 'bg-grey-700' : ''}`} />
          <LaptopIcon onClick={() => setDevice('desktop')} className={`size-6 p-1 rounded cursor-pointer ${device === 'desktop' ? 'bg-grey-700' : ''}`} />
        </div>
        {/*right*/}
        <div className='flex items-center justify-end gap-3 text-xs sm:text-sm'>
          <button disabled={isSaving} onClick={() => setIsSaving(true)}>
            {isSaving ? <Loader2Icon className='animate-spin' size={16} /> : <SaveIcon size={16} />}
            Save
          </button>
          <Link target='_blank' to={`/projects/${projectId}`}> 
            <FullscreenIcon size={16} /> 
            Preview 
          </Link>
          <button>
            <ArrowBigDownDashIcon size={16} />
            Download
          </button>
          <button>
            {project.isPublished ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            {project.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
  :
(
  <div className='flex items-center justify-center h-screen'>
    <p className='text-2xl font-medium text-gray-200'>Unable to load project!</p>

  </div>
)
}

export default Projects
