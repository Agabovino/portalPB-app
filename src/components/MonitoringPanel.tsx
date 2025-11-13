// src/components/MonitoringPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Link,
} from '@mui/material';
import {
  DeleteOutline,
  PauseCircleOutline,
  PlayCircleOutline,
  Refresh,
  BarChart,
  Update,
  Search,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSSE } from '@/hooks/useSSE';

interface MonitoredURL {
  urlId: string;
  url: string;
  ativo: boolean;
  pausado: boolean;
  ultimaColeta?: Date;
  totalNoticias: number;
}

interface MonitoringPanelProps {
  onUpdate: () => void;
}

export default function MonitoringPanel({ onUpdate }: MonitoringPanelProps) {
  const [urls, setUrls] = useState<MonitoredURL[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { lastMessage } = useSSE('/api/events');

  useEffect(() => {
    loadURLs();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      const relevantEvents = [
        'collection_completed',
        'new_article',
        'monitoring_started',
        'monitoring_stopped',
      ];
      if (relevantEvents.includes(lastMessage.type)) {
        loadURLs();
      }
    }
  }, [lastMessage]);

  const loadURLs = async () => {
    try {
      const response = await fetch('/api/monitor');
      const data = await response.json();
      
      if (data.sucesso) {
        setUrls(data.status);
      }
    } catch (error) {
      console.error('Erro ao carregar URLs:', error);
    }
  };

  const handleRefresh = async (urlId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlId }),
      });

      const data = await response.json();

      if (data.sucesso) {
        // A atualização será feita via SSE, mas podemos forçar aqui também
        await loadURLs();
        onUpdate();
      } else {
        setErro(data.erro);
      }
    } catch (error) {
      setErro('Erro ao atualizar URL');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (urlId: string) => {
    if (!confirm('Tem certeza que deseja remover esta URL?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/urls?id=${urlId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.sucesso) {
        await loadURLs();
        onUpdate();
      } else {
        setErro(data.erro);
      }
    } catch (error) {
      setErro('Erro ao remover URL');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async (urlId: string, pausado: boolean) => {
    try {
      setLoading(true);
      const response = await fetch('/api/urls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlId, pausado: !pausado }),
      });

      const data = await response.json();

      if (data.sucesso) {
        await loadURLs();
        onUpdate();
      } else {
        setErro(data.erro);
      }
    } catch (error) {
      setErro('Erro ao atualizar status');
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
        <Search color="primary" />
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Monitoramento Ativo
        </Typography>
      </Box>

      {erro && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro('')}>
          {erro}
        </Alert>
      )}

      {urls.length === 0 ? (
        <Alert severity="info">
          Nenhuma URL sendo monitorada no momento. Adicione uma URL acima para começar.
        </Alert>
      ) : (
        <List sx={{ p: 0 }}>
          {urls.map((item) => (
            <ListItem
              key={item.urlId}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1.5,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'flex-start',
              }}
              secondaryAction={
                <Box sx={{ alignSelf: { xs: 'flex-end', sm: 'center' }, mt: { xs: 1, sm: 0 } }}>
                  <Tooltip title="Atualizar agora">
                    <IconButton
                      onClick={() => handleRefresh(item.urlId)}
                      disabled={loading}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={item.pausado ? 'Reativar' : 'Pausar'}>
                    <IconButton
                      onClick={() => handleTogglePause(item.urlId, item.pausado)}
                      disabled={loading}
                    >
                      {item.pausado ? <PlayCircleOutline /> : <PauseCircleOutline />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remover">
                    <IconButton
                      onClick={() => handleDelete(item.urlId)}
                      disabled={loading}
                      color="error"
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Link href={item.url} target="_blank" rel="noopener noreferrer" variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                      {item.url}
                    </Link>
                    <Chip
                      label={item.pausado ? 'Pausado' : 'Ativo'}
                      color={item.pausado ? 'default' : 'success'}
                      size="small"
                      sx={{
                        ...(item.pausado ? {
                          bgcolor: 'grey.200',
                          color: 'grey.800',
                        } : {
                          bgcolor: 'success.light',
                          color: 'success.dark',
                        }),
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <BarChart sx={{ fontSize: 16 }} />
                      <Typography variant="body2">
                        {item.totalNoticias} notícias coletadas
                      </Typography>
                    </Box>
                    {item.ultimaColeta && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <Update sx={{ fontSize: 16 }} />
                        <Typography variant="body2">
                          Última coleta: {format(new Date(item.ultimaColeta), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

