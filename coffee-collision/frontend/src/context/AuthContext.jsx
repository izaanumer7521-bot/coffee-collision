import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('cc_token'));
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) { setUser(null); setReady(true); return; }
    api('/auth/me', { token })
      .then((d) => setUser(d.user))
      .catch(() => { localStorage.removeItem('cc_token'); setToken(null); })
      .finally(() => setReady(true));
  }, [token]);

  const signIn = async (path, body) => {
    const d = await api(path, { method: 'POST', body });
    localStorage.setItem('cc_token', d.token);
    setToken(d.token);
    setUser(d.user);
    return d.user;
  };
  const login = (email, password) => signIn('/auth/login', { email, password });
  const register = (name, email, password) => signIn('/auth/register', { name, email, password });
  const logout = () => { localStorage.removeItem('cc_token'); setToken(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ token, user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
