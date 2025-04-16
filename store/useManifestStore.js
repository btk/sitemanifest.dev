import { create } from 'zustand';

const useManifestStore = create((set) => ({
  manifest: null,
  setManifest: (manifest) => set({ manifest }),
  clearManifest: () => set({ manifest: null }),
  
  themeColor: '#ffffff',
  setThemeColor: (color) => set({ themeColor: color }),
  
  image: null,
  setImage: (image) => set({ image }),
  clearImage: () => set({ image: null }),
  
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  loading: false,
  setLoading: (loading) => set({ loading }),
  
  reset: () => set({
    manifest: null,
    themeColor: '#ffffff',
    image: null,
    error: null,
    loading: false
  })
}));

export default useManifestStore; 