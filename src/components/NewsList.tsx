// src/components/NewsList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import NewsCard from './NewsCard';

interface Noticia {
  _id: string;
  titulo: string;
  url: string;
  dataPublicacao: Date;
  categoria: string;
  imagemUrl?: string;
  resumo?: string;
  selecionada: boolean;
  refatorada: boolean;
  textoRefatorado?: string;
}

interface NewsListProps {
  refresh: number;
  onSelectChange: (selectedIds: string[]) => void;
}

export default function NewsList({ refresh, onSelectChange }: NewsListProps) {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroRefatorada, setFiltroRefatorada] = useState('todas');
  const [categorias, setCategorias] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    loadNoticias();
  }, [refresh, filtroCategoria, filtroRefatorada, page]);

  const loadNoticias = async () => {
    try {
      setLoading(true);
      setErro('');

      let url = `/api/noticias?limit=${itemsPerPage}&skip=${(page - 1) * itemsPerPage}`;
      
      if (filtroCategoria !== 'todas') {
        url += `&categoria=${filtroCategoria}`;
      }
      
      if (filtroRefatorada !== 'todas') {
        url += `&refatorada=${filtroRefatorada}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.sucesso) {
        setNoticias(data.noticias);
        setTotal(data.total);

        // Extrair categorias únicas
        const cats = [...new Set(data.noticias.map((n: Noticia) => n.categoria))];
        setCategorias(cats);
      } else {
        setErro(data.erro);
      }
    } catch (error) {
      setErro('Erro ao carregar notícias');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = async (id: string, selected: boolean) => {
    try {
      const response = await fetch('/api/noticias', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticiaId: id, selecionada: selected }),
      });

      if (response.ok) {
        setNoticias((prev) =>
          prev.map((n) => (n._id === id ? { ...n, selecionada: selected } : n))
        );

        // Notificar componente pai
        const selecionadas = noticias
          .filter((n) => (n._id === id ? selected : n.selecionada))
          .map((n) => n._id);
        onSelectChange(selecionadas);
      }
    } catch (error) {
      console.error('Erro ao atualizar seleção:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filtros */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={filtroCategoria}
            label="Categoria"
            onChange={(e) => {
              setFiltroCategoria(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="todas">Todas</MenuItem>
            {categorias.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filtroRefatorada}
            label="Status"
            onChange={(e) => {
              setFiltroRefatorada(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="todas">Todas</MenuItem>
            <MenuItem value="true">Refatoradas</MenuItem>
            <MenuItem value="false">Não Refatoradas</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erro}
        </Alert>
      )}

      {noticias.length === 0 ? (
        <Alert severity="info">
          Nenhuma notícia encontrada. Aguarde a coleta automática ou verifique os filtros.
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mostrando {noticias.length} de {total} notícias
          </Typography>

          <Grid container spacing={3}>
            {noticias.map((noticia) => (
              <Grid item xs={12} sm={6} md={4} key={noticia._id}>
                <NewsCard
                  noticia={noticia}
                  onToggleSelect={handleToggleSelect}
                />
              </Grid>
            ))}
          </Grid>

          {/* Paginação */}
          {total > itemsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={Math.ceil(total / itemsPerPage)}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
