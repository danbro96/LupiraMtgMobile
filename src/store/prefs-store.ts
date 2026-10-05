import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const KEY_DEBUG = 'lupira.mtg.debugEnabled';

type PrefsState = {
  loaded: boolean;
  /** Shows the developer rows in Settings (scan debug log, API endpoint). */
  debugEnabled: boolean;
  load: () => Promise<void>;
  setDebugEnabled: (value: boolean) => Promise<void>;
};

export const usePrefs = create<PrefsState>(set => ({
  loaded: false,
  debugEnabled: false,

  load: async () => {
    const debug = await SecureStore.getItemAsync(KEY_DEBUG);
    set({ loaded: true, debugEnabled: debug === '1' });
  },

  setDebugEnabled: async debugEnabled => {
    set({ debugEnabled });
    await SecureStore.setItemAsync(KEY_DEBUG, debugEnabled ? '1' : '0');
  },
}));
