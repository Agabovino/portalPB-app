// src/components/Dashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Article as ArticleIcon,
  CheckCircle as CheckIcon,
  Link as LinkIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

interface Estatisticas {
  resumo: {
    totalNoticias: number;
    totalRefatoradas: number;
    percentualRefatorado: string;
    totalURLs: number;
    urlsAtivas: number;
  };
  porCategoria: Array<{
    _id: string;
    total: number;
    refatoradas: number;
  }>;
  porDia: Array<{
    _id: string;
    total: number;
  }>;
  ultimasNoticias: Array<{
    titulo: string;
    categoria: string;
    coletadaEm: Date;
  }>;
  portaisProdutivos: Array<{
    _id: string;
    total: number;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (data.sucesso) {
        setStats(data.estatisticas);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Box>
      {/* Cards de resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ArticleIcon color="primary" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Total de Notícias
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.resumo.totalNoticias}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckIcon color="success" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Refatoradas
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.resumo.totalRefatoradas}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.resumo.percentualRefatorado}% do total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LinkIcon color="info" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  URLs Monitoradas
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.resumo.totalURLs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.resumo.urlsAtivas} ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Taxa de Sucesso
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {stats.resumo.percentualRefatorado}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={parseFloat(stats.resumo.percentualRefatorado)}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Notícias por categoria */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Por Categoria
            </Typography>
            <List>
              {stats.porCategoria.map((cat) => (
                <ListItem key={cat._id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{cat._id}</Typography>
                        <Chip size="small" label={cat.total} color="primary" />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(cat.refatoradas / cat.total) * 100}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {cat.refatoradas} refatoradas ({((cat.refatoradas / cat.total) * 100).toFixed(0)}%)
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Últimas notícias */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🕒 Últimas Coletadas
            </Typography>
            <List>
              {stats.ultimasNoticias.map((noticia, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={noticia.titulo}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip size="small" label={noticia.categoria} variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(noticia.coletadaEm).toLocaleString('pt-BR')}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Portais mais produtivos */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🏆 Portais Mais Produtivos
            </Typography>
            <Grid container spacing={2}>
              {stats.portaisProdutivos.map((portal, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {portal._id}
                      </Typography>
                      <Typography variant="h5" component="div" sx={{ mt: 1 }}>
                        {portal.total} notícias
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Gráfico de atividade (últimos 7 dias) */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📈 Atividade (Últimos 7 dias)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto' }}>
              {stats.porDia.map((dia) => (
                <Box
                  key={dia._id}
                  sx={{
                    textAlign: 'center',
                    minWidth: 100,
                  }}
                >
                  <Box
                    sx={{
                      height: dia.total * 3,
                      maxHeight: 200,
                      bgcolor: 'primary.main',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {dia.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(dia._id).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}