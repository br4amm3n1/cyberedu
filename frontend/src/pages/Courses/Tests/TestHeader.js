import React from 'react';
import { Typography, Chip, Box, Paper, LinearProgress } from '@mui/material';

const TestHeader = ({ test, questions, answeredCount }) => {
    const progress = Math.round((answeredCount / questions.length) * 100);
      
    return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" gutterBottom>{test.title}</Typography>
      
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Chip label={`Вопросы: ${answeredCount}/${questions.length}`} />
        <Chip label={`Прогресс: ${progress}%`} color={progress === 100 ? 'success' : 'primary'} />
        <Chip label={`Макс. баллы: ${test.max_score}`} />
        <Chip label={`Проходной балл: ${test.passing_score}`} color="secondary" />
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        color={progress === 100 ? 'success' : 'primary'}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Paper>
  );
};

export default TestHeader;