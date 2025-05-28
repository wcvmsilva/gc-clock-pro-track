import React from 'react';
import { Typography, Box, Container, Paper, Button } from '@mui/material';

const NotFound = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h1" color="primary" gutterBottom>
            404
          </Typography>
          <Typography variant="h5" gutterBottom>
            Página não encontrada
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            A página que você está procurando não existe ou foi movida.
          </Typography>
          <Button variant="contained" href="/" color="primary">
            Voltar para a página inicial
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;
