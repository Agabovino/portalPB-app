// ============================================
// COMPONENTE DE BUSCA AVANÇADA
// ============================================

// src/components/AdvancedSearch.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

interface SearchFilters {
  query: string;
  categoria: string;
  sentimento: string;
  dataInicio: string;
  dataFim: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

export default function AdvancedSearch({ onSearch }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categoria: '',
    sentimento: '',
    dataInicio: '',
    dataFim: '',
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    const emptyFilters = {
      query: '',
      categoria: '',
      sentimento: '',
      dataInicio: '',
      dataFim: '',
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchIcon color="primary" />
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Busca Avançada
          </Typography>
        </Box>
        {activeFiltersCount > 0 && (
          <Chip
            label={`${activeFiltersCount} filtro(s) ativo(s)`}
            color="primary"
            size="small"
            onDelete={handleClear}
          />
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Buscar por palavras-chave"
            placeholder="Ex: eleições, economia, tecnologia"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={filters.categoria}
              label="Categoria"
              onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="Política">Política</MenuItem>
              <MenuItem value="Economia">Economia</MenuItem>
              <MenuItem value="Tecnologia">Tecnologia</MenuItem>
              <MenuItem value="Esporte">Esporte</MenuItem>
              <MenuItem value="Entretenimento">Entretenimento</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Sentimento</InputLabel>
            <Select
              value={filters.sentimento}
              label="Sentimento"
              onChange={(e) => setFilters({ ...filters, sentimento: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="POSITIVO">Positivo</MenuItem>
              <MenuItem value="NEUTRO">Neutro</MenuItem>
              <MenuItem value="NEGATIVO">Negativo</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Data Início"
            type="date"
            value={filters.dataInicio}
            onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Data Fim"
            type="date"
            value={filters.dataFim}
            onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ fontWeight: 600 }}
          >
            Buscar
          </Button>
        </Grid>

        <Grid item xs={12} md={6}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<ClearIcon />}
            onClick={handleClear}
          >
            Limpar Filtros
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
