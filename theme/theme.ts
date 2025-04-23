import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#d81b60' },
  },
  typography: {
    fontFamily: ['"Noto Sans JP"', 'Inter', 'sans-serif'].join(','),
    h1: { fontSize: '2rem', fontWeight: 600 },
    body1: { fontSize: '1rem' },
  },
});

export default theme;
