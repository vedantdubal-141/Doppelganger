import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const getRecommendations = async (tags, userId = 1) => {
  try {
    const response = await axios.post(`${API_URL}/recommend`, { tags, userId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch recommendations');
  }
};
