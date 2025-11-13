import { createTheme } from '@mui/material/styles';
import { Inter, Playfair_Display } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1d4ed8',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: {
      fontFamily: playfairDisplay.style.fontFamily,
    },
    h2: {
      fontFamily: playfairDisplay.style.fontFamily,
    },
    h3: {
      fontFamily: playfairDisplay.style.fontFamily,
    },
    h4: {
      fontFamily: playfairDisplay.style.fontFamily,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // A lighter blue for dark mode
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h1: {
      fontFamily: playfairDisplay.style.fontFamily,
    },
    h2: {
      fontFamily: playfairDisplay.style.fontFamily,
    },
    h3: {
      fontFamily: playfairDisplay.style.fontFamily,
    },
    h4: {
      fontFamily: playfairDisplay.style.fontFamily,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export { lightTheme, darkTheme };
