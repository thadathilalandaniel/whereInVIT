'use client';

import { useRouter } from 'next/navigation';

interface TypeSelectorProps {
  type: 'LOST' | 'FOUND';
  onChange?: (type: 'LOST' | 'FOUND') => void;
  lostLabel?: string;
  foundLabel?: string;
}

export function TypeSelector({ 
  type, 
  onChange, 
  lostLabel = "LOST AN ITEM", 
  foundLabel = "FOUND AN ITEM" 
}: TypeSelectorProps) {
  const router = useRouter();
  
  const handleSelect = (newType: 'LOST' | 'FOUND') => {
    if (onChange) {
      onChange(newType);
    }
  };

  return (
    <div className="relative flex w-full border border-[#E5E5E5] bg-[#F7F7F5] p-1">
      <div 
        className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-[#111111] transition-transform duration-500 ease-in-out"
        style={{ transform: type === 'LOST' ? 'translateX(0)' : 'translateX(100%)' }}
      />
      <button
        type="button"
        onClick={() => handleSelect('LOST')}
        className={`relative flex-1 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-500 ease-in-out ${type === 'LOST' ? 'text-white' : 'text-[#555555] hover:text-[#111111]'}`}
      >
        {lostLabel}
      </button>
      <button
        type="button"
        onClick={() => handleSelect('FOUND')}
        className={`relative flex-1 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-500 ease-in-out ${type === 'FOUND' ? 'text-white' : 'text-[#555555] hover:text-[#111111]'}`}
      >
        {foundLabel}
      </button>
    </div>
  );
}
