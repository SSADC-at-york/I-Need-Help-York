// src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const fetchResources = async (status = null) => {
  try {
    const url = status 
      ? `${API_BASE_URL}/resources?status=${status}`
      : `${API_BASE_URL}/resources`;

    const response = await fetch(url, {
      headers: {
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch resources');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

export const suggestResource = async (resourceData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(resourceData)
    });

    if (!response.ok) {
      throw new Error('Failed to suggest resource');
    }

    return await response.json();
  } catch (error) {
    console.error('Error suggesting resource:', error);
    throw error;
  }
};

export const reviewResource = async (resourceId, { status, rejection_reason }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/review`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        status,
        rejection_reason
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to review resource');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reviewing resource:', error);
    throw error;
  }
};

export const getPendingResources = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources?status=pending`, {
      headers: {
        ...getAuthHeader()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pending resources');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching pending resources:', error);
    throw error;
  }
};