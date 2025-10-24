'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' }, // Blue for buttons
    secondary: { main: '#dc004e' }, // Red for delete
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;