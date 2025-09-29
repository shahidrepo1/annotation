import { create } from "zustand";

type SttFile = {
  id: number;
  chunkName: string;
  transcription: string;
};

type SttStore = {
  data: Array<SttFile>;
  setData: (newData: Array<SttFile>) => void;
};

export const useDataStore = create<SttStore>((set) => ({
  data: [],
  setData: (newData) => {
    set({ data: newData });
  },
}));

export default useDataStore;
