import {
  ArrowBigDownDashIcon,
  EyeIcon,
  EyeOffIcon,
  FullscreenIcon,
  LaptopIcon,
  Loader2Icon,
  MessageSquareIcon,
  SaveIcon,
  SmartphoneIcon,
  TabletIcon
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import EditorPanel, { type SelectedElementData } from '../components/EditorPanel'
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview'
import Sidebar from '../components/Sidebar'
import logo from '../assets/logo.png'
import type { Project } from '../types'
import api from '@/configs/axios'
import { authClient } from '@/lib/auth-client'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
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
  ) {
    return error.response.data.message
  }

  return error instanceof Error ? error.message : fallback
}

const Projects = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(true)
  const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>('desktop')
  const [selectedElement, setSelectedElement] = useState<SelectedElementData | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const previewRef = useRef<ProjectPreviewRef>(null)

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }

    try {
      const { data } = await api.get<{ project: Project }>(`/api/user/project/${projectId}`)
      setProject(data.project)
      setIsGenerating(!data.project.current_code)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to load project'))
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const saveProject = async () => {
    if (!projectId || !project) {
      return
    }

    const code = previewRef.current?.getCode() ?? project.current_code

    if (!code) {
      toast.error('No code available to save')
      return
    }

    try {
      setIsSaving(true)
      await api.put(`/api/project/save/${projectId}`, { code })
      setProject({ ...project, current_code: code })
      toast.success('Project saved successfully')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save project'))
      console.log(error)
    } finally {
      setIsSaving(false)
    }
  }

  const downloadCode = () => {
    const code = previewRef.current?.getCode() || project?.current_code

    if (!code) {
      return
    }

    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(file)

    element.href = url
    element.download = 'index.html'
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()

    window.setTimeout(() => {
      document.body.removeChild(element)
      URL.revokeObjectURL(url)
    }, 100)
  }

  const togglePublish = async () => {
    if (!projectId || !project) {
      return
    }

    try {
      const { data } = await api.get<{ isPublished: boolean; message: string }>(`/api/user/publish-toggle/${projectId}`)
      setProject({ ...project, isPublished: data.isPublished })
      toast.success(data.message)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to update publish status'))
      console.log(error)
    }
  }

  const handleElementUpdate = (updates: Partial<SelectedElementData> & { styles?: Partial<SelectedElementData['styles']> }) => {
    if (!selectedElement) return

    const nextValue: SelectedElementData = {
      ...selectedElement,
      ...updates,
      styles: {
        ...selectedElement.styles,
        ...(updates.styles ?? {})
      }
    }

    setSelectedElement(nextValue)
    previewRef.current?.updateSelectedElement(updates)
  }

  const handleEditorClose = () => {
    setSelectedElement(null)
    previewRef.current?.clearSelection()
  }

  useEffect(() => {
    if (isPending) {
      return
    }

    if (!session?.user) {
      navigate('/')
      toast('Please login to view your projects')
      return
    }

    const timeoutId = window.setTimeout(() => {
      void fetchProject()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchProject, isPending, navigate, session?.user])

  useEffect(() => {
    if (!session?.user || !project || project.current_code) {
      return
    }

    const intervalId = window.setInterval(() => {
      void fetchProject()
    }, 10000)

    return () => window.clearInterval(intervalId)
  }, [fetchProject, project, session?.user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className="h-7 w-7 animate-spin text-indigo-200" />
      </div>
    )
  }

  return project ? (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
      <div className="flex max-sm:flex-col sm:items-center justify-between gap-4 px-4 py-2 no-scroller">
        <div className="flex items-center gap-2 text-nowrap">
          <img src={logo} alt="logo" className="h-6 cursor-pointer" onClick={() => navigate('/')} />
          <div>
            <p>{project.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">Previewing the last saved version</p>
          </div>
          <div className="sm:hidden flex-1 flex justify-end">
            <MessageSquareIcon onClick={() => setIsMenuOpen(true)} className="size-6 cursor-pointer" />
          </div>
        </div>

        <div className="hidden sm:flex gap-2 bg-gray-950 p-1.5 rounded-md">
          <SmartphoneIcon onClick={() => setDevice('phone')} className={`size-6 p-1 rounded cursor-pointer ${device === 'phone' ? 'bg-gray-700' : ''}`} />
          <TabletIcon onClick={() => setDevice('tablet')} className={`size-6 p-1 rounded cursor-pointer ${device === 'tablet' ? 'bg-gray-700' : ''}`} />
          <LaptopIcon onClick={() => setDevice('desktop')} className={`size-6 p-1 rounded cursor-pointer ${device === 'desktop' ? 'bg-gray-700' : ''}`} />
        </div>

        <div className="flex items-center justify-end gap-3 text-xs sm:text-sm">
          <button className="flex items-center gap-2 px-4 py-1 rounded-sm border border-gray-700 hover:border-gray-500 transition-colors" disabled={isSaving} onClick={saveProject}>
            {isSaving ? <Loader2Icon className="animate-spin" size={16} /> : <SaveIcon size={16} />}
            Save
          </button>
          <Link target="_blank" to={`/preview/${projectId}`} className="flex items-center gap-2 px-4 py-1 rounded-sm border border-gray-700 hover:border-gray-500 transition-colors">
            <FullscreenIcon size={16} />
            Preview
          </Link>
          <button
            type="button"
            onClick={downloadCode}
            disabled={!project.current_code || isGenerating}
            className="bg-linear-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowBigDownDashIcon size={16} />
            Download
          </button>
          <button onClick={togglePublish} className="bg-linear-to-br from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors">
            {project.isPublished ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            {project.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-auto">
        <Sidebar
          isMenuOpen={isMenuOpen}
          project={project}
          setProject={setProject}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
        <div className="relative flex-1 p-2 pl-0">
          <ProjectPreview
            ref={previewRef}
            project={project}
            isGenerating={isGenerating}
            device={device}
            showEditorPanel
            onElementSelect={setSelectedElement}
            onClearSelection={() => setSelectedElement(null)}
          />
          <EditorPanel
            selectedElement={selectedElement}
            onUpdate={handleElementUpdate}
            onClose={handleEditorClose}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-screen">
      <p className="text-2xl font-medium text-gray-200">Unable to load project!</p>
    </div>
  )
}

export default Projects
