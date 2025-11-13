// src/components/URLInput.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';

interface URLInputProps {
  onURLAdded: () => void;
}

export default function URLInput({ onURLAdded }: URLInputProps) {
  const [url, setUrl] = useState('');
  const [categoria, setCategoria] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!url || !categoria) {
      setErro('URL e categoria são obrigatórios');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          categoria,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
        }),
      });

      const data = await response.json();

      if (!data.sucesso) {
        setErro(data.erro || 'Erro ao adicionar URL');
        return;
      }

      setSucesso('URL adicionada com sucesso! Monitoramento iniciado.');
      setUrl('');
      setCategoria('');
      setDataInicio('');
      setDataFim('');
      
      onURLAdded();
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
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AddCircleOutline color="primary" />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Adicionar Portal de Notícias
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="URL do Portal *"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Categoria *"
              placeholder="Ex: Política, Esportes"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data Início (Opcional)"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Data Fim (Opcional)"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutline />}
              disabled={loading}
              fullWidth
              sx={{ fontWeight: 600 }}
            >
              {loading ? 'Adicionando...' : 'Iniciar Monitoramento'}
            </Button>
          </Grid>
        </Grid>
      </form>

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
    </Paper>
  );
}
