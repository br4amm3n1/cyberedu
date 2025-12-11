import axios from 'axios';

const api = axios.create({
  baseURL: '/api/courses/',
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
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
      }
      return Promise.reject(error);
    }
  );

export const subscribeToCourse = async (userId, courseId) => {
  try {
    const response = await api.post('progress/subscribe/', {'user_id': userId, 'course_id': courseId});
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getUserProgressCourses = async (course_id=false) => {
    try {
      if (course_id) {
        const response = await api.get(`progress/?course_id=${course_id}`);
        return {
          data: response.data.results || response.data,
          status: response.status,
        };
      };

      const response = await api.get('progress/');
      return {
        data: response.data.results || response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching user courses:', error);
      throw error;
    }
};

export const getUserTestResults = async (courseId) => {
    const response = await api.get(`tests/user_results/?course_id=${courseId}`);
    return response;
};

export const unsubscribeToCourse = async (progressId) => {
    try {
      const response = await api.post(`progress/${progressId}/unsubscribe/`);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};

export const getAllCourses = async () => {
    try {
        const response = await api.get('courses/');
        return response.data;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
};

export const getAllProgress = async () => {
    try {
        const response = await api.get('progress/admin_progress/');
        return response.data;
    } catch (error) {
        console.error('Error fetching progress:', error);
        throw error;
    }
};

export const assignCourseToUser = async (data) => {
  try {
    const response = await api.post('progress/subscribe/', data);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default api;
