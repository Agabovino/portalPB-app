// src/components/NewsCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NewsCard from './NewsCard';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { es } from 'date-fns/locale';

const theme = createTheme();

const mockNoticia = {
  _id: '1',
  titulo: 'Test Title',
  url: 'http://example.com',
  dataPublicacao: new Date(),
  categoria: 'Test Category',
  selecionada: false,
  refatorada: true,
  textoRefatorado: 'This is the refactored text. It is intentionally long to test the truncation. This text should be fully visible, but it is not. It is being cut off at 200 characters, which is the problem we are trying to solve. We will write a test to confirm this bug, and then we will fix it.',
};

describe('NewsCard', () => {
  it('should display the full refactored text when it is longer than 200 characters', () => {
    render(
      <ThemeProvider theme={theme}>
        <NewsCard noticia={mockNoticia} onToggleSelect={() => {}} onClick={() => {}} />
      </ThemeProvider>
    );

    const refactoredText = screen.getByText(/This is the refactored text/);
    expect(refactoredText).toBeInTheDocument();
    expect(refactoredText.textContent).toBe(mockNoticia.textoRefatorado);
  });
});
