import { create } from "zustand";

type SttSelectionState = {
  trainedSelectedFolders: Record<string, Array<number>>;
  untrainedSelectedFolders: Record<string, Array<number>>;
  setTrainedSelectedFolders: (folders: Record<string, Array<number>>) => void;
  setUntrainedSelectedFolders: (folders: Record<string, Array<number>>) => void;
  selectedAudioIds: Array<number>;
  setselectedAudioIds: (
    audios: Array<number> | ((prevSelected: Array<number>) => Array<number>)
  ) => void;

  clearTrainedSelections: () => void;
  clearUntrainedSelections: () => void;
};

const useSttSelectionStore = create<SttSelectionState>((set) => ({
  trainedSelectedFolders: {},
  untrainedSelectedFolders: {},
  selectedAudioIds: [],
  setTrainedSelectedFolders: (folders) => {
    set(() => ({
      trainedSelectedFolders: { ...folders },
    }));
  },

  setUntrainedSelectedFolders: (folders) => {
    set(() => ({
      untrainedSelectedFolders: { ...folders },
    }));
  },
  setselectedAudioIds: (audios) => {
    set((state) => ({
      selectedAudioIds:
        typeof audios === "function" ? audios(state.selectedAudioIds) : audios,
    }));
  },
  clearTrainedSelections: () => {
    set({ trainedSelectedFolders: {}, selectedAudioIds: [] });
  },

  clearUntrainedSelections: () => {
    set({ untrainedSelectedFolders: {}, selectedAudioIds: [] });
  },
}));

export default useSttSelectionStore;
