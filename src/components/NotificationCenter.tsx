'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Snackbar,
  Alert,
  Badge,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSSE } from '@/hooks/useSSE';

export default function NotificationCenter() {
  const { lastMessage, isConnected } = useSSE();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'new_article') {
      const newNotif = {
        id: Date.now(),
        type: 'success',
        message: `Nova notícia: ${lastMessage.noticia.titulo}`,
        timestamp: new Date(),
        data: lastMessage.noticia,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setCurrentNotification(newNotif.message);
      setOpenSnackbar(true);
      setUnreadCount((prev) => prev + 1);

      // Tocar som de notificação (opcional)
      playNotificationSound();
    }
  }, [lastMessage]);

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {
      // Ignorar se o áudio não puder ser tocado
    });
  };

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    setUnreadCount(0);
  };

  return (
    <>
      {/* Ícone de notificações */}
      <IconButton
        color="inherit"
        onClick={handleOpenDrawer}
        sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Indicador de conexão */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 80,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: isConnected ? 'success.main' : 'error.main',
            animation: isConnected ? 'pulse 2s infinite' : 'none',
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {isConnected ? 'Ao vivo' : 'Desconectado'}
        </Typography>
      </Box>

      {/* Snackbar para notificações */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          variant="filled"
        >
          {currentNotification}
        </Alert>
      </Snackbar>

      {/* Drawer com histórico */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Notificações</Typography>
            <IconButton size="small" onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              Nenhuma notificação ainda
            </Typography>
          ) : (
            <List>
              {notifications.map((notif) => (
                <ListItem key={notif.id} divider>
                  <ListItemText
                    primary={notif.message}
                    secondary={notif.timestamp.toLocaleTimeString('pt-BR')}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      {/* Animação CSS para o indicador */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
