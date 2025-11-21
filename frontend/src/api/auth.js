import axios from 'axios';

const api = axios.create({
  baseURL: '/api/accounts/',
  withCredentials: true,
});

api.defaults.xsrfHeaderName = "X-CSRFToken";
api.defaults.xsrfCookieName = "csrftoken";

api.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrftoken'); // Функция для получения куки
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Функция для извлечения куки
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // window.location.reload();
      }
      return Promise.reject(error);
    }
  );

export const register = async (userData) => {
  try {
    const response = await api.post('register/', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const confirmEmail = async (token) => {
  try {
    const response = await api.get(`confirm-email/${token}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      error: 'Недействительная или устаревшая ссылка подтверждения' 
    };
  }
};

export const resendConfirmationEmail = async (email) => {
  try {
    const response = await api.post('resend_confirmation/', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('login/', credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logout = async () => {
    try {
      await api.post('logout/');
    } catch (error) {
      console.error('Logout error:', error);
    }
};

export const getCurrentUser = async () => {
  const userResponse = await api.get('users/me/');
  const profileResponse = await api.get('profiles/me/');
  return {
      user: userResponse.data,
      profile: profileResponse.data,
  };
};

export const getUsers = async () => {
    try {
        const response = await api.get('users/');
        console.log(response.data)
        return response.data.results || response.data; // Обрабатываем оба формата ответа
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const fetchProfile = async (userId) => {
    const response = await api.get(`profiles/${userId}/`);
    return response.data;
};
  
export const updateUserData = async (userId, data) => {
    const response = await api.patch(`users/${userId}/`, data);
    return response.data;
};
  
export const updateProfileData = async (profileId, data) => {
    const response = await api.patch(`profiles/${profileId}/`, data);
    return response.data;
};

export default api;
