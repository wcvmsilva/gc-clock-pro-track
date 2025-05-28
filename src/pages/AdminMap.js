import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import {
  Box,
  Typography,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Map as MapIcon,
  People as PeopleIcon,
  Assignment as ProjectsIcon,
  Assessment as ReportsIcon,
  ExitToApp as LogoutIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Configuração do mapa
const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

const center = {
  lat: 34.8526, // Charleston, SC aproximadamente
  lng: -82.3940
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
};

// Componente principal do Mapa do Administrador
const AdminMap = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Carregar API do Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'YOUR_API_KEY' // Em produção, use uma chave real
  });
  
  // Estados
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('today');
  const [showTrajectory, setShowTrajectory] = useState(false);
  
  // Lista de funcionários (simulada)
  const employeesList = [
    { id: 1, name: 'Carlos Silva' },
    { id: 2, name: 'Maria Santos' },
    { id: 3, name: 'João Pereira' },
    { id: 4, name: 'Roberto Alves' }
  ];
  
  // Lista de projetos (simulada)
  const projectsList = [
    { id: 1, name: 'Reforma Johnson' },
    { id: 2, name: 'Instalação Davidson' },
    { id: 3, name: 'Projeto Martinez' }
  ];
  
  // Carregar dados dos funcionários
  useEffect(() => {
    // Simulação de carregamento de dados
    const fetchEmployeeLocations = () => {
      setIsLoading(true);
      
      // Em um ambiente real, isso seria uma chamada API
      setTimeout(() => {
        // Dados simulados de localização dos funcionários
        const mockData = [
          {
            id: 1,
            name: 'Carlos Silva',
            status: 'working', // working, paused, finished, alert
            project: 'Reforma Johnson',
            startTime: '08:30',
            currentTime: '12:15',
            location: {
              lat: 34.8526 + (Math.random() * 0.05 - 0.025),
              lng: -82.3940 + (Math.random() * 0.05 - 0.025)
            },
            address: '123 Main St, Charleston, SC',
            notes: 'Instalação de drywall no segundo andar',
            trajectory: [
              {
                lat: 34.8526 + (Math.random() * 0.05 - 0.025),
                lng: -82.3940 + (Math.random() * 0.05 - 0.025),
                time: '08:30'
              },
              {
                lat: 34.8526 + (Math.random() * 0.05 - 0.025),
                lng: -82.3940 + (Math.random() * 0.05 - 0.025),
                time: '10:15'
              },
              {
                lat: 34.8526 + (Math.random() * 0.05 - 0.025),
                lng: -82.3940 + (Math.random() * 0.05 - 0.025),
                time: '12:15'
              }
            ]
          },
          {
            id: 2,
            name: 'Maria Santos',
            status: 'working',
            project: 'Projeto Martinez',
            startTime: '09:00',
            currentTime: '12:15',
            location: {
              lat: 34.8526 + (Math.random() * 0.05 - 0.025),
              lng: -82.3940 + (Math.random() * 0.05 - 0.025)
            },
            address: '456 Oak Ave, Charleston, SC',
            notes: 'Supervisão da equipe',
            trajectory: [
              {
                lat: 34.8526 + (Math.random() * 0.05 - 0.025),
                lng: -82.3940 + (Math.random() * 0.05 - 0.025),
                time: '09:00'
              },
              {
                lat: 34.8526 + (Math.random() * 0.05 - 0.025),
                lng: -82.3940 + (Math.random() * 0.05 - 0.025),
                time: '12:15'
              }
            ]
          },
          {
            id: 3,
            name: 'João Pereira',
            status: 'paused',
            project: 'Reforma Johnson',
            startTime: '08:45',
            currentTime: '12:15',
            location: {
              lat: 34.8526 + (Math.random() * 0.05 - 0.025),
              lng: -82.3940 + (Math.random() * 0.05 - 0.025)
            },
            address: '789 Pine Rd, Charleston, SC',
            notes: 'Pausa para almoço',
            trajectory: [
              {
                lat: 34.8526 + (Math.random() * 0.05 - 0.025),
                lng: -82.3940 + (Math.random() * 0.05 - 0.025),
                time: '08:45'
              },
              {
                lat: 34.8526 + (Math.random() * 0.05 - 0.025),
                lng: -82.3940 + (Math.random() * 0.05 - 0.025),
                time: '12:15'
              }
            ]
          },
          {
            id: 4,
            name: 'Roberto Alves',
            status: 'alert',
            project: 'Instalação Davidson',
            startTime: '08:00',
            currentTime: '12:15',
            location: {
              lat: 34.8526 + (Math.random() * 0.05 - 0.025),
              lng: -82.3940 + (Math.random() * 0.05 - 0.025)
            },
            address: '321 Maple Blvd, Charleston, SC',
            notes: 'Possível problema com instalação elétrica',
            trajectory: [
              {
                lat: 34.8526 + (Math.random() * 0.05 - 0.025),
                lng: -82.3940 + (Math.random() * 0.05 - 0.025),
                time: '08:00'
              },
              {
                lat: 34.8526 + (Math.random() * 0.05 - 0.025),
                lng: -82.3940 + (Math.random() * 0.05 - 0.025),
                time: '10:30'
              },
              {
                lat: 34.8526 + (Math.random() * 0.05 - 0.025),
                lng: -82.3940 + (Math.random() * 0.05 - 0.025),
                time: '12:15'
              }
            ]
          }
        ];
        
        setEmployees(mockData);
        setIsLoading(false);
      }, 1500);
    };
    
    fetchEmployeeLocations();
  }, []);
  
  // Filtrar funcionários com base nos critérios selecionados
  const filteredEmployees = employees.filter(employee => {
    // Filtro por funcionário
    if (filterEmployee !== 'all' && employee.id !== parseInt(filterEmployee)) {
      return false;
    }
    
    // Filtro por projeto
    if (filterProject !== 'all' && employee.project !== filterProject) {
      return false;
    }
    
    // Filtro por status
    if (filterStatus !== 'all' && employee.status !== filterStatus) {
      return false;
    }
    
    // Filtro por data (simulado, todos são de hoje)
    return true;
  });
  
  // Obter cor do marcador com base no status
  const getMarkerColor = (status) => {
    switch (status) {
      case 'working':
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'paused':
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'alert':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'finished':
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    }
  };
  
  // Atualizar dados
  const handleRefresh = () => {
    setIsLoading(true);
    setSelectedEmployee(null);
    
    // Simular atualização de dados
    setTimeout(() => {
      // Atualizar posições aleatoriamente
      const updatedEmployees = employees.map(emp => ({
        ...emp,
        location: {
          lat: emp.location.lat + (Math.random() * 0.01 - 0.005),
          lng: emp.location.lng + (Math.random() * 0.01 - 0.005)
        }
      }));
      
      setEmployees(updatedEmployees);
      setIsLoading(false);
    }, 1000);
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
          <ListItem button onClick={() => navigateTo('/admin')}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button selected onClick={() => navigateTo('/admin/map')}>
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
  
  // Renderizar mapa
  const renderMap = () => {
    if (loadError) {
      return <Typography color="error">Erro ao carregar o mapa</Typography>;
    }
    
    if (!isLoaded) {
      return <CircularProgress />;
    }
    
    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        options={options}
      >
        {filteredEmployees.map((employee) => (
          <Marker
            key={employee.id}
            position={employee.location}
            icon={getMarkerColor(employee.status)}
            onClick={() => setSelectedEmployee(employee)}
          />
        ))}
        
        {selectedEmployee && (
          <InfoWindow
            position={selectedEmployee.location}
            onCloseClick={() => setSelectedEmployee(null)}
          >
            <Box sx={{ p: 1, maxWidth: 200 }}>
              <Typography variant="subtitle1">{selectedEmployee.name}</Typography>
              <Typography variant="body2">
                <strong>Projeto:</strong> {selectedEmployee.project}
              </Typography>
              <Typography variant="body2">
                <strong>Horário:</strong> {selectedEmployee.startTime} - atual
              </Typography>
              <Typography variant="body2">
                <strong>Local:</strong> {selectedEmployee.address}
              </Typography>
              {selectedEmployee.notes && (
                <Typography variant="body2">
                  <strong>Observações:</strong> {selectedEmployee.notes}
                </Typography>
              )}
              <Box sx={{ mt: 1 }}>
                <Button size="small" variant="outlined">Ligar</Button>
                <Button size="small" sx={{ ml: 1 }}>Detalhes</Button>
              </Box>
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  };
  
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
            Mapa de Localização da Equipe
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {renderDrawer()}
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {/* Filtros */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, mb: { xs: 2, md: 0 } }}>
              <Typography variant="h6" gutterBottom>
                <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Filtros
              </Typography>
              
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Funcionário</InputLabel>
                <Select
                  value={filterEmployee}
                  label="Funcionário"
                  onChange={(e) => setFilterEmployee(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {employeesList.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Projeto</InputLabel>
                <Select
                  value={filterProject}
                  label="Projeto"
                  onChange={(e) => setFilterProject(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  {projectsList.map((proj) => (
                    <MenuItem key={proj.id} value={proj.name}>{proj.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="working">Trabalhando</MenuItem>
                  <MenuItem value="paused">Em pausa</MenuItem>
                  <MenuItem value="alert">Alerta</MenuItem>
                  <MenuItem value="finished">Finalizado</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Data</InputLabel>
                <Select
                  value={filterDate}
                  label="Data"
                  onChange={(e) => setFilterDate(e.target.value)}
                >
                  <MenuItem value="today">Hoje</MenuItem>
                  <MenuItem value="yesterday">Ontem</MenuItem>
                  <MenuItem value="week">Esta semana</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </Select>
              </FormControl>
              
              {filterDate === 'custom' && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Data Início"
                    type="date"
                    size="small"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Data Fim"
                    type="date"
                    size="small"
                    fullWidth
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>
              )}
              
              <FormControl fullWidth margin="normal">
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? 'Atualizando...' : 'Atualizar Mapa'}
                </Button>
              </FormControl>
            </Paper>
          </Grid>
          
          {/* Mapa */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Localização da Equipe
                </Typography>
                <Box>
                  <Chip 
                    label="Trabalhando" 
                    size="small" 
                    sx={{ bgcolor: '#4caf50', color: 'white', mr: 1 }} 
                  />
                  <Chip 
                    label="Em pausa" 
                    size="small" 
                    sx={{ bgcolor: '#ff9800', color: 'white', mr: 1 }} 
                  />
                  <Chip 
                    label="Alerta" 
                    size="small" 
                    sx={{ bgcolor: '#f44336', color: 'white', mr: 1 }} 
                  />
                  <Chip 
                    label="Finalizado" 
                    size="small" 
                    sx={{ bgcolor: '#2196f3', color: 'white' }} 
                  />
                </Box>
              </Box>
              
              <Box sx={{ height: '500px', position: 'relative' }}>
                {isLoading && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 1
                  }}>
                    <CircularProgress />
                  </Box>
                )}
                {renderMap()}
              </Box>
            </Paper>
          </Grid>
          
          {/* Detalhes do funcionário selecionado */}
          {selectedEmployee && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detalhes do Funcionário
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6">{selectedEmployee.name}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {selectedEmployee.status === 'working' && 'Trabalhando desde '}
                          {selectedEmployee.status === 'paused' && 'Em pausa desde '}
                          {selectedEmployee.status === 'alert' && 'Alerta desde '}
                          {selectedEmployee.status === 'finished' && 'Finalizado às '}
                          {selectedEmployee.startTime}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Projeto:</strong> {selectedEmployee.project}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Local:</strong> {selectedEmployee.address}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <strong>Observações:</strong> {selectedEmployee.notes || 'Nenhuma observação'}
                        </Typography>
                        
                        <Box sx={{ mt: 2 }}>
                          <Button variant="contained" size="small" sx={{ mr: 1 }}>
                            Ligar
                          </Button>
                          <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                            Enviar Mensagem
                          </Button>
                          <Button variant="outlined" size="small">
                            Ver Histórico
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Atividade Recente
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Hoje:</strong>
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            • Iniciou trabalho às {selectedEmployee.startTime} no projeto {selectedEmployee.project}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            • Registrou observação: "{selectedEmployee.notes}"
                          </Typography>
                          {selectedEmployee.status === 'paused' && (
                            <Typography variant="body2" gutterBottom>
                              • Entrou em pausa às 12:00
                            </Typography>
                          )}
                        </Box>
                        
                        <Typography variant="body2" gutterBottom>
                          <strong>Ontem:</strong>
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          • Trabalhou das 08:30 às 17:45 (8h15m)
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          • Completou 95% das tarefas planejadas
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminMap;
