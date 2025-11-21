import React from 'react';
import { Typography, Box } from '@mui/material';

const Home = () => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h3" gutterBottom>
        Добро пожаловать на платформу по обучению кибербезопасности
      </Typography>
      {/* <Typography variant="body1">
        Пожалуйста, войдите в аккаунт, чтобы получить доступ к курсам.
      </Typography> */}
    </Box>
  );
};

export default Home;