import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const USERS = [
  { id: 'wellington', name: 'Wellington Silva', email: 'wscolumbia25@gmail.com', password: 'gc2026admin', role: 'admin',    avatar: 'W' },
  { id: 'moacir',     name: 'Moacir Santana',   email: 'moacir@gc.com',          password: 'moacir2026',  role: 'employee', avatar: 'M' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('gc_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = (email, password) => new Promise((resolve, reject) => {
    const found = USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...safe } = found;
      localStorage.setItem('gc_user', JSON.stringify(safe));
      setUser(safe);
      resolve(safe);
    } else {
      reject(new Error('Email ou senha incorretos'));
    }
  });

  const logout = () => { localStorage.removeItem('gc_user'); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
