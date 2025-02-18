// src/components/CategoryButtons.js
import React from 'react';
import { Button, Stack } from '@mui/material';

export const CategoryButtons = ({ selectedCategory, onCategoryChange }) => {
  const categories = ['ALL', 'ACADEMIC', 'HEALTH', 'ADMINISTRATIVE', 'STUDENT LIFE'];
  
  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {categories.map(category => (
        <Button
          key={category}
          variant={selectedCategory === category ? "contained" : "text"}
          onClick={() => onCategoryChange(category)}
          sx={{
            bgcolor: selectedCategory === category ? 'primary.main' : 'transparent',
            color: selectedCategory === category ? 'white' : 'text.primary',
            '&:hover': {
              bgcolor: selectedCategory === category ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
            },
            textTransform: 'uppercase',
            fontSize: '0.875rem',
            fontWeight: 500,
            minWidth: 'auto',
            padding: '6px 16px',
            borderRadius: '4px',
          }}
        >
          {category}
        </Button>
      ))}
    </Stack>
  );
};