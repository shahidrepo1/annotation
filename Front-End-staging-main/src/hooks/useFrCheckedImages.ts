// stores/useFrCheckedImages.ts
import { create } from "zustand";

type FrCheckedImagesStore = {
  checkedImages: Record<string, boolean>;
  toggleImage: (path: string) => void;
  setImageChecked: (path: string, checked: boolean) => void;
  resetCheckedImages: () => void;
};

export const useFrCheckedImages = create<FrCheckedImagesStore>((set) => ({
  checkedImages: {},
  toggleImage: (path) => {
    set((state) => ({
      checkedImages: {
        ...state.checkedImages,
        [path]: !state.checkedImages[path],
      },
    }));
  },
  setImageChecked: (path, checked) => {
    set((state) => ({
      checkedImages: {
        ...state.checkedImages,
        [path]: checked,
      },
    }));
  },
  resetCheckedImages: () => {
    set({ checkedImages: {} });
  },
}));
