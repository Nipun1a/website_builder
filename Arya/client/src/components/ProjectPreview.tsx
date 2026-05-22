import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import type { Project } from '../types'
import { iframeScript } from '../assets/assets';
import type { SelectedElementData } from './EditorPanel';



interface ProjectPreviewProps {
    project: Project;
    isGenerating: boolean;
    device?: 'desktop' | 'phone' | 'tablet';
    showEditorPanel?: boolean;
    onElementSelect?: (element: SelectedElementData) => void;
    onClearSelection?: () => void;
}
export interface ProjectPreviewRef {
    getCode: ()=> string | undefined;
    updateSelectedElement: (updates: Partial<SelectedElementData> & { styles?: Partial<SelectedElementData['styles']> }) => void;
    clearSelection: () => void;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(({project, isGenerating, device = 'desktop', showEditorPanel = true, onElementSelect, onClearSelection},ref) => {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const resolutions = {
        phone: 'w-[412px]',
        tablet: 'w-[768px]',
        desktop: 'w-full',
    }

    useImperativeHandle(ref, () => ({
        getCode: () => iframeRef.current?.srcDoc,
        updateSelectedElement: (updates) => {
            iframeRef.current?.contentWindow?.postMessage({
                type: 'UPDATE_ELEMENT',
                payload: updates,
            }, '*');
        },
        clearSelection: () => {
            iframeRef.current?.contentWindow?.postMessage({
                type: 'CLEAR_SELECTION_REQUEST',
            }, '*');
        },
    }), []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow) return;

            if (event.data?.type === 'ELEMENT_SELECTED') {
                onElementSelect?.(event.data.payload as SelectedElementData);
            }

            if (event.data?.type === 'CLEAR_SELECTION') {
                onClearSelection?.();
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onClearSelection, onElementSelect]);

    const injectPreview =(html: string)=>{
        if(!html) return '';
        if(!showEditorPanel) return html;

        if(html.includes('</body>')){
            return html.replace('</body>',iframeScript + '</body>')}
            else{
                return html + iframeScript
            }

    }
  return (
    <div className='relative h-full bg-gray-900 flex-1 rounded-xl overflow-hidden max-sm:ml-2'>
        {project.current_code ?(
            <>
            <iframe
             ref={iframeRef}
             srcDoc={injectPreview(project.current_code)}
             title='Project preview'
             className={`h-full max-sm:w-full ${resolutions[device]} mx-auto transition-all`}
             />

            </>

        ):isGenerating && (
            <div>loading</div>
        )}
      
    </div>
  )
})

export default ProjectPreview
