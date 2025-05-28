import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Map as MapIcon,
  People as PeopleIcon,
  Assignment as ProjectsIcon,
  Assessment as ReportsIcon,
  ExitToApp as LogoutIcon,
  SmartToy as AssistantIcon
} from '@mui/icons-material';

// Componente principal do Dashboard do Administrador
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dados simulados para o dashboard
  const dashboardData = {
    activeEmployees: 8,
    totalEmployees: 12,
    hoursToday: 78.5,
    hoursYesterday: 70.2,
    activeProjects: 5,
    pendingApprovals: 2,
    alerts: 3
  };
  
  // Alternar drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Navegar para outras páginas
  const navigateTo = (path) => {
    navigate(path);
  };
  
  // Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Renderizar drawer
  const renderDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer}
    >
      <Box
        sx={{ width: 250 }}
        role="presentation"
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6">GC Clock Pro Track</Typography>
          <Typography variant="body2">{user?.name}</Typography>
        </Box>
        <Divider />
        <List>
          <ListItem button selected onClick={() => navigateTo('/admin')}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigateTo('/admin/map')}>
            <ListItemIcon><MapIcon /></ListItemIcon>
            <ListItemText primary="Mapa de Equipe" />
          </ListItem>
          <ListItem button onClick={() => navigateTo('/admin/employees')}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Funcionários" />
          </ListItem>
          <ListItem button onClick={() => navigateTo('/admin/projects')}>
            <ListItemIcon><ProjectsIcon /></ListItemIcon>
            <ListItemText primary="Projetos" />
          </ListItem>
          <ListItem button onClick={() => navigateTo('/admin/reports')}>
            <ListItemIcon><ReportsIcon /></ListItemIcon>
            <ListItemText primary="Relatórios" />
          </ListItem>
          <ListItem button>
            <ListItemIcon><AssistantIcon /></ListItemIcon>
            <ListItemText primary="Assistente IA" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {renderDrawer()}
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Cards de resumo */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Funcionários Ativos
              </Typography>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {dashboardData.activeEmployees}/{dashboardData.totalEmployees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ↑ 2 desde ontem
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Horas Hoje
              </Typography>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {dashboardData.hoursToday}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ↑ {Math.round((dashboardData.hoursToday / dashboardData.hoursYesterday - 1) * 100)}% vs ontem
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Projetos Ativos
              </Typography>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {dashboardData.activeProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ↔ sem alteração
              </Typography>
            </Paper>
          </Grid>
          
          {/* Mapa resumido */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Localização da Equipe
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigateTo('/admin/map')}
                >
                  Expandir
                </Button>
              </Box>
              
              <Box 
                sx={{ 
                  height: 300, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Button 
                  variant="contained"
                  onClick={() => navigateTo('/admin/map')}
                >
                  Ver Mapa Completo
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Atividade recente e alertas */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Atividade Recente
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Carlos iniciou trabalho" 
                    secondary="08:30, Projeto Johnson" 
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Maria finalizou trabalho" 
                    secondary="17:45, Projeto Martinez" 
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="João adicionou observação" 
                    secondary="16:20, Projeto Davidson" 
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button size="small">Ver Todas</Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Alertas
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Projeto Davidson está 3 dias atrasado" 
                    secondary="Verificar com equipe responsável" 
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="2 solicitações de correção pendentes" 
                    secondary="Requerem aprovação do administrador" 
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Funcionário Roberto não registrou saída ontem" 
                    secondary="Verificar registro manual" 
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                >
                  Resolver
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          {/* Assistente IA */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Insights do Assistente IA
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Otimização de Recursos
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Baseado nos dados de horas trabalhadas, recomendo redistribuir a equipe no Projeto Johnson para melhorar a eficiência em 15%.
                      </Typography>
                      <Box>
                        <Button size="small" variant="contained" sx={{ mr: 1 }}>
                          Implementar
                        </Button>
                        <Button size="small" variant="outlined">
                          Ver Detalhes
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Alerta de Cronograma
                      </Typography>
                      <Typography variant="body2" paragraph>
                        O Projeto Davidson está atualmente 3 dias atrasado em relação ao cronograma planejado. Recomendo alocar 2 funcionários adicionais nos próximos 5 dias.
                      </Typography>
                      <Box>
                        <Button size="small" variant="contained" sx={{ mr: 1 }}>
                          Implementar
                        </Button>
                        <Button size="small" variant="outlined">
                          Ver Detalhes
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  startIcon={<AssistantIcon />}
                >
                  Abrir Assistente IA
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
