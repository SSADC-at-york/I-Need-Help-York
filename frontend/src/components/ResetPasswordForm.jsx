import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LockReset } from '@mui/icons-material';

export const ResetPasswordForm = () => {
  const { resetPassword } = useAuth(); // Make sure resetPassword is in your AuthContext
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Read the token from the URL query string

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid or missing token.');
      return;
    }

    setLoading(true);
    try {
      // Call our AuthContext function to reset the password
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If password reset was successful, show a confirmation message
  if (success) {
    return (
      <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, px: 2 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Password reset successful! You may now log in with your new password.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, px: 2 }}>
      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <LockReset sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              Reset Your Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter a new password to complete the reset
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="New Password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
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
                  'Reset Password'
                )}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
