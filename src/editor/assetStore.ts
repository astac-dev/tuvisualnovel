import { create } from 'zustand';

interface AssetStore {
  backgrounds: string[];
  sprites: string[];
  fetchAssets: () => Promise<void>;
  uploadAsset: (file: File, type: 'bg' | 'sprite') => Promise<boolean>;
  deleteAsset: (url: string) => Promise<boolean>;
}

export const useAssetStore = create<AssetStore>((set) => ({
  backgrounds: [],
  sprites: [],

  fetchAssets: async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      set({ backgrounds: data.backgrounds || [], sprites: data.sprites || [] });
    } catch (e) {
      console.error("Error fetching assets", e);
    }
  },

  uploadAsset: async (file: File, type: 'bg' | 'sprite') => {
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-filename': file.name,
          'x-type': type
        },
        body: file // Raw body
      });
      if (res.ok) {
        // Update local state by re-fetching
        const store = useAssetStore.getState();
        await store.fetchAssets();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error uploading asset", e);
      return false;
    }
  },

  deleteAsset: async (url: string) => {
    try {
      const res = await fetch('/api/assets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        const store = useAssetStore.getState();
        await store.fetchAssets();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Error deleting asset", e);
      return false;
    }
  }
}));
