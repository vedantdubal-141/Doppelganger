import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const uploadImage = async (inspirations, purchases) => {
  const formData = new FormData();
  
  if (inspirations && inspirations.length > 0) {
    inspirations.forEach(item => formData.append('inspirations', item.file));
  }
  
  if (purchases && purchases.length > 0) {
    purchases.forEach(item => formData.append('purchases', item.file));
  }

  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to upload images');
  }
};
