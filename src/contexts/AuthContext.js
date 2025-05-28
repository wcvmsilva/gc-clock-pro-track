import React, { createContext, useState, useContext, useEffect } from 'react';

// Criando o contexto de autenticação
const AuthContext = createContext(null);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Função de login
  const login = (userData) => {
    // Simulação de autenticação
    // Em um ambiente real, isso seria uma chamada API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Usuários de teste
        const users = [
          { id: 1, name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
          { id: 2, name: 'Carlos Silva', email: 'carlos@example.com', password: 'carlos123', role: 'employee' },
          { id: 3, name: 'Maria Santos', email: 'maria@example.com', password: 'maria123', role: 'employee' }
        ];

        const user = users.find(
          u => u.email === userData.email && u.password === userData.password
        );

        if (user) {
          // Remover a senha antes de armazenar
          const { password, ...userWithoutPassword } = user;
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          setUser(userWithoutPassword);
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Credenciais inválidas'));
        }
      }, 500);
    });
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Valores fornecidos pelo contexto
  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
