import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import UsersTab from './UsersTab/UsersTab';
import ProgressTab from './ProgressTab/ProgressTab';
import { getUsers } from '../../api/auth';
import { getAllCourses, getAllProgress } from '../../api/courses';
import Notification from './shared/Notification';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUpdated(false);
    setLoading(true);

    const fetchData = async () => {
      try {
        const [usersData, coursesData, progressData] = await Promise.all([
          getUsers(),
          getAllCourses(),
          getAllProgress()
        ]);
        setUsers(usersData);
        setCourses(coursesData);
        setUserProgress(progressData);
      } catch (error) {
        handleError('Ошибка загрузки данных', error);
      } finally {
        setLoading(false);
      };
    };
    fetchData();
  }, [updated]);

  const handleError = (message, error) => {
    setNotification({
      open: true,
      message,
      severity: 'error'
    });
  };

  const handleSuccess = (message) => {
    setUpdated(true);

    setNotification({
      open: true,
      message,
      severity: 'success'
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const LoadingSpinner = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Загрузка данных...
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Админ-панель
      </Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Назначение курсов" />
        <Tab label="Прогресс пользователей" />
      </Tabs>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {tabValue === 0 && (
            <UsersTab 
              users={users} 
              courses={courses} 
              onError={handleError}
              onSuccess={handleSuccess}
            />
          )}
          
          {tabValue === 1 && (
            <ProgressTab progressData={userProgress} />
          )}
        </>
      )}
      
      <Notification 
        {...notification} 
        onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
      />
    </Box>
  );
};

export default AdminPanel;