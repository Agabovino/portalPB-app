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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
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
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        🔍 Monitoramento Ativo
      </Typography>

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
        <List>
          {urls.map((item) => (
            <ListItem
              key={item.urlId}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
                bgcolor: item.pausado ? '#f5f5f5' : 'white',
              }}
              secondaryAction={
                <Box>
                  <Tooltip title="Atualizar agora">
                    <IconButton
                      edge="end"
                      onClick={() => handleRefresh(item.urlId)}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={item.pausado ? 'Reativar' : 'Pausar'}>
                    <IconButton
                      edge="end"
                      onClick={() => handleTogglePause(item.urlId, item.pausado)}
                      disabled={loading}
                      sx={{ mr: 1 }}
                    >
                      {item.pausado ? <PlayIcon /> : <PauseIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remover">
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(item.urlId)}
                      disabled={loading}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {item.url}
                    </Typography>
                    <Chip
                      label={item.pausado ? 'Pausado' : 'Ativo'}
                      color={item.pausado ? 'default' : 'success'}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      📊 {item.totalNoticias} notícias coletadas
                    </Typography>
                    {item.ultimaColeta && (
                      <Typography variant="body2" color="text.secondary">
                        <TimeIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                        Última coleta: {format(new Date(item.ultimaColeta), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </Typography>
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

