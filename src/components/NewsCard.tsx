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
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Launch as LaunchIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon, // Importar o ícone de lixeira
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
  onDelete?: (id: string) => void; // Nova prop para exclusão
}

export default function NewsCard({ noticia, onToggleSelect, onClick, onDelete }: NewsCardProps) {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggleSelect(noticia._id, event.target.checked);
  };

  const urlObj = new URL(noticia.url);
  const domain = urlObj.hostname.replace('www.', ''); // Remove 'www.' for cleaner display

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: noticia.selecionada ? '2px solid #1976d2' : '1px solid #e0e0e0',
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: onClick ? 8 : 6,
          transform: `translateY(${onClick ? '-6px' : '-4px'})`,
        },
      }}
    >
      {/* Checkbox de seleção */}
      {!onClick && (
        <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}>
          <Checkbox
            checked={noticia.selecionada}
            onChange={handleCheckboxChange}
            sx={{
              bgcolor: 'white',
              borderRadius: '4px',
              '&:hover': { bgcolor: 'white' },
            }}
          />
        </Box>
      )}

      {/* Status de refatoração */}
      {noticia.refatorada && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <Chip
            icon={<CheckIcon />}
            label="Refatorada"
            color="success"
            size="small"
          />
        </Box>
      )}

      {/* Imagem */}
      {noticia.imagemUrl && (
        <CardMedia
          component="img"
          height="200"
          image={noticia.imagemUrl}
          alt={noticia.titulo}
          sx={{ objectFit: 'cover' }}
        />
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Categoria */}
        <Chip
          label={noticia.categoria}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 1 }}
        />

        {/* Título */}
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          {noticia.titulo}
        </Typography>

        {/* Data e Fonte */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
          <CalendarIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption">
            {format(new Date(noticia.dataPublicacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            {' | '}
            {domain}
          </Typography>
        </Box>

        {/* Resumo */}
        {noticia.resumo && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {noticia.resumo}
          </Typography>
        )}

        {/* Texto refatorado (se aplicável) */}
        {onClick && noticia.textoRefatorado && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {noticia.textoRefatorado.substring(0, 300)}
              {noticia.textoRefatorado.length > 300 && '...'}
            </Typography>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Link href={noticia.url} target="_blank" rel="noopener noreferrer" underline="none">
          <Button size="small" startIcon={<LaunchIcon />}>
            Ver Original
          </Button>
        </Link>
        {onClick && onDelete && (
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation(); // Evita que o clique no botão ative o clique do card
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
