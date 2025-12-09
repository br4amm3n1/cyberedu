// AdminPanel.js - упрощенная версия
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import UsersTab from './UsersTab/UsersTab';
import ProgressTab from './ProgressTab/ProgressTab';
import Notification from './shared/Notification';

const AdminPanel = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleError = (message) => {
    setNotification({
      open: true,
      message,
      severity: 'error'
    });
  };

  const handleSuccess = (message) => {
    setNotification({
      open: true,
      message,
      severity: 'success'
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Админ-панель
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Назначение курсов" />
        <Tab label="Прогресс пользователей" />
      </Tabs>
      
      {tabValue === 0 && (
        <UsersTab 
          onError={handleError}
          onSuccess={handleSuccess}
        />
      )}
      
      {tabValue === 1 && (
        <ProgressTab />
      )}
      
      <Notification 
        {...notification} 
        onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
      />
    </Box>
  );
};

export default AdminPanel;