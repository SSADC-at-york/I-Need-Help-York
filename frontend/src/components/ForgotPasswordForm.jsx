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
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LockReset } from '@mui/icons-material';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { requestPasswordReset } = useAuth(); // This should call your API endpoint

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, px: 2 }}>
      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <LockReset sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your email to receive a password reset link.
            </Typography>
          </Box>

          {error && (
            <Alert severity="success" sx={{ mb: 3 }}>
            If a matching email address was found, the password reset email has been sent to it. 
          </Alert>
          )}

          {submitted ? (
            <Alert severity="success" sx={{ mb: 3 }}>
            If a matching email address was found, the password reset email has been sent to it. 
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
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
                    'Send Reset Link'
                  )}
                </Button>
              </Stack>
            </form>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Remembered your password?{' '}
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

export default ForgotPasswordForm;