import React from 'react';
import { HexColorPicker } from 'react-colorful';
import PropTypes from 'prop-types';

const ColorPicker = ({ color, onChange, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <HexColorPicker color={color} onChange={onChange} />
      <div className="mt-2 flex items-center">
        <div
          className="w-8 h-8 rounded border border-gray-300"
          style={{ backgroundColor: color }}
        />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm"
        />
      </div>
    </div>
  );
};

ColorPicker.propTypes = {
  color: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default ColorPicker; 