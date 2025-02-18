// src/components/VerificationSuccess.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link } from '@mui/material';

export const VerificationSuccess = () => {
  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Email Verified Successfully!
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Your account is now verified. You can now log in.
      </Typography>
      <Link component={RouterLink} to="/login" underline="hover">
        Go to Login
      </Link>
    </Box>
  );
};
