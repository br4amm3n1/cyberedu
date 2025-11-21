import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import CourseList from './pages/Courses/CourseList';
import CourseDetail from './pages/Courses/CourseDetail';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import TestDetail from './pages/Courses/Tests/TestDetail';
import TestsList from './pages/Courses/Tests/TestsList';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import Documents from './pages/Documents/Documents';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import ConfirmEmail from './pages/Auth/ConfirmEmail';

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="confirm-email/:token" element={<ConfirmEmail />} />
          <Route path="courses">
            <Route index element={<PrivateRoute><CourseList /></PrivateRoute>} />
            <Route path=":id" element={<PrivateRoute><CourseDetail /></PrivateRoute>}>
              <Route path="tests" element={<PrivateRoute><TestsList /></PrivateRoute>} />
            </Route>
            <Route path=":id/tests/:testId" element={<PrivateRoute><TestDetail /></PrivateRoute>} />
          </Route>
          <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute> }/>
          <Route path="profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute> }/>
          <Route path="admin-panel" element={
            <PrivateRoute>
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            </PrivateRoute>
          } />
          <Route path="documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;