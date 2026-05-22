import { BotIcon, CodeIcon, Loader2Icon, SendIcon, UserIcon } from 'lucide-react';
import type { Project, Version } from '../types';
import { useEffect, useRef, useState } from 'react';

interface SidebarProps {
  isMenuOpen: boolean;
  project: Project;
  setProject: (project: Project) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

const Sidebar = ({
  isMenuOpen,
  project,
  setProject,
  isGenerating: _isGenerating,
  setIsGenerating,
}: SidebarProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');

  const handleRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsGenerating(true);
    
    // TODO: Add actual API call to send message and get response
    // For now, simulating a 3-second response time
    setTimeout(() => {
      setIsGenerating(false);
      setMessage('');
    }, 3000);
  };
  const loaderSpanStyles = [
    { animationDelay: '0s' },
    { animationDelay: '0.2s' },
    { animationDelay: '0.4s' },
  ];
  
  useEffect(() => {
    if (messageRef.current){
      messageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, []);


  return (
    <div
      className={`h-full sm:max-w-sm rounded-xl border border-gray-800 bg-gray-900 transition-all ${
        isMenuOpen ? 'w-full' : 'max-sm:w-0 max-sm:overflow-hidden'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 no-scrollbar">
          {[...project.conversation, ...project.versions].sort(
            (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ).map((item) => {
            const isMessage = 'content' in item;

            if (isMessage) {
              const msg = item as { id: string; role: 'user' | 'assistant'; content: string; timestamp: string };
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-indigo-700">
                      <BotIcon className="size-5 text-white" />
                    </div>
                  )}

                  <div
                    className={`mt-1 max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'rounded-tr-none bg-linear-to-r from-indigo-500 to-indigo-600 text-white'
                        : 'rounded-tl-none bg-gray-800 text-gray-100'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {isUser && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                      <UserIcon className="size-5 text-gray-200" />
                    </div>
                  )}
                </div>
              );
            }
            else{
              const ver = item as Version;
              return(
                <div key={ver.id} className='w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2'>
                  <div>
                    code updated <br />
                    <span>
                      {new Date(ver.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    {
                      project.current_version_index === ver.id ?(
                        <button className='px-3 py-1 rounded-md text-xs bg-gray-700'>Current version</button>
                      ):(
                        <button onClick={() => {}} className='px-3 py-1 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white'>Roll back to this version</button>
                      )
                    }
                    <a href={`/preview/${project.id}/${ver.id}`} target='_blank' rel='noreferrer' title='Preview version' aria-label='Preview version'>
                      <CodeIcon 
                        className='size-6 p-1 bg-gray-700 hover:bg-indigo-500 transition-colors rounded'
                      />
                    </a>
                  </div>
                </div>
              )
            }
          })}
          {_isGenerating && (
            <div className='flex items-start gap-3 justify-start'>
              <div className='w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center'>
                <BotIcon className='size-5 text-white' />
              </div>
              {/* three dot loader */}
              <div className='flex gap-1.5 h-full items-end'>
                <span className='size-2 rounded-full animate-bounce bg-gray-600' style={loaderSpanStyles[0]}></span>
                <span className='size-2 rounded-full animate-bounce bg-gray-600' style={loaderSpanStyles[1]}></span>
                <span className='size-2 rounded-full animate-bounce bg-gray-600' style={loaderSpanStyles[2]}></span>
              </div>
            </div>
          )}
          <div ref={messageRef}></div>
        </div>

        <form onSubmit={handleRevision} className="m-3 relative">
          <div className='flex items-center gap-2'>
            <textarea 
              rows={4} 
              placeholder='Describe your website or request changes...' 
              className='flex-1 p-3 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-indigo-500 bg-gray-800 text-gray-100 placeholder-gray-400 transition-all'
              disabled={_isGenerating}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type='submit' disabled={_isGenerating}>
              {_isGenerating
              ? <Loader2Icon className='size-7 p-1.5 animate-spin text-white'/>
              : <SendIcon className='size-7 p-1.5 text-white cursor-pointer hover:text-indigo-400 transition-colors'/>  }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;
