import { createBrowserRouter, Navigate } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ConfirmEmail from '../pages/Auth/ConfirmEmail';
import CourseList from '../pages/Courses/CourseList';
import CourseDetail from '../pages/Courses/CourseDetail';
import TestsList from '../pages/Courses/Tests/TestsList';
import TestDetail from '../pages/Courses/Tests/TestDetail';
import Profile from '../pages/Profile/Profile';
import EditProfile from '../pages/Profile/EditProfile';
import Documents from '../pages/Documents/Documents';
import AdminPanel from '../pages/AdminPanel/AdminPanel';

export const authLoader = async () => {
  try {
    const { profile } = await getCurrentUser();
    return { user: profile.user, profile };
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Response('Unauthorized', { 
        status: 401,
        statusText: 'Сессия истекла. Пожалуйста, войдите снова.'
      });
    }
    throw error;
  }
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/confirm-email/:token',
    element: <ConfirmEmail />,
  },
  {
    path: '/',
    element: <Layout />,
    errorElement: <Navigate to="/login" replace />,
    children: [
      {
        index: true,
        element: <Home />,
        // loader: authLoader,
      },
      {
        path: 'courses',
        children: [
          {
            index: true,
            element: <CourseList />,
            loader: authLoader,
          },
          {
            path: ':id',
            element: <CourseDetail />,
            loader: authLoader,
            children: [
              {
                path: 'tests',
                element: <TestsList />,
                loader: authLoader,
              },
            ],
          },
          {
            path: ':id/tests/:testId',
            element: <TestDetail />,
            loader: authLoader,
          },
        ],
      },
      {
        path: 'profile',
        element: <Profile />,
        loader: authLoader,
      },
      {
        path: 'profile/edit',
        element: <EditProfile />,
        loader: authLoader,
      },
      {
        path: 'documents',
        element: <Documents />,
        loader: authLoader,
      },
      {
        path: 'admin-panel',
        element: <AdminPanel />,
        loader: async () => {
          const { profile } = await getCurrentUser();
          if (!profile.user.is_staff) {
            throw new Response('Forbidden', { status: 403 });
          }
          return { user: profile.user, profile };
        },
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);