import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister, logoutUser as apiLogout, getToken } from '../services/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const DEFAULT_GUEST = {
  id: null,
  username: 'guest',
  email: null,
  biometrics: null,
  savedOutfits: [],
  isGuest: true,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('styleforge_user');
      let parsed = saved ? JSON.parse(saved) : DEFAULT_GUEST;

      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Auto-authenticate as "Rishab" solely on the local device
      if (isLocalhost) {
        if (!localStorage.getItem('styleforge_token')) {
          localStorage.setItem('styleforge_token', 'local_dev_token_rishab');
        }
        if (parsed.isGuest) {
           parsed = {
             id: 1,
             username: 'Rishab',
             email: 'rishab@local.dev',
             biometrics: null,
             savedOutfits: [],
             isGuest: false,
           };
           localStorage.setItem('styleforge_user', JSON.stringify(parsed));
        }
      }
      
      // The user requested to change the locally saved "neon_runner" to "rishab"
      if (parsed.username && parsed.username.toLowerCase() === 'neon_runner') {
        parsed.username = 'Rishab';
        localStorage.setItem('styleforge_user', JSON.stringify(parsed));
      }
      
      return parsed;
    } catch {
      return DEFAULT_GUEST;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Persist user to localStorage on change
  useEffect(() => {
    localStorage.setItem('styleforge_user', JSON.stringify(user));
  }, [user]);

  // ── Auth Actions ──────────────────────────────

  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await apiLogin(email, password);
      setUser({ ...data.user, isGuest: false, savedOutfits: data.user.savedOutfits || [] });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (username, email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await apiRegister(username, email, password);
      setUser({ ...data.user, isGuest: false, biometrics: null, savedOutfits: [] });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(DEFAULT_GUEST);
  };

  // ── Profile Actions ──────────────────────────

  const updateBiometrics = (measurements) => {
    setUser(prev => ({ ...prev, biometrics: measurements }));
  };

  const saveOutfit = (product) => {
    setUser(prev => {
      if (prev.savedOutfits.some(item => item.id === product.id)) return prev;
      return { ...prev, savedOutfits: [...prev.savedOutfits, product] };
    });
  };

  const removeOutfit = (productId) => {
    setUser(prev => ({
      ...prev,
      savedOutfits: prev.savedOutfits.filter(item => item.id !== productId)
    }));
  };

  const hasCompleteProfile = () => {
    return user.biometrics &&
      user.biometrics.height &&
      user.biometrics.weight &&
      user.biometrics.shoulderWidth &&
      user.biometrics.waist;
  };

  const isAuthenticated = () => !user.isGuest && !!getToken();

  return (
    <AuthContext.Provider value={{
      user,
      authLoading,
      authError,
      login,
      register,
      logout,
      updateBiometrics,
      saveOutfit,
      removeOutfit,
      hasCompleteProfile,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

