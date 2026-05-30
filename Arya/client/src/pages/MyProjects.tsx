import { useCallback, useEffect, useState } from 'react';
import type { Project } from '../types';
import { Loader2Icon, PlusIcon, TrashIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';


const MyProjects = () => {
  const {data: session, isPending} = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const {data} = await api.get('/api/user/projects')
      setProjects(data.projects)
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setLoading(false)
    }
  }, []);

  const deleteProject = async (projectId: string) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this project?');
      if (!confirm) {
        return;
      }
      await api.delete(`/api/project/delete/${projectId}`)
      toast.success('Project deleted successfully');
      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
      
    } catch (error:any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
      
    }
  }

  useEffect(() => {
    if (isPending) {
      return;
    }

    if(session?.user && !isPending){
      void fetchProjects()
    }else if (!isPending && !session?.user){
      navigate('/');
      toast('Please login to view your projects');
    }
  }, [fetchProjects, isPending, navigate, session?.user]);

  return (
    <div className="px-4 md:px-16 lg:px-24 xl:px-32">
      {loading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2Icon className="h-7 w-7 animate-spin text-indigo-200" />
        </div>
      ) : projects.length > 0 ? (
        <div className="py-10 min-h-[80vh]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-medium text-white">My Projects</h1>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all"
            >
              <PlusIcon size={18} />
              Create New
            </button>
          </div>

          <div className="flex flex-wrap gap-3.5">
            {projects.map((project) => (
              <div
                onClick={() => navigate(`/projects/${project.id}`)}
                key={project.id}
                className="relative group w-72 max-sm:mx-auto cursor-pointer bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-indigo-700/30 hover:border-indigo-800/80 transition-all duration-300"
              >
                <div className="relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800">
                  {project.current_code ? (
                    <iframe
                      title="Project preview"
                      srcDoc={project.current_code}
                      className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none"
                      sandbox="allow-scripts allow-same-origin"
                      style={{ transform: 'scale(0.25)' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p className="text-2xl font-semibold">No Preview</p>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/preview/${project.id}`); }}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded transition-all"
                    >
                      Preview
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/projects/${project.id}`); }}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded transition-all"
                    >
                      Open
                    </button>
                  </div>
                </div>
                <div className='p-4 text-white bg-gray-950/80 border-t border-gray-800'>
                  <div className='flex items-start justify-between gap-2'>
                    <h2 className='text-lg font-semibold'>{project.name}</h2>
                    <button className='text-sm text-indigo-300 hover:text-white transition-colors'>website</button>
                  </div>
                  <p className='text-gray-400 mt-2 text-sm line-clamp-2'>{project.initial_prompt}</p>
                  <div className='flex justify-between items-center mt-4'>
                    <span className='text-sm text-gray-500'>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <TrashIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className='absolute top-3 right-3 scale-0 group-hover:scale-100 bg-white p-1.5 rounded text-red-500 text-xl cursor-pointer transition-all'
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-10 min-h-[80vh]">
          <h1 className="text-3xl font-semibold text-shadow-gray-300">You have no project yet!</h1>
          <button
            onClick={() => navigate('/')}
            className="text-white px-5 py-2 mt-5 rounded-md bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all"
          >
            Create New
          </button>
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default MyProjects;
