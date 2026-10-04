import { darkColors as coreDark, lightColors as coreLight, type Palette as CorePalette } from '@danbro96/lupira-tokens-core/color';

/** The shared estate core plus MTG's own status semantics. */
export interface Palette extends CorePalette {
  warning: string;
  success: string;
  /** Backdrop behind a destructive/error notice. */
  dangerBg: string;
}

export const lightColors: Palette = {
  ...coreLight,
  warning: '#5b4b18',
  success: '#1f7a4d',
  dangerBg: '#fbe9e7',
};

export const darkColors: Palette = {
  ...coreDark,
  warning: '#d8b24a',
  success: '#5fd49b',
  dangerBg: '#2a1414',
};
