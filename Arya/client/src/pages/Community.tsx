
import { useCallback, useEffect, useState } from 'react';
import type { Project } from '../types';
import { Loader2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { dummyProjects } from '../assets/assets';
import api from '@/configs/axios';
import { toast } from 'sonner';



const Community = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try{
      const {data} = await api.get('/api/project/published')
      const combinedProjects = [...dummyProjects, ...data.projects]
      const uniqueProjects = combinedProjects.filter(
        (project, index, allProjects) =>
          index === allProjects.findIndex((item) => item.id === project.id)
      )

      setProjects(uniqueProjects)
    }catch(error:any){
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
      setProjects(dummyProjects as Project[])
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="relative isolate min-h-screen overflow-hidden px-4 text-white md:px-16 lg:px-24 xl:px-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-black"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAVc8B-8ftoYyS8s7T-Djsb1eUf7DEoKsTBesl-ZJX4kfh28doGwJE8OgwlkKNQwDP0rBJNF3HD97AvckDtMI7QpMgsiDdmJW3bLMICVv3MzWGvnI2oul_Kc5-ri9JihnNu0swpOzROrLYyDx2gf9s5YVLBqAyGWoz-MM-WR06gL7CUIPkWifI8y5o0lezck6fCLhtcRFGmsRmOMD-Mu2zfBsC-I-SW-NqShz7td-mIPdSE0gmyZijJfdNTMS4Rj4pVxqcSyfBMClHt')",
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,209,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_26%),linear-gradient(180deg,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0.68)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-[linear-gradient(to_bottom,rgba(88,28,135,0.15)_0%,rgba(0,0,0,0)_100%)]"
      />

      <div className="relative">
      {loading ? (
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2Icon className="h-7 w-7 animate-spin text-indigo-200" />
        </div>
      ) : projects.length > 0 ? (
        <div className="py-10 min-h-[80vh]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-medium text-white">Published Projects</h1>
            
          </div>

          <div className="flex flex-wrap gap-3.5">
            {projects.map((project) => (
                <div
                onClick={() =>
                  navigate(`/view/${project.id}`, { state: { project } })
                }
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
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/view/${project.id}`, { state: { project } });
                      }}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-sm rounded transition-all"
                    >
                      Preview
                    </button>
                  </div>
                </div>
                <div className='p-4 text-white bg-gray-950/80 border-t border-gray-800'>
                  <div className='flex items-start justify-between gap-2'>
                    <h2 className='text-lg font-semibold'>{project.name}</h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/view/${project.id}`, { state: { project } });
                      }}
                      className='text-sm text-indigo-300 hover:text-white transition-colors'
                    >
                      Website
                    </button>
                  </div>
                  <p className='text-gray-400 mt-2 text-sm line-clamp-2'>{project.initial_prompt}</p>
                  <div className='flex justify-between items-center mt-4'>
                    <span className='text-sm text-gray-500'>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
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
    </div>
  );
};

export default Community;




