import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dummyProjects, dummyVersion } from '../assets/assets';
import ProjectPreview from '../components/ProjectPreview';
import type { Project } from '../types';

const Preview = () => {
  const { projectId, versionId } = useParams();
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const project = dummyProjects.find((item) => item.id === projectId);

    window.setTimeout(() => {
      if (!project) {
        setPreviewProject(null);
        setLoading(false);
        return;
      }

      const versionCode =
        project.versions.find((version) => version.id === versionId)?.code ??
        dummyVersion.find((version) => version.id === versionId && version.projectId === projectId)?.code;

      setPreviewProject({
        ...project,
        current_code: versionId ? versionCode || project.current_code : project.current_code,
      });
      setLoading(false);
    }, 500);
  }, [projectId, versionId]);

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-950'>
        <Loader2Icon className='size-7 animate-spin text-indigo-200' />
      </div>
    );
  }

  if (!previewProject?.current_code) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-950 text-white'>
        <p className='text-lg font-medium'>Preview unavailable.</p>
      </div>
    );
  }

  return (
    <div className='h-screen bg-gray-950 p-4'>
      <ProjectPreview
        project={previewProject}
        isGenerating={false}
        showEditorPanel={false}
      />
    </div>
  );
};

export default Preview;
