// src/components/VerificationFailed.js
import React from 'react';
import { Box, Typography } from '@mui/material';

export const VerificationFailed = () => {
  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Verification Failed
      </Typography>
      <Typography variant="body1">
        The verification link may have expired or is invalid. Please try registering again or contact support.
      </Typography>
    </Box>
  );
};
