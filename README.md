# PWA Manifest Generator

A modern web application for generating PWA manifest files and related assets. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Core Features (v1-ready)
- 🧾 Manifest File Generation
  - Generate full manifest.json based on user input
  - Live preview of how it renders in browser UI (PWA prompt, app icon, splash, etc.)

- 🖼️ Image Export Tools
  - Upload one high-res source image
  - Auto-generate all required PWA icon sizes (192x192, 512x512, maskable, etc.)

- 🌟 Favicon Generator
  - Create favicons in all modern formats:
    - favicon.ico
    - apple-touch-icon.png
    - favicon-16x16.png, favicon-32x32.png

- 🧪 Preview & Validation
  - Browser preview simulator (mobile/desktop)

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sitemanifest.dev.git
cd sitemanifest.dev
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Project Structure
```
sitemanifest.dev/
├── pages/              # Next.js pages
├── public/             # Static assets
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

### Tech Stack
- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing
- [Jimp](https://github.com/oliver-moran/jimp) - Image manipulation
- [React Dropzone](https://react-dropzone.js.org/) - File uploads
- [React Colorful](https://github.com/omgovich/react-colorful) - Color picker

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
