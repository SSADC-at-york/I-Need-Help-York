const API_BASE_URL = 'http://localhost:8000/api';

// Fetch all resources (approved and others, depending on your backend logic)
export const fetchResources = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/`);
    if (!response.ok) {
      throw new Error('Failed to fetch resources');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

// Create a new resource (e.g., for seeding or admin-created resources)
export const createResource = async (resourceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resourceData),
    });
    if (!response.ok) {
      throw new Error('Failed to create resource');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
};

// Update an existing resource (used by admin panel to update status, etc.)
export const updateResource = async (id, resourceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resourceData),
    });
    if (!response.ok) {
      throw new Error('Failed to update resource');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating resource:', error);
    throw error;
  }
};

// Delete a resource (if needed)
export const deleteResource = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete resource');
    }
    return true;
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw error;
  }
};

// Suggest a new resource (user suggestions are stored with a default status, e.g., "pending")
export async function suggestResource(resource) {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // You can add the default status here if not handled by the backend
      body: JSON.stringify({ ...resource, status: 'pending' }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit resource suggestion');
    }
    return await response.json();
  } catch (error) {
    console.error('Error suggesting resource:', error);
    throw error;
  }
}

// Fetch only pending resource suggestions for the admin panel
export async function fetchPendingResources() {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/?status=pending`);
    if (!response.ok) {
      throw new Error('Failed to fetch pending suggestions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending suggestions:', error);
    throw error;
  }
}

// Update the status of a resource suggestion (e.g., "approved" or "rejected")
export async function updateResourceStatus(id, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update resource status');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating resource status:', error);
    throw error;
  }
}
