import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Grid,
  Link,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Card,
  CardMedia
} from '@mui/material';
import {
  LockOutlined as LockIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Manipuladores de eventos
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };
  
  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const user = await login({ email, password });
      
      // Redirecionar com base no tipo de usuário
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      setError('Credenciais inválidas. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para preencher credenciais de demonstração
  const fillDemoCredentials = (userType) => {
    if (userType === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('carlos@example.com');
      setPassword('carlos123');
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', mb: 4, borderRadius: 2, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="140"
            image="https://via.placeholder.com/400x140/0F1A20/C69C6D?text=GC+Clock+Pro+Track"
            alt="GC Clock Pro Track"
          />
        </Card>
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography component="h1" variant="h5">
              Acesso ao Sistema
            </Typography>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={handlePasswordChange}
              InputProps={{
                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControlLabel
              control={
                <Checkbox 
                  value="remember" 
                  color="primary" 
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                />
              }
              label="Lembrar-me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Esqueceu sua senha?
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, width: '100%' }}>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Demonstração:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => fillDemoCredentials('employee')}
              >
                Funcionário Demo
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => fillDemoCredentials('admin')}
              >
                Admin Demo
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          GC Clock Pro Track © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
