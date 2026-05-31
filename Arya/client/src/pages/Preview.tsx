import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import api from '@/configs/axios';
import ProjectPreview from '../components/ProjectPreview';
import type { Project, Version } from '../types';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error';

type PreviewLocationState = {
  project?: Project;
};

const buildPreviewProject = (project: Partial<Project> & Pick<Project, 'id' | 'current_code'>): Project => ({
  id: project.id,
  name: project.name ?? 'Preview',
  initial_prompt: project.initial_prompt ?? '',
  current_code: project.current_code,
  createdAt: project.createdAt ?? new Date().toISOString(),
  updatedAt: project.updatedAt ?? new Date().toISOString(),
  userId: project.userId ?? '',
  user: project.user,
  isPublished: project.isPublished,
  versionId: project.versionId,
  conversation: project.conversation ?? [],
  versions: project.versions ?? [],
  current_version_index: project.current_version_index ?? '',
});

const Preview = () => {
  const { projectId, versionId } = useParams();
  const location = useLocation();
  const locationState = location.state as PreviewLocationState | null;

  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreview = async () => {
      if (!projectId) {
        setPreviewProject(null);
        setLoading(false);
        return;
      }

      const routeProject = locationState?.project;

      if (routeProject?.id === projectId) {
        const matchedVersion = versionId
          ? routeProject.versions?.find((version) => version.id === versionId)
          : undefined;

        setPreviewProject({
          ...routeProject,
          current_code: matchedVersion?.code ?? routeProject.current_code,
        });
        setLoading(false);
        return;
      }

      const loadFromPublicRoute = async () => {
        const { data } = await api.get(`/api/project/published/${projectId}`);
        return buildPreviewProject({
          id: projectId,
          current_code: data.code ?? '',
        });
      };

      const loadFromPrivateRoute = async () => {
        const { data } = await api.get(`/api/project/preview/${projectId}`);
        const matchedVersion = versionId
          ? (data.project.versions as Version[] | undefined)?.find((version) => version.id === versionId)
          : undefined;

        return {
          ...data.project,
          current_code: matchedVersion?.code ?? data.project.current_code,
        } as Project;
      };

      try {
        const project = versionId
          ? await loadFromPrivateRoute().catch(() => loadFromPublicRoute())
          : await loadFromPublicRoute().catch(() => loadFromPrivateRoute());

        setPreviewProject(project);
      } catch (error: unknown) {
        console.log(error);
        toast.error(getErrorMessage(error, 'Failed to load preview'));
        setPreviewProject(null);
      } finally {
        setLoading(false);
      }
    };

    void loadPreview();
  }, [locationState?.project, projectId, versionId]);

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
