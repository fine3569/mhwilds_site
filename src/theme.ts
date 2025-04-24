// src/theme.ts

import { grey } from '@mui/material/colors';
import { ThemeOptions } from '@mui/material/styles';

export const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      // ページ全体の背景
      default: mode === 'dark' ? grey[900] : grey[100],
      // Card や Paper の背景
      paper: mode === 'dark' ? grey[800] : '#ffffff',
    },
  },
  typography: {
    fontFamily: ['Roboto', 'Noto Sans JP', 'sans-serif'].join(', '),
  },
});

export default getDesignTokens;
