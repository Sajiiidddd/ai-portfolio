'use client';

import { useState } from 'react';

interface SortDropdownProps {
  value: 'latest' | 'top';
  onChange: (val: 'latest' | 'top') => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (val: 'latest' | 'top') => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 bg-black text-white border border-gray-600 rounded hover:bg-gray-800 transition"
      >
        Sort: {value === 'latest' ? 'Latest' : 'Top'} ▼
      </button>

      {open && (
        <div className="absolute mt-2 w-full bg-white rounded shadow-lg z-10">
          <button
            onClick={() => handleSelect('latest')}
            className="w-full px-4 py-2 text-left text-black hover:bg-gray-100"
          >
            Latest
          </button>
          <button
            onClick={() => handleSelect('top')}
            className="w-full px-4 py-2 text-left text-black hover:bg-gray-100"
          >
            Top
          </button>
        </div>
      )}
    </div>
  );
}
