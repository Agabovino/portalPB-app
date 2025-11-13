// src/components/RefactorPanel.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';

interface RefactorPanelProps {
  selectedIds: string[];
  onRefactorComplete: () => void;
}

export default function RefactorPanel({ selectedIds, onRefactorComplete }: RefactorPanelProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleRefactor = async () => {
    if (selectedIds.length === 0) {
      setErro('Nenhuma notícia selecionada');
      return;
    }

    try {
      setLoading(true);
      setErro('');
      setSucesso('');

      const response = await fetch('/api/refatorar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticiaIds: selectedIds }),
      });

      const data = await response.json();

      if (data.sucesso) {
        setSucesso(`${data.processadas} notícias refatoradas com sucesso!`);
        
        if (data.erros.length > 0) {
          setErro(`Alguns erros ocorreram: ${data.erros.join(', ')}`);
        }

        onRefactorComplete();
      } else {
        setErro(data.erro || 'Erro ao refatorar notícias');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={0} 
      variant="outlined"
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        mb: 3,
        bgcolor: 'background.paper',
        position: 'sticky', 
        top: 16 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <AutoAwesome color="primary" />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Refatoração com IA
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Notícias selecionadas:
        </Typography>
        <Chip label={selectedIds.length} color="primary" />
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
        onClick={handleRefactor}
        disabled={loading || selectedIds.length === 0}
        sx={{ fontWeight: 600 }}
      >
        {loading ? 'Refatorando...' : 'Refatorar Selecionadas'}
      </Button>

      {erro && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {erro}
        </Alert>
      )}

      {sucesso && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {sucesso}
        </Alert>
      )}

      <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 A IA irá corrigir erros, melhorar a clareza e adaptar o tom das notícias selecionadas.
        </Typography>
      </Box>
    </Paper>
  );
}
