import { X } from 'lucide-react';

export interface SelectedElementData {
  tagName: string;
  className: string;
  text: string;
  styles: {
    padding: string;
    margin: string;
    backgroundColor: string;
    color: string;
    fontSize: string;
  };
}

export type SelectedElementUpdate = Partial<Omit<SelectedElementData, 'styles'>> & {
  styles?: Partial<SelectedElementData['styles']>;
};

interface EditorPanelProps {
  selectedElement: SelectedElementData | null;
  onUpdate: (updates: SelectedElementUpdate) => void;
  onClose: () => void;
}

const EditorPanel = ({ selectedElement, onUpdate, onClose }: EditorPanelProps) => {
    if(!selectedElement) return null
    const handleChange = (field: 'className' | 'text', value: string) => {
      onUpdate({ [field]: value })
    }

    const handleStyleChange = (styleName: keyof SelectedElementData['styles'], value: string) => {
      const styles: Partial<SelectedElementData['styles']> = {
        [styleName]: value,
      };

      onUpdate({ styles });
    }
    return (
    <div className='absolute top-4 right-4 z-50 w-80 rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow-xl animate-fade-in'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-sm font-semibold'>Edit Element</h3>
        <button type='button' onClick={onClose} className='rounded-full p-1 hover:bg-gray-100'>
            <X className='w-4 h-4 text-gray-500' />
        </button>
      </div>
      <div className='mb-3'>
        <label className='block text-xs font-medium text-gray-500 mb-1'>Class Name</label>
        <input type='text' value={selectedElement.className || ''} onChange={(e) => handleChange('className', e.target.value)} className='w-full text-sm p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none' />
      </div>
      <div className='mb-3'>
        <label className='block text-xs font-medium text-gray-500 mb-1'>Text</label>
        <textarea value={selectedElement.text || ''} onChange={(e) => handleChange('text', e.target.value)} className='w-full rounded-md border border-gray-400 p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500' rows={3} />
      </div>
      <div className='space-y-3'>
        <div>
        <label className='block text-xs font-medium text-gray-500 mb-1'>Padding</label>
        <input type='text' value={selectedElement.styles.padding || ''} onChange={(e) => handleStyleChange('padding', e.target.value)} className='w-full text-sm p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none' />
        </div>
        <div>
        <label className='block text-xs font-medium text-gray-500 mb-1'>Margin</label>
        <input type='text' value={selectedElement.styles.margin || ''} onChange={(e) => handleStyleChange('margin', e.target.value)} className='w-full text-sm p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none' />
        </div>
        
          <div>
        <label className='block text-xs font-medium text-gray-500 mb-1'>Font Size</label>
        <input type='text' value={selectedElement.styles.fontSize || ''} onChange={(e) => handleStyleChange('fontSize', e.target.value)} className='w-full text-sm p-2 border border-gray-400 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none' />
        
        </div>
        <div>
        <label className='block text-xs font-medium text-gray-500 mb-1'>Background Color</label>
        <input type='color' value={selectedElement.styles.backgroundColor === 'rgba(0, 0, 0, 0)' ? '#ffffff' : selectedElement.styles.backgroundColor} onChange={(e) => handleStyleChange('backgroundColor', e.target.value)} className='w-6 h-6 cursor-pointer' />
        <span className='text-xs text-gray-600 truncate'>{selectedElement.styles.backgroundColor}</span>
        </div>
         <div>
        <label className='block text-xs font-medium text-gray-500 mb-1'>Text Color</label>
        <input type='color' value={selectedElement.styles.color === 'rgba(0, 0, 0, 0)' ? '#000000' : selectedElement.styles.color} onChange={(e) => handleStyleChange('color', e.target.value)} className='w-6 h-6 cursor-pointer' />
        </div>
      </div>
    </div>
  )
}

export default EditorPanel
