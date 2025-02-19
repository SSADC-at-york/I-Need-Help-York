// src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Divider,
  Paper,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Check,
  Close,
  Edit,
  Delete,
  Add,
  Person,
  LocationOn,
  Link as LinkIcon,
  CalendarToday,
  Security,
  SupervisorAccount
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [mainSection, setMainSection] = useState('resources'); // 'resources' or 'users'
  
  const [editDialog, setEditDialog] = useState({
    open: false,
    resource: null,
    isNew: false
  });
  
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    resource: null
  });
  
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    resource: null,
    action: null,
    reason: ''
  });

  const { user, getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const categories = ['ACADEMIC', 'HEALTH', 'ADMINISTRATIVE', 'STUDENT LIFE'];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadResources();
    if (user.role === 'root') {
      loadUsers();
    }
  }, [user, navigate, currentTab]);

  // Resource loading and management functions
  const loadResources = async () => {
    try {
      setLoading(true);
      let endpoint = currentTab === 0 
        ? '/api/resources/admin/all'
        : `/api/resources/by-status/${getStatusFromTab(currentTab)}`;

      const response = await fetch(`https://ineedhelpbackend.onrender.com/${endpoint}`, {
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to load resources');
      const data = await response.json();
      setResources(data);
      setError('');
    } catch (err) {
      setError('Failed to load resources');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // User management functions
  const loadUsers = async () => {
    try {
      const response = await fetch('https://ineedhelpbackend.onrender.com/api/admin/users', {
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`https://ineedhelpbackend.onrender.com/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Failed to update user role');
      await loadUsers();
    } catch (err) {
      setError('Failed to update user role');
      console.error(err);
    }
  };

  const getStatusFromTab = (tab) => {
    switch(tab) {
      case 1: return 'pending';
      case 2: return 'approved';
      case 3: return 'rejected';
      default: return '';
    }
  };

  // Resource management handlers
  const handleCreateResource = async (resourceData) => {
    try {
      const response = await fetch('https://ineedhelpbackend.onrender.com/api/resources/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(resourceData)
      });

      if (!response.ok) throw new Error('Failed to create resource');
      await loadResources();
      setEditDialog({ open: false, resource: null, isNew: false });
    } catch (err) {
      setError('Failed to create resource');
      console.error(err);
    }
  };

  const handleUpdateResource = async (id, resourceData) => {
    try {
      const response = await fetch(`https://ineedhelpbackend.onrender.com/api/resources/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(resourceData)
      });

      if (!response.ok) throw new Error('Failed to update resource');
      await loadResources();
      setEditDialog({ open: false, resource: null, isNew: false });
    } catch (err) {
      setError('Failed to update resource');
      console.error(err);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      const response = await fetch(`https://ineedhelpbackend.onrender.com/api/resources/admin/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to delete resource');
      await loadResources();
      setDeleteDialog({ open: false, resource: null });
    } catch (err) {
      setError('Failed to delete resource');
      console.error(err);
    }
  };

  const handleReviewSubmit = async () => {
    const { resource, action, reason } = reviewDialog;
    try {
      const response = await fetch(`https://ineedhelpbackend.onrender.com/api/resources/${resource.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          rejection_reason: action === 'reject' ? reason : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to review resource');
      await loadResources();
      setReviewDialog({ open: false, resource: null, action: null, reason: '' });
    } catch (err) {
      setError('Failed to review resource');
      console.error(err);
    }
  };

// Resource Form Component
const ResourceForm = ({ resource, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    resource || {
      name: '',
      category: '',
      description: '',
      offered_by: '',
      location: '',
      link: ''
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          fullWidth
        />
        <TextField
          select
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          fullWidth
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          multiline
          rows={4}
          fullWidth
        />
        <TextField
          label="Offered By"
          value={formData.offered_by}
          onChange={(e) => setFormData({ ...formData, offered_by: e.target.value })}
          required
          fullWidth
        />
        <TextField
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          fullWidth
        />
        <TextField
          label="Link"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          fullWidth
        />
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained">
            {resource ? 'Save Changes' : 'Create Resource'}
          </Button>
        </Box>
      </Stack>
    </form>
  );
};

// Resource Card Component
const ResourceCard = ({ resource }) => (
  <Card variant="outlined" sx={{ mb: 2 }}>
    <CardContent>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6">{resource.name}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip label={resource.category} color="primary" size="small" />
              <Chip
                label={resource.status}
                color={
                  resource.status === 'approved' ? 'success' :
                  resource.status === 'rejected' ? 'error' : 'warning'
                }
                size="small"
              />
            </Stack>
          </Box>
          <Box>
            <IconButton onClick={() => setEditDialog({ open: true, resource, isNew: false })}>
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => setDeleteDialog({ open: true, resource })}>
              <Delete />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="body2">{resource.description}</Typography>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person fontSize="small" />
            <Typography variant="body2">Offered by: {resource.offered_by}</Typography>
          </Box>
          {resource.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn fontSize="small" />
              <Typography variant="body2">{resource.location}</Typography>
            </Box>
          )}
          {resource.link && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinkIcon fontSize="small" />
              <Typography variant="body2">
                <a href={resource.link} target="_blank" rel="noopener noreferrer">
                  Resource Link
                </a>
              </Typography>
            </Box>
          )}
        </Stack>

        {resource.status === 'pending' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setReviewDialog({
                open: true,
                resource,
                action: 'reject',
                reason: ''
              })}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => setReviewDialog({
                open: true,
                resource,
                action: 'approve',
                reason: ''
              })}
            >
              Approve
            </Button>
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

// User Management Section
const UserManagementSection = () => (
  <Paper sx={{ p: 3, mt: 3 }}>
    <Typography variant="h5" gutterBottom>
      User Management
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Manage user roles and permissions
    </Typography>

    <Stack spacing={2}>
      {users.map((userData) => (
        <Card key={userData.id} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{userData.username}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {userData.email}
                </Typography>
                <Chip
                  label={userData.role}
                  color={userData.role === 'root' ? 'error' : userData.role === 'admin' ? 'primary' : 'default'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              {userData.role !== 'root' && (
                <FormControl sx={{ minWidth: 120 }}>
                  <Select
                    value={userData.role}
                    onChange={(e) => handleUpdateUserRole(userData.id, e.target.value)}
                    size="small"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  </Paper>
);

return (
  <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Admin Panel</Typography>
        <Stack direction="row" spacing={2}>
          {user?.role === 'root' && (
            <Button
              variant={mainSection === 'users' ? 'contained' : 'outlined'}
              startIcon={<SupervisorAccount />}
              onClick={() => setMainSection('users')}
            >
              User Management
            </Button>
          )}
          <Button
            variant={mainSection === 'resources' ? 'contained' : 'outlined'}
            startIcon={<Add />}
            onClick={() => {
              setMainSection('resources');
              setEditDialog({ open: true, resource: null, isNew: true });
            }}
          >
            Add Resource
          </Button>
        </Stack>
      </Box>

      {mainSection === 'resources' && (
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="All Resources" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      )}
    </Paper>

    {error && (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    )}

    {mainSection === 'resources' ? (
      loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : resources.length === 0 ? (
        <Alert severity="info">
          No resources found for this category
        </Alert>
      ) : (
        <Stack spacing={2}>
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </Stack>
      )
    ) : (
      <UserManagementSection />
    )}

    {/* Dialogs */}
    <Dialog
      open={editDialog.open}
      onClose={() => setEditDialog({ open: false, resource: null, isNew: false })}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {editDialog.isNew ? 'Create New Resource' : 'Edit Resource'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <ResourceForm
          resource={editDialog.resource}
          onSubmit={(formData) => {
            if (editDialog.isNew) {
              handleCreateResource(formData);
            } else {
              handleUpdateResource(editDialog.resource.id, formData);
            }
          }}
          onCancel={() => setEditDialog({ open: false, resource: null, isNew: false })}
        />
      </DialogContent>
    </Dialog>

    <Dialog
      open={deleteDialog.open}
      onClose={() => setDeleteDialog({ open: false, resource: null })}
    >
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete "{deleteDialog.resource?.name}"? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteDialog({ open: false, resource: null })}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => handleDeleteResource(deleteDialog.resource.id)}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog
      open={reviewDialog.open}
      onClose={() => setReviewDialog({ open: false, resource: null, action: null, reason: '' })}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {reviewDialog.action === 'approve' ? 'Approve Resource' : 'Reject Resource'}
      </DialogTitle>
      <DialogContent>
        {reviewDialog.action === 'reject' && (
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={4}
            value={reviewDialog.reason}
            onChange={(e) => setReviewDialog({ ...reviewDialog, reason: e.target.value })}
            required
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setReviewDialog({ open: false, resource: null, action: null, reason: '' })}>
          Cancel
        </Button>
        <Button
          onClick={handleReviewSubmit}
          variant="contained"
          color={reviewDialog.action === 'approve' ? 'success' : 'error'}
          disabled={reviewDialog.action === 'reject' && !reviewDialog.reason}
        >
          {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);
};

export default AdminPanel;