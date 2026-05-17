import { BotIcon, CodeIcon, UserIcon } from 'lucide-react';
import type { Message, Project, Version } from '../types';

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
  setProject: _setProject,
  isGenerating: _isGenerating,
  setIsGenerating: _setIsGenerating,
}: SidebarProps) => {
  const timeline = [...project.conversation, ...project.versions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div
      className={`h-full sm:max-w-sm rounded-xl border border-gray-800 bg-gray-900 transition-all ${
        isMenuOpen ? 'w-full' : 'max-sm:w-0 max-sm:overflow-hidden'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 no-scrollbar">
          {timeline.map((item) => {
            const isMessage = 'content' in item;

            if (isMessage) {
              const msg = item as Message;
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

            const version = item as Version;

            return (
              <div
                key={version.id}
                className="flex items-start gap-3 justify-start"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800">
                  <CodeIcon className="size-5 text-indigo-300" />
                </div>
                <div className="mt-1 max-w-[80%] rounded-2xl rounded-tl-none bg-gray-800 px-4 py-2 text-sm leading-relaxed text-gray-100 shadow-sm">
                  New version generated
                </div>
              </div>
            );
          })}
        </div>

        <form className="border-t border-gray-800 p-3" />
      </div>
    </div>
  );
};

export default Sidebar;
