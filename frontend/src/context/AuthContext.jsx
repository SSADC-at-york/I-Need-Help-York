import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // On mount, check for an existing token
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetchUserProfile(token);
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const userData = await response.json();
      setUser(userData);
      setError(null);
      return userData;
    } catch (err) {
      setUser(null);
      setError('Authentication failed');
      localStorage.removeItem('token');
      throw err;
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      await fetchUserProfile(data.access_token);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, username, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
      const data = await response.json();
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  // Request a password reset link
  const requestPasswordReset = async (email) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to request password reset');
      }
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  // Optionally, reset the password using a token and a new password
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Password reset failed');
      }
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  // Helper to get the auth header for API calls
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    getAuthHeader,
    requestPasswordReset,
    resetPassword,
    isAuthenticated: !!user,
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for protecting routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !user) {
        navigate('/login');
      }
    }, [user, loading, navigate]);

    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Loading...
        </div>
      );
    }

    return user ? <WrappedComponent {...props} /> : null;
  };
};

export default AuthContext;
