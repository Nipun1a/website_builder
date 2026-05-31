import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/configs/axios';
import ProjectPreview from '../components/ProjectPreview';
import type { Project } from '../types';
import { toast } from 'sonner';

const View = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setProject(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get<{ code: string }>(`/api/project/published/${projectId}`);
        setProject({
          id: projectId,
          name: 'Published Project',
          initial_prompt: '',
          current_code: data.code,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: '',
          isPublished: true,
          versionId: undefined,
          conversation: [],
          versions: [],
          current_version_index: '',
        });
      } catch (error: any) {
        console.log(error);
        toast.error(error?.response?.data?.message || error.message || 'Failed to load project');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-950'>
        <Loader2Icon className='size-7 animate-spin text-indigo-200' />
      </div>
    );
  }

  if (!project?.current_code) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-950 text-white'>
        <p className='text-lg font-medium'>Project view unavailable.</p>
      </div>
    );
  }

  return (
    <div className='h-screen bg-gray-950 p-4'>
      <ProjectPreview
        project={project}
        isGenerating={false}
        showEditorPanel={false}
      />
    </div>
  );
};

export default View;
