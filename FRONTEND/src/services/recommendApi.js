import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getRecommendations = async (tags, userId = 1) => {
  try {
    const response = await axios.post(`${API_BASE}/api/recommend`, { tags, userId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch recommendations');
  }
};
