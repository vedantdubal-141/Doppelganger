import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Mock User State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('styleforge_user');
    return saved ? JSON.parse(saved) : {
      id: "u_123456",
      username: "neon_runner",
      biometrics: null, // { height, weight, shoulderWidth, waist }
      savedOutfits: []
    };
  });

  // Persist user to localStorage when changed
  useEffect(() => {
    localStorage.setItem('styleforge_user', JSON.stringify(user));
  }, [user]);

  // Actions
  const updateBiometrics = (measurements) => {
    setUser(prev => ({
      ...prev,
      biometrics: measurements
    }));
  };

  const saveOutfit = (product) => {
    setUser(prev => {
      // Don't save duplicates
      if (prev.savedOutfits.some(item => item.id === product.id)) return prev;
      return {
        ...prev,
        savedOutfits: [...prev.savedOutfits, product]
      };
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

  return (
    <AuthContext.Provider value={{ user, updateBiometrics, saveOutfit, removeOutfit, hasCompleteProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
