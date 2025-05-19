import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      console.log('AuthProvider: Checking stored credentials...');
      if (user && token) {
        console.log('AuthProvider: Found stored credentials');
        if (!user.id && user._id) user.id = user._id;
        setCurrentUser(user);
      } else {
        console.log('AuthProvider: No stored credentials found');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('AuthProvider: Error initializing auth state:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  const login = (token, user) => {
    console.log('AuthProvider: Login called with user:', user);
    try {
      if (!user.id && user._id) user.id = user._id;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      console.log('AuthProvider: Login successful');
    } catch (error) {
      console.error('AuthProvider: Error during login:', error);
      throw new Error('Failed to store login information');
    }
  };

  const logout = () => {
    console.log('AuthProvider: Logout called');
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      console.log('AuthProvider: Logout successful');
    } catch (error) {
      console.error('AuthProvider: Error during logout:', error);
      throw new Error('Failed to clear login information');
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 