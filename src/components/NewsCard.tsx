// src/components/NewsCard.tsx
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Checkbox,
  Chip,
  Box,
  Button,
  Link,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Launch as LaunchIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

interface NewsCardProps {
  noticia: Noticia;
  onToggleSelect: (id: string, selected: boolean) => void;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

export default function NewsCard({ noticia, onToggleSelect, onClick, onDelete }: NewsCardProps) {
  const theme = useTheme();
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggleSelect(noticia._id, event.target.checked);
  };

  const urlObj = new URL(noticia.url);
  const domain = urlObj.hostname.replace('www.', '');

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: `1px solid ${noticia.selecionada ? theme.palette.primary.main : theme.palette.divider}`,
        bgcolor: 'background.paper',
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[onClick ? 8 : 4],
          transform: `translateY(${onClick ? '-4px' : '-2px'})`,
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      {!onClick && (
        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
          <Checkbox
            checked={noticia.selecionada}
            onChange={handleCheckboxChange}
            sx={{
              p: 0.5,
              bgcolor: 'background.paper',
              borderRadius: 1,
              '&:hover': { bgcolor: 'background.default' },
            }}
          />
        </Box>
      )}

      {noticia.refatorada && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <Chip
            icon={<CheckIcon sx={{ color: '!important', ml: '6px' }} />}
            label="Refatorada"
            color="success"
            size="small"
            sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600 }}
          />
        </Box>
      )}

      {noticia.imagemUrl && (
        <CardMedia
          component="img"
          height="180"
          image={noticia.imagemUrl}
          alt={noticia.titulo}
          sx={{ objectFit: 'cover' }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Chip
          label={noticia.categoria}
          size="small"
          sx={{ 
            mb: 1.5, 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText', 
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            letterSpacing: '0.5px',
          }}
        />

        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
          {noticia.titulo}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'text.secondary' }}>
          <CalendarIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
            {format(new Date(noticia.dataPublicacao), "dd MMM yyyy", { locale: ptBR })}
            {' | '}
            {domain}
          </Typography>
        </Box>

        {noticia.resumo && (
          <Typography variant="body2" color="text.secondary">
            {noticia.resumo}
          </Typography>
        )}

        {onClick && noticia.textoRefatorado && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.secondary' }}>
              {noticia.textoRefatorado.substring(0, 200)}
              {noticia.textoRefatorado.length > 200 && '...'}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
        <Button size="small" startIcon={<LaunchIcon />} href={noticia.url} target="_blank" rel="noopener noreferrer">
          Ver Original
        </Button>
        {onClick && onDelete && (
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(noticia._id);
            }}
          >
            Excluir
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
