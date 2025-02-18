// src/components/ResourceList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { CategoryButtons } from './CategoryButtons';
import { ResourceCard } from './ResourceCard';

export const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const { getAuthHeader } = useAuth();

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/resources', {
          headers: {
            ...getAuthHeader(),
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch resources');
        }

        const data = await response.json();
        setResources(data);
        setError(null);
      } catch (err) {
        setError('Failed to load resources. Please try again later.');
        console.error('Error loading resources:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [getAuthHeader]);
  
  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.offered_by.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || resource.category.toUpperCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ width: '100%', p: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4,
          fontSize: '2rem',
          fontWeight: 500,
        }}
      >
        Browse Resources
      </Typography>

      <Stack spacing={3} sx={{ mb: 4, width: '100%' }}>
        <TextField
          fullWidth
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '4px',
            }
          }}
        />

        <CategoryButtons 
          selectedCategory={selectedCategory} 
          onCategoryChange={setSelectedCategory}
        />
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredResources.map(resource => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <ResourceCard resource={resource} />
              </Grid>
            ))}
          </Grid>

          {filteredResources.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" variant="h6">
                No resources found matching your criteria.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ResourceList;