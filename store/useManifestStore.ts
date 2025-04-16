import { create } from 'zustand';
import { Manifest } from '../types/manifest';
import { generateIcons, generateFavicons, validateManifest } from '../utils/manifest';

interface ManifestStore {
  manifest: Manifest;
  errors: string[];
  isLoading: boolean;
  setManifest: (manifest: Partial<Manifest>) => void;
  processImage: (file: File) => Promise<void>;
  validate: () => void;
}

const initialManifest: Manifest = {
  name: '',
  short_name: '',
  description: '',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#000000',
  icons: [],
};

export const useManifestStore = create<ManifestStore>((set, get) => ({
  manifest: initialManifest,
  errors: [],
  isLoading: false,
  
  setManifest: (updates) => {
    set((state) => ({
      manifest: { ...state.manifest, ...updates },
    }));
  },

  processImage: async (file) => {
    set({ isLoading: true });
    try {
      const buffer = await file.arrayBuffer();
      const icons = await generateIcons(Buffer.from(buffer));
      await generateFavicons(Buffer.from(buffer));
      
      set((state) => ({
        manifest: { ...state.manifest, icons },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      set({ isLoading: false });
    }
  },

  validate: () => {
    const { manifest } = get();
    const errors = validateManifest(manifest);
    set({ errors });
  },
})); 