import axios from 'axios';

const api = axios.create({
  baseURL: '/api/documents/',
  withCredentials: true,
});

api.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
      }
      return Promise.reject(error);
    }
  );

export const getDocuments = async () => {
  try {
    const response = await api.get('documents/');
    return response;
  } catch (error) {
    throw error.response.data;
  }
};

export const downloadDocument = async (documentId) => {
  try {
    const response = await api.get(`documents/${documentId}/download/`, {
      responseType: 'blob',
    });
    
    // Проверяем, что ответ действительно содержит файл
    if (response.headers['content-type'] === 'text/html') {
      throw new Error('Файл не найден на сервере');
    }
    
    return response;
  } catch (error) {
    // Преобразуем Blob с ошибкой в текст
    if (error.response?.data?.type === 'text/html') {
      const errorText = await error.response.data.text();
      throw new Error(`Ошибка сервера: ${errorText}`);
    }
    throw new Error(error.message || 'Ошибка при скачивании');
  }
};

export default api;
