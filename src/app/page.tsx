// src/app/page.tsx
'use client';

import React, { useState } from 'react';
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
import { Feed, Home as HomeIcon, Description, AutoAwesome, CheckCircle } from '@mui/icons-material';

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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 4, sm: 6, md: 8 } }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
            <Feed sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, color: 'text.primary', typography: { xs: 'h4', sm: 'h3' } }}
            >
              Monitor de Notícias com IA
            </Typography>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            Monitoramento em tempo real com refatoração automática via OpenAI
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab icon={<HomeIcon />} iconPosition="start" label="Monitoramento" />
            <Tab icon={<Description />} iconPosition="start" label="Notícias" />
            <Tab icon={<AutoAwesome />} iconPosition="start" label="Refatoradas" />
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
                filterByActiveUrls={true}
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
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: 'text.primary' }}>
              <CheckCircle color="success" /> Notícias Refatoradas
            </Typography>
            <NewsList
              refresh={refreshKey}
              onSelectChange={() => {}}
              showRefactoredOnly={true}
            />
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ mt: 8, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">
            Desenvolvido com Next.js, Material UI e OpenAI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
