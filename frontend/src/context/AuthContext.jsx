import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão do localStorage ao carregar
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedEmail = localStorage.getItem('user_email');
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setUser({ email: savedEmail });
    }
    setLoading(false);
  }, []);

  /**
   * Autentica o usuário via POST /auth/login (x-www-form-urlencoded).
   * Armazena token e e-mail no localStorage.
   */
  async function login(email, senha) {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', senha);

    const response = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user_email', email);
    setToken(access_token);
    setUser({ email });
    return response.data;
  }

  /**
   * Registra novo usuário via POST /auth/register.
   */
  async function register(email, senha) {
    const response = await api.post('/auth/register', { email, senha });
    return response.data;
  }

  /**
   * Encerra a sessão, limpa estado e localStorage.
   */
  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
