// src/components/NewsContentModal.tsx
'use client';

import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface NewsContentModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
};

export default function NewsContentModal({
  open,
  onClose,
  title,
  content,
}: NewsContentModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="news-content-modal-title"
    >
      <Paper sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography id="news-content-modal-title" variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
          <Typography variant="body1" component="p">
            {content}
          </Typography>
        </Box>
      </Paper>
    </Modal>
  );
}
