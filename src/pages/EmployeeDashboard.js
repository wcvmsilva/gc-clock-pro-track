import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccessTime as TimeIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Add as AddIcon,
  Check as CheckIcon
} from '@mui/icons-material';

// Componente principal do Dashboard do Funcionário
const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [workAddress, setWorkAddress] = useState('');
  const [project, setProject] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [locationError, setLocationError] = useState(false);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const [pendingRecords, setPendingRecords] = useState([]);
  
  // Lista de projetos (simulada)
  const projects = [
    { id: 1, name: 'Reforma Johnson' },
    { id: 2, name: 'Instalação Davidson' },
    { id: 3, name: 'Projeto Martinez' }
  ];
  
  // Verificar status de conexão
  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Carregar registros pendentes do armazenamento local
  useEffect(() => {
    const storedRecords = localStorage.getItem('pendingRecords');
    if (storedRecords) {
      setPendingRecords(JSON.parse(storedRecords));
    }
  }, []);
  
  // Sincronizar registros pendentes quando online
  useEffect(() => {
    if (!offlineMode && pendingRecords.length > 0) {
      syncPendingRecords();
    }
  }, [offlineMode, pendingRecords]);
  
  // Função para sincronizar registros pendentes
  const syncPendingRecords = () => {
    // Simulação de sincronização com o servidor
    setSnackbar({
      open: true,
      message: `Sincronizando ${pendingRecords.length} registros pendentes...`,
      severity: 'info'
    });
    
    // Em um ambiente real, isso seria uma chamada API
    setTimeout(() => {
      setPendingRecords([]);
      localStorage.removeItem('pendingRecords');
      setSnackbar({
        open: true,
        message: 'Todos os registros foram sincronizados com sucesso!',
        severity: 'success'
      });
    }, 2000);
  };
  
  // Timer para contagem de tempo trabalhado
  useEffect(() => {
    let interval = null;
    
    if (isWorking) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isWorking]);
  
  // Formatar tempo para exibição (HH:MM:SS)
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Obter localização atual
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(location);
        },
        error => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  };
  
  // Converter coordenadas em endereço legível (geocodificação reversa)
  const getAddressFromCoordinates = async (location) => {
    try {
      // Em um ambiente real, isso seria uma chamada à API de geocodificação
      // Como Google Maps Geocoding API ou similar
      
      // Simulação de geocodificação reversa
      return new Promise((resolve) => {
        setTimeout(() => {
          // Endereços simulados baseados em quadrantes
          const addresses = [
            '123 Main St, Charleston, SC',
            '456 Oak Ave, Charleston, SC',
            '789 Pine Rd, Charleston, SC',
            '321 Maple Blvd, Charleston, SC'
          ];
          
          // Selecionar um endereço baseado nas coordenadas
          const index = Math.floor(
            (Math.abs(location.lat * 10) + Math.abs(location.lng * 10)) % 4
          );
          
          resolve(addresses[index]);
        }, 500);
      });
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      return 'Endereço não disponível';
    }
  };
  
  // Iniciar trabalho
  const handleStartWork = async () => {
    setIsLoading(true);
    
    try {
      // Obter localização atual
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      // Obter endereço a partir das coordenadas
      const address = await getAddressFromCoordinates(location);
      setLocationAddress(address);
      setWorkAddress(address); // Pré-preencher com o endereço detectado
      
      // Iniciar timer
      const now = new Date();
      setStartTime(now);
      setIsWorking(true);
      setTimer(0);
      
      // Feedback ao usuário
      setSnackbar({
        open: true,
        message: 'Registro de trabalho iniciado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao iniciar trabalho:', error);
      setLocationError(true);
      setSnackbar({
        open: true,
        message: 'Erro ao obter localização. Verifique as permissões do navegador.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Finalizar trabalho
  const handleFinishWork = () => {
    setConfirmDialogOpen(true);
  };
  
  // Confirmar finalização de trabalho
  const confirmFinishWork = async () => {
    setIsLoading(true);
    setConfirmDialogOpen(false);
    
    try {
      // Obter localização final
      const endLocation = await getCurrentLocation();
      
      // Criar registro de trabalho
      const endTime = new Date();
      const totalSeconds = Math.floor((endTime - startTime) / 1000);
      
      const workRecord = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: totalSeconds,
        startLocation: currentLocation,
        endLocation: endLocation,
        workAddress: workAddress,
        project: project,
        notes: notes,
        synced: !offlineMode
      };
      
      // Se estiver offline, armazenar localmente
      if (offlineMode) {
        const updatedRecords = [...pendingRecords, workRecord];
        setPendingRecords(updatedRecords);
        localStorage.setItem('pendingRecords', JSON.stringify(updatedRecords));
        
        setSnackbar({
          open: true,
          message: 'Registro salvo localmente. Será sincronizado quando houver conexão.',
          severity: 'info'
        });
      } else {
        // Em um ambiente real, isso seria uma chamada API
        // Simulação de envio para o servidor
        console.log('Enviando registro para o servidor:', workRecord);
        
        setSnackbar({
          open: true,
          message: 'Registro enviado com sucesso!',
          severity: 'success'
        });
      }
      
      // Resetar estados
      setIsWorking(false);
      setTimer(0);
      setStartTime(null);
      setCurrentLocation(null);
      setLocationAddress('');
      setWorkAddress('');
      setProject('');
      setNotes('');
      
    } catch (error) {
      console.error('Erro ao finalizar trabalho:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao finalizar registro. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Abrir diálogo de detalhes
  const handleOpenDetails = () => {
    setDetailsDialogOpen(true);
  };
  
  // Fechar diálogo de detalhes
  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
  };
  
  // Alternar drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
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
          <ListItem button selected>
            <ListItemIcon><TimeIcon /></ListItemIcon>
            <ListItemText primary="Registro de Ponto" />
          </ListItem>
          <ListItem button>
            <ListItemIcon><HistoryIcon /></ListItemIcon>
            <ListItemText primary="Histórico" />
          </ListItem>
          <ListItem button>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="Meu Perfil" />
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
            GC Clock Pro Track
          </Typography>
          {offlineMode && (
            <Typography variant="body2" color="error" sx={{ mr: 2 }}>
              Modo Offline
            </Typography>
          )}
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {renderDrawer()}
      
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Olá, {user?.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Status: {isWorking ? 'Trabalhando' : 'Não trabalhando'}
          </Typography>
          
          {isWorking && (
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Typography variant="h3" component="div" gutterBottom>
                {formatTime(timer)}
              </Typography>
              
              {project && (
                <Typography variant="body1" gutterBottom>
                  Projeto: {project}
                </Typography>
              )}
              
              {locationAddress && (
                <Typography variant="body2" gutterBottom>
                  Local: {locationAddress}
                </Typography>
              )}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            {isLoading ? (
              <CircularProgress />
            ) : isWorking ? (
              <Button
                variant="contained"
                color="error"
                size="large"
                fullWidth
                startIcon={<CheckIcon />}
                onClick={handleFinishWork}
                disabled={isLoading}
              >
                FINALIZAR TRABALHO
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                startIcon={<TimeIcon />}
                onClick={handleStartWork}
                disabled={isLoading}
              >
                INICIAR TRABALHO
              </Button>
            )}
          </Box>
          
          {isWorking && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleOpenDetails}
              >
                Detalhes
              </Button>
              
              <Button
                variant="outlined"
                color="warning"
              >
                Pausar
              </Button>
            </Box>
          )}
        </Paper>
        
        {!isWorking && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Último registro:
              </Typography>
              <Typography variant="body1">
                Ontem, 8h30 - 17h45
              </Typography>
              <Typography variant="body2">
                Total: 8h15m
              </Typography>
            </CardContent>
          </Card>
        )}
        
        {pendingRecords.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {pendingRecords.length} registro(s) pendente(s) de sincronização
            {!offlineMode && (
              <Button 
                size="small" 
                onClick={syncPendingRecords}
                sx={{ ml: 2 }}
              >
                Sincronizar agora
              </Button>
            )}
          </Alert>
        )}
        
        {locationError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Não foi possível obter sua localização. Verifique as permissões do navegador.
          </Alert>
        )}
      </Container>
      
      {/* Diálogo de confirmação para finalizar trabalho */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Finalizar registro de trabalho?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Isso irá finalizar seu registro atual e calcular o tempo total trabalhado.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Não</Button>
          <Button onClick={confirmFinishWork} autoFocus>Sim</Button>
        </DialogActions>
      </Dialog>
      
      {/* Diálogo de detalhes do registro */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Detalhes do Registro</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Início: {startTime?.toLocaleTimeString('pt-BR')}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Tempo decorrido: {formatTime(timer)}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Endereço detectado:
              </Typography>
              <TextField
                fullWidth
                value={locationAddress}
                disabled
                variant="outlined"
                size="small"
                margin="dense"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Endereço do trabalho:
              </Typography>
              <TextField
                fullWidth
                value={workAddress}
                onChange={(e) => setWorkAddress(e.target.value)}
                variant="outlined"
                size="small"
                margin="dense"
                placeholder="Informe o endereço específico do trabalho"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Projeto:
              </Typography>
              <TextField
                select
                fullWidth
                value={project}
                onChange={(e) => setProject(e.target.value)}
                variant="outlined"
                size="small"
                margin="dense"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Selecione um projeto</option>
                {projects.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Observações:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                variant="outlined"
                size="small"
                margin="dense"
                placeholder="Adicione observações sobre o trabalho"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                fullWidth
              >
                Adicionar Foto
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Fechar</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleFinishWork}
          >
            Finalizar Trabalho
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeDashboard;
