import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dummyProjects } from '../assets/assets';
import ProjectPreview from '../components/ProjectPreview';
import type { Project } from '../types';

const View = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const matchedProject = dummyProjects.find((item) => item.id === projectId) ?? null;

    window.setTimeout(() => {
      setProject(matchedProject);
      setLoading(false);
    }, 500);
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
