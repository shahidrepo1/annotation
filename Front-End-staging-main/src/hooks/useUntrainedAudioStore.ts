import { create } from "zustand";

type AudioStore = {
  untrainedSelectedFolders: Record<string, Array<number>>;
  untrainedSelectedAudios: Record<string, Array<{ id: number; name: string }>>;
  setUntrainedSelectedFolders: (folders: Record<string, Array<number>>) => void;
  setUntrainedSelectedAudios: (
    audios: Record<string, Array<{ id: number; name: string }>>
  ) => void;
  untrainedSelectedAudioIds: Array<number>;
  setUntrainedSelectedAudioIds: (
    audios: Array<number> | ((prevSelected: Array<number>) => Array<number>)
  ) => void;
  clearSelections: () => void;
};

const useUntrainedAudioStore = create<AudioStore>((set) => ({
  untrainedSelectedFolders: {},
  untrainedSelectedAudios: {},
  setUntrainedSelectedFolders: (newFolders) => {
    set((state) => ({
      untrainedSelectedFolders: {
        ...state.untrainedSelectedFolders,
        ...newFolders,
      },
    }));
  },

  setUntrainedSelectedAudios: (newAudios) => {
    set((state) => ({
      untrainedSelectedAudios: {
        ...state.untrainedSelectedAudios,
        ...newAudios,
      },
    }));
  },
  untrainedSelectedAudioIds: [],
  setUntrainedSelectedAudioIds: (audios) => {
    set((state) => ({
      untrainedSelectedAudioIds:
        typeof audios === "function"
          ? audios(state.untrainedSelectedAudioIds)
          : audios,
    }));
  },
  clearSelections: () => {
    set({
      untrainedSelectedFolders: {},
      untrainedSelectedAudios: {},
      untrainedSelectedAudioIds: [],
    });
  },
}));

export default useUntrainedAudioStore;
