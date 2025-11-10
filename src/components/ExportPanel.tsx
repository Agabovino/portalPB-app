// src/components/ExportPanel.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';

export default function ExportPanel() {
  const [formato, setFormato] = useState('json');
  const [categoria, setCategoria] = useState('todas');
  const [refatorada, setRefatorada] = useState('todas');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleExport = async () => {
    try {
      setLoading(true);
      setErro('');

      let url = `/api/export?formato=${formato}`;
      if (categoria !== 'todas') url += `&categoria=${categoria}`;
      if (refatorada !== 'todas') url += `&refatorada=${refatorada}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Erro ao exportar');
      }

      // Download do arquivo
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `noticias_${Date.now()}.${formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

    } catch (error) {
      setErro('Erro ao exportar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        📥 Exportar Dados
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Formato</InputLabel>
          <Select
            value={formato}
            label="Formato"
            onChange={(e) => setFormato(e.target.value)}
          >
            <MenuItem value="json">JSON</MenuItem>
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="txt">TXT</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={categoria}
            label="Categoria"
            onChange={(e) => setCategoria(e.target.value)}
          >
            <MenuItem value="todas">Todas</MenuItem>
            <MenuItem value="Política">Política</MenuItem>
            <MenuItem value="Economia">Economia</MenuItem>
            <MenuItem value="Tecnologia">Tecnologia</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={refatorada}
            label="Status"
            onChange={(e) => setRefatorada(e.target.value)}
          >
            <MenuItem value="todas">Todas</MenuItem>
            <MenuItem value="true">Apenas Refatoradas</MenuItem>
            <MenuItem value="false">Apenas Não Refatoradas</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? 'Exportando...' : 'Exportar'}
        </Button>

        {erro && (
          <Alert severity="error">{erro}</Alert>
        )}
      </Box>
    </Paper>
  );
}