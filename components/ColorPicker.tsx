import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '../utils/cn';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <div
        className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
        style={{ backgroundColor: value }}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-10">
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
} 