import { Loader2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyConversations, dummyProjects } from '../assets/assets'
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
      <div className='flex max-sm: flex-col sm:items-center gap-4 px-4 py-2 no-scroller'>
        <img src="/favicon.svg" alt= "logo" className='h-6 cursor-pointer' onClick={() => navigate('/')}></img>
        {/*left*/}
        <div></div>
        {/* middle */}
        <div></div>
        {/*right*/}
        <div></div>

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
