// src/app/page.tsx
'use client';


import NotificationCenter from '@/components/NotificationCenter';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import URLInput from '@/components/URLInput';
import MonitoringPanel from '@/components/MonitoringPanel';
import NewsList from '@/components/NewsList';
import RefactorPanel from '@/components/RefactorPanel';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, color: '#1976d2' }}
          >
            📰 Monitor de Notícias com IA
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Monitoramento em tempo real com refatoração automática via OpenAI
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="🏠 Monitoramento" />
            <Tab label="📝 Notícias" />
            <Tab label="✨ Refatoradas" />
          </Tabs>
        </Paper>

        {/* Tab: Monitoramento */}
        {tabValue === 0 && (
          <Box>
            <URLInput onURLAdded={handleRefresh} />
            <MonitoringPanel onUpdate={handleRefresh} />
          </Box>
        )}

        {/* Tab: Notícias */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={9}>
              <NewsList
                refresh={refreshKey}
                onSelectChange={setSelectedIds}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <RefactorPanel
                selectedIds={selectedIds}
                onRefactorComplete={handleRefresh}
              />
            </Grid>
          </Grid>
        )}

        {/* Tab: Refatoradas */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              ✅ Notícias Refatoradas
            </Typography>
            <NewsList
              refresh={refreshKey}
              onSelectChange={() => {}}
            />
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ mt: 6, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">
            Desenvolvido com Next.js, Material UI e OpenAI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
