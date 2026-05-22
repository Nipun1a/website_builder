import { CircleIcon, ScanLineIcon, SquareIcon, TriangleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const steps = [
  { icon: ScanLineIcon, label: 'Analyzing your request...' },
  { icon: SquareIcon, label: 'Generating layout structure...' },
  { icon: TriangleIcon, label: 'Assembling UI components...' },
  { icon: CircleIcon, label: 'Finalizing your website...' },
];

const STEP_DURATION = 4500;

const LoaderSteps = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrent((step) => (step + 1) % steps.length);
    }, STEP_DURATION);

    return () => window.clearInterval(interval);
  }, []);

  const Icon = steps[current].icon;

  return (
    <div className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-gray-950 text-white'>
      <div className='absolute inset-0 bg-linear-to-br from-blue-500/10 via-cyan-400/10 to-transparent blur-3xl' />
      <div className='absolute inset-6 rounded-[2rem] border border-white/10' />
      <div className='relative z-10 flex flex-col items-center text-center'>
        <div className='rounded-full border border-white/10 bg-white/5 p-5 shadow-2xl shadow-blue-500/10'>
          <Icon className='h-8 w-8 animate-pulse text-white/90' />
        </div>
        <p
          key={current}
          className='mt-8 text-lg font-light tracking-wide text-white/90 transition-all duration-700 ease-in-out'
        >
          {steps[current].label}
        </p>
        <p className='mt-2 text-sm text-white/50'>This may take around 2-3 minutes.</p>
      </div>
    </div>
  );
};

export default LoaderSteps;
