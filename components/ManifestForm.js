import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';
import Alert from './Alert';

const ManifestForm = ({ onSubmit, initialData = {}, className = '' }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    short_name: initialData.short_name || '',
    description: initialData.description || '',
    start_url: initialData.start_url || '/',
    display: initialData.display || 'standalone',
    background_color: initialData.background_color || '#ffffff',
    theme_color: initialData.theme_color || '#ffffff',
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.name) {
      setError('App name is required');
      return;
    }

    if (!formData.short_name) {
      setError('Short name is required');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Input
        label="App Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="My Progressive Web App"
        required
      />

      <Input
        label="Short Name"
        name="short_name"
        value={formData.short_name}
        onChange={handleChange}
        placeholder="My PWA"
        required
      />

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="A description of your Progressive Web App"
      />

      <Input
        label="Start URL"
        name="start_url"
        value={formData.start_url}
        onChange={handleChange}
        placeholder="/"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Background Color"
          name="background_color"
          value={formData.background_color}
          onChange={handleChange}
          placeholder="#ffffff"
        />

        <Input
          label="Theme Color"
          name="theme_color"
          value={formData.theme_color}
          onChange={handleChange}
          placeholder="#ffffff"
        />
      </div>

      <div className="pt-4">
        <Button type="submit" fullWidth>
          Generate Manifest
        </Button>
      </div>
    </form>
  );
};

ManifestForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  className: PropTypes.string
};

export default ManifestForm; 