// ProgressTab.js - исправленная версия
import { useState, useEffect } from 'react';
import { 
  Box, 
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import ProgressTable from './ProgressTable';
import PaginationControls from '../shared/PaginationControls';
import { getAllProgress } from '../../../api/courses';

const ProgressTab = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllProgress();
        setProgressData(data);
      } catch (err) {
        console.error('Ошибка загрузки данных прогресса:', err);
        setError('Не удалось загрузить данные о прогрессе пользователей');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []); // Пустой массив зависимостей - загружаем один раз при монтировании

  const handlePageChange = (newPage) => setPage(newPage);
  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setPage(1); // Сбрасываем на первую страницу при изменении количества строк
  };

  // Отображаем состояние загрузки
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Загрузка данных о прогрессе...
        </Typography>
      </Box>
    );
  }

  // Отображаем ошибку, если есть
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Пожалуйста, обновите страницу или попробуйте позже.
        </Typography>
      </Box>
    );
  }

  // Если данные пустые
  if (progressData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Нет данных о прогрессе пользователей
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Пользователи еще не начали проходить курсы или данные не загружены
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <PaginationControls 
        count={progressData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      
      <Box mt={2}>
        <ProgressTable 
          progressData={progressData} 
          page={page}
          rowsPerPage={rowsPerPage}
        />
      </Box>
    </Box>
  );
};

export default ProgressTab;