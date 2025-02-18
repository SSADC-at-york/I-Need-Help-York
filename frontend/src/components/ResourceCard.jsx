// src/components/ResourceCard.js
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Link,
  Stack
} from '@mui/material';
import {
  LocationOn,
  Book,
  Business
} from '@mui/icons-material';

export const ResourceCard = ({ resource }) => {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        '&:hover': { 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }
      }}
    >
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
            {resource.name}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'inline-block',
              bgcolor: 'primary.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              mt: 1,
              fontSize: '0.75rem'
            }}
          >
            {resource.category}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {resource.description}
        </Typography>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Offered by: {resource.offered_by}
            </Typography>
          </Box>

          {resource.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {resource.location}
              </Typography>
            </Box>
          )}

          {resource.link && (
            <Link
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              <Book fontSize="small" />
              <Typography variant="body2">Visit Resource</Typography>
            </Link>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};