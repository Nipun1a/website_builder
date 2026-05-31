import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api from '@/configs/axios';
import ProjectPreview from '../components/ProjectPreview';
import { dummyProjects } from '../assets/assets';
import type { Project } from '../types';
import { toast } from 'sonner';

const View = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const stateProject =
    location.state && typeof location.state === 'object'
      ? (location.state as { project?: Project }).project
      : undefined;
  const dummyProject = dummyProjects.find((project) => project.id === projectId);

  const [project, setProject] = useState<Project | null>(
    stateProject?.current_code
      ? stateProject
      : dummyProject?.current_code
        ? (dummyProject as Project)
        : null
  );
  const [loading, setLoading] = useState(
    !(stateProject?.current_code || dummyProject?.current_code)
  );

  useEffect(() => {
    if (stateProject?.current_code) {
      return;
    }

    if (dummyProject?.current_code) {
      return;
    }

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
      } catch (error: unknown) {
        console.log(error);
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
              : 'Failed to load project';

        toast.error(message);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [projectId, stateProject?.current_code, dummyProject?.current_code]);

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
