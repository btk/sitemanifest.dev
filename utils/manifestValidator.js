import { manifestSchema } from './manifestSchema';

export const validateManifest = (manifest) => {
  const errors = [];
  const warnings = [];

  // Check required fields
  manifestSchema.required.forEach(field => {
    if (!manifest[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate field types and patterns
  Object.entries(manifestSchema.properties).forEach(([field, schema]) => {
    const value = manifest[field];
    if (value === undefined) return;

    // Check type
    if (schema.type) {
      if (schema.type === 'array' && !Array.isArray(value)) {
        errors.push(`Invalid type for ${field}: expected array`);
      } else if (schema.type !== 'array' && typeof value !== schema.type) {
        errors.push(`Invalid type for ${field}: expected ${schema.type}`);
      }
    }

    // Check enum values
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`Invalid value for ${field}: must be one of ${schema.enum.join(', ')}`);
    }

    // Check pattern
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`Invalid format for ${field}: must match pattern ${schema.pattern}`);
    }
  });

  // Validate icons
  if (manifest.icons) {
    manifest.icons.forEach((icon, index) => {
      if (!icon.src || !icon.sizes || !icon.type) {
        errors.push(`Icon at index ${index} is missing required fields (src, sizes, type)`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const getDefaultManifest = () => ({
  name: '',
  short_name: '',
  description: '',
  start_url: '/',
  display: 'standalone',
  orientation: 'any',
  scope: '/',
  lang: 'en',
  background_color: '#ffffff',
  theme_color: '#000000',
  prefer_related_applications: false,
  icons: []
}); 