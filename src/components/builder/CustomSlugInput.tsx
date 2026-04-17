import { useState } from 'react';

interface CustomSlugInputProps {
  value: string;
  onChange: (slug: string) => void;
}

const CustomSlugInput = ({ value, onChange }: CustomSlugInputProps) => {
  const baseUrl = `${window.location.origin}/c/`;

  const handleChange = (raw: string) => {
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
    onChange(cleaned);
  };

  return (
    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
      <p className="font-display text-base font-bold text-gray-800 mb-2">Custom URL ✨</p>
      <p className="font-body text-xs text-gray-500 mb-3">
        Choose a memorable link for your gift
      </p>
      <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-purple-200">
        <span className="font-body text-xs text-gray-400 bg-purple-100/50 px-3 py-3 whitespace-nowrap">
          {baseUrl}
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="your-custom-url"
          className="flex-1 font-body text-sm px-3 py-3 focus:outline-none min-w-0"
        />
      </div>
    </div>
  );
};

export default CustomSlugInput;
