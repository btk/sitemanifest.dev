export const manifestSchema = {
  type: 'object',
  required: ['name', 'short_name', 'start_url', 'display'],
  properties: {
    name: {
      type: 'string',
      description: 'The full name of the web application'
    },
    short_name: {
      type: 'string',
      description: 'A short version of the name, typically used on the home screen'
    },
    description: {
      type: 'string',
      description: 'A description of what the web application does'
    },
    start_url: {
      type: 'string',
      description: 'The URL that loads when the user launches the application'
    },
    display: {
      type: 'string',
      enum: ['fullscreen', 'standalone', 'minimal-ui', 'browser'],
      description: 'The developer\'s preferred display mode for the web application'
    },
    orientation: {
      type: 'string',
      enum: ['any', 'natural', 'landscape', 'landscape-primary', 'landscape-secondary', 'portrait', 'portrait-primary', 'portrait-secondary'],
      description: 'The default orientation for the web application'
    },
    scope: {
      type: 'string',
      description: 'The navigation scope of the web application\'s context'
    },
    lang: {
      type: 'string',
      description: 'The primary language for the values in the name and short_name members'
    },
    background_color: {
      type: 'string',
      pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
      description: 'The background color of the web application'
    },
    theme_color: {
      type: 'string',
      pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
      description: 'The theme color of the web application'
    },
    prefer_related_applications: {
      type: 'boolean',
      description: 'Specifies whether the web application prefers related applications'
    },
    icons: {
      type: 'array',
      items: {
        type: 'object',
        required: ['src', 'sizes', 'type'],
        properties: {
          src: {
            type: 'string',
            description: 'The path to the image file'
          },
          sizes: {
            type: 'string',
            description: 'The sizes of the icon'
          },
          type: {
            type: 'string',
            description: 'The MIME type of the image'
          }
        }
      }
    }
  }
}; 