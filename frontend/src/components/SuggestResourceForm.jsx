// src/components/SuggestResourceForm.jsx
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
  MenuItem,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SuggestResourceForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    offered_by: '',
    location: '',
    link: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = ['ACADEMIC', 'HEALTH', 'ADMINISTRATIVE', 'STUDENT LIFE'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ineedhelpbackend.onrender.com//api/resources/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          status: 'pending'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit resource suggestion');
      }

      setSuccess(true);
      setFormData({
        name: '',
        category: '',
        description: '',
        offered_by: '',
        location: '',
        link: ''
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit resource suggestion');
      console.error('Error submitting resource:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">
          Please log in to suggest resources.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Card elevation={2}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Suggest a Resource
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your suggestion will be reviewed by administrators before being published.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Resource suggestion submitted successfully! Redirecting...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Resource Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                multiline
                rows={4}
              />

              <TextField
                fullWidth
                label="Offered By"
                name="offered_by"
                value={formData.offered_by}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label="Location (Optional)"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                label="Link (Optional)"
                name="link"
                value={formData.link}
                onChange={handleChange}
                type="url"
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Suggestion'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SuggestResourceForm;