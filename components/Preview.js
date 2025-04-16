import React from 'react';
import PropTypes from 'prop-types';

const Preview = ({ image, manifest, className = '' }) => {
  if (!image && !manifest) return null;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
      
      {image && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Icon Preview</h3>
          <div className="flex space-x-4">
            <div className="text-center">
              <img
                src={image}
                alt="Icon preview"
                className="w-16 h-16 object-contain"
              />
              <p className="text-xs text-gray-500 mt-1">16x16</p>
            </div>
            <div className="text-center">
              <img
                src={image}
                alt="Icon preview"
                className="w-32 h-32 object-contain"
              />
              <p className="text-xs text-gray-500 mt-1">32x32</p>
            </div>
            <div className="text-center">
              <img
                src={image}
                alt="Icon preview"
                className="w-48 h-48 object-contain"
              />
              <p className="text-xs text-gray-500 mt-1">48x48</p>
            </div>
          </div>
        </div>
      )}

      {manifest && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Manifest Preview</h3>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(manifest, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

Preview.propTypes = {
  image: PropTypes.string,
  manifest: PropTypes.object,
  className: PropTypes.string
};

export default Preview; 