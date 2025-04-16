# Site Manifest Generator

A modern web application for generating PWA manifest files and related assets. Built with Next.js and Tailwind CSS.

## Features

- Generate PWA manifest files
- Upload and preview icons
- Customize theme colors
- Download generated manifest
- Responsive design

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [React Dropzone](https://react-dropzone.js.org/) - File upload handling
- [React Colorful](https://github.com/omgovich/react-colorful) - Color picker
- [React JSON View Lite](https://github.com/mac-s-g/react-json-view-lite) - JSON viewer

## Project Structure

```
sitemanifest.dev/
├── components/        # Reusable UI components
├── pages/            # Next.js pages
│   ├── api/          # API routes
│   ├── _app.js       # App wrapper
│   ├── _document.js  # Document wrapper
│   ├── index.js      # Home page
│   └── manifest.js   # Manifest generator page
├── public/           # Static assets
├── store/            # State management
├── styles/           # Global styles
├── utils/            # Utility functions
├── .gitignore        # Git ignore rules
├── jsconfig.json     # JavaScript configuration
├── next.config.js    # Next.js configuration
├── package.json      # Project dependencies
├── postcss.config.js # PostCSS configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

MIT
