// src/app/layout.tsx
import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'Monitor de Notícias com IA',
  description: 'Plataforma de monitoramento e refatoração de notícias com OpenAI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeRegistry>
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1300 }}>
            <ThemeSwitcher />
          </Box>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
