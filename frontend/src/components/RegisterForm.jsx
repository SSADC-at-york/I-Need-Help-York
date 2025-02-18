import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Stack,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PersonAdd } from '@mui/icons-material';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Update form data on input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Validate passwords match and email domain
  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (
      !formData.email.endsWith('@yorku.ca') &&
      !formData.email.endsWith('@my.yorku.ca')
    ) {
      setError('Please use your York University email address (@yorku.ca or @my.yorku.ca)');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Stop if validation fails
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Call the register function from AuthContext
      await register(formData.email, formData.username, formData.password);
      // Show success message
      setRegistered(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, px: 2 }}>
      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <PersonAdd sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              Create an Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Register with your York University email
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Success Alert (after registration) */}
          {registered ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Registration successful! A verification email has been sent to your address.
              Please verify your account before logging in.
              <Box sx={{ mt: 2 }}>
                <Link component={RouterLink} to="/login" underline="hover">
                  Go to Login
                </Link>
              </Box>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {/* Email Field */}
                <TextField
                  fullWidth
                  label="York University Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  helperText="Use your @yorku.ca or @my.yorku.ca email"
                />

                {/* Username Field */}
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                />

                {/* Password Field */}
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />

                {/* Confirm Password Field */}
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ py: 1.2, position: 'relative' }}
                >
                  {loading ? (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: 'white',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginTop: '-12px',
                        marginLeft: '-12px',
                      }}
                    />
                  ) : (
                    'Register'
                  )}
                </Button>
              </Stack>
            </form>
          )}

          {/* Login Link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  fontWeight: 500,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
