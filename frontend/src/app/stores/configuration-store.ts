import { create } from 'zustand';
import { ConfigurationPayload, FinishCategoryKey, FinishItem } from '../types/cpq';

interface ConfigurationState {
  selections: Partial<Record<FinishCategoryKey, FinishItem>>;
  setSelection: (category: FinishCategoryKey, item: FinishItem) => void;
  clearSelection: (category: FinishCategoryKey) => void;
  getPayload: () => ConfigurationPayload;
}

export const useConfigurationStore = create<ConfigurationState>((set, get) => ({
  selections: {},
  setSelection: (category, item) =>
    set((state) => {
      if (item.category !== category) {
        console.warn(
          `Attempted to assign item category "${item.category}" to selection slot "${category}". Ignoring mismatched item.`,
        );
        return {};
      }

      return {
        selections: {
          ...state.selections,
          [category]: item,
        },
      };
    }),
  clearSelection: (category) =>
    set((state) => {
      const nextSelections = { ...state.selections };
      delete nextSelections[category];
      return { selections: nextSelections };
    }),
  getPayload: () => ({
    generatedAt: new Date().toISOString(),
    selections: { ...get().selections },
  }),
}));
