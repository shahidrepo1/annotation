import { create } from "zustand";

type AudioStore = {
  trainedSelectedFolders: Record<string, Array<number>>;
  trainedSelectedAudios: Record<string, Array<{ id: number; name: string }>>;
  trainedSelectedAudioIds: Array<number>;
  redHighlightFolders: Record<"trained" | "untrained", Array<string>>;

  setTrainedSelectedFolders: (folders: Record<string, Array<number>>) => void;
  setTrainedSelectedAudios: (
    audios: Record<string, Array<{ id: number; name: string }>>
  ) => void;
  setTrainedSelectedAudioIds: (
    audios: Array<number> | ((prevSelected: Array<number>) => Array<number>)
  ) => void;
  clearSelections: () => void;

  setRedHighlight: (status: "trained" | "untrained", folder: string) => void;
  removeRedHighlight: (status: "trained" | "untrained", folder: string) => void;
  resetHighlight: (status?: "trained" | "untrained") => void;
};

const useTrainedAudioStore = create<AudioStore>((set) => ({
  trainedSelectedFolders: {},
  trainedSelectedAudios: {},
  trainedSelectedAudioIds: [],
  redHighlightFolders: {
    trained: [],
    untrained: [],
  },

  setTrainedSelectedFolders: (newFolders) => {
    set((state) => {
      return {
        trainedSelectedFolders: {
          ...state.trainedSelectedFolders,
          ...newFolders,
        },
      };
    });
  },

  setTrainedSelectedAudios: (newAudios) => {
    set((state) => ({
      trainedSelectedAudios: {
        ...state.trainedSelectedAudios,
        ...newAudios,
      },
    }));
  },

  setTrainedSelectedAudioIds: (audios) => {
    set((state) => ({
      trainedSelectedAudioIds:
        typeof audios === "function"
          ? audios(state.trainedSelectedAudioIds)
          : audios,
    }));
  },

  clearSelections: () => {
    set({
      trainedSelectedFolders: {},
      trainedSelectedAudios: {},
      trainedSelectedAudioIds: [],
    });
  },

  setRedHighlight: (status, folder) => {
    set((state) => ({
      redHighlightFolders: {
        ...state.redHighlightFolders,
        [status]: [...new Set([...state.redHighlightFolders[status], folder])],
      },
    }));
  },

  removeRedHighlight: (status, folder) => {
    set((state) => ({
      redHighlightFolders: {
        ...state.redHighlightFolders,
        [status]: state.redHighlightFolders[status].filter((f) => f !== folder),
      },
    }));
  },

  resetHighlight: (status) => {
    set((state) => ({
      redHighlightFolders: status
        ? {
            ...state.redHighlightFolders,
            [status]: [],
          }
        : {
            trained: [],
            untrained: [],
          },
    }));
  },
}));

export default useTrainedAudioStore;
