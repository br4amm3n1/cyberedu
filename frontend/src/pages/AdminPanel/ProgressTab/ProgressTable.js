import { 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Paper,
  Typography,
  Box
} from '@mui/material';
import { adminPanelStyles } from '../adminPanelStyles';

const ProgressTable = ({ progressData, page, rowsPerPage }) => {
  // Защитные проверки
  if (!progressData || !Array.isArray(progressData) || progressData.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Нет данных для отображения
        </Typography>
      </Paper>
    );
  }

  // Пагинация с защитой от выхода за границы
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, progressData.length);
  const paginatedProgress = progressData.slice(startIndex, endIndex);

  const getStatusText = (status) => {
    if (!status) return 'Не определен';
    
    switch (status.toLowerCase()) {
      case 'completed': 
        return 'Завершен';
      case 'in_progress': 
      case 'in progress': 
        return 'В процессе';
      default: 
        return 'Не начат';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return 'Некорректная дата';
    }
  };

  const getUserName = (user) => {
    if (!user) return 'Неизвестный пользователь';
    
    // Проверяем разные форматы данных
    if (user.first_name && user.last_name) {
      return `${user.last_name} ${user.first_name}`;
    }
    if (user.firstname && user.lastname) {
      return `${user.lastname} ${user.firstname}`;
    }
    if (user.username) {
      return user.username;
    }
    return `ID: ${user.id || 'неизвестен'}`;
  };

  const getProgressPercent = (progress) => {
    if (progress === undefined || progress === null) return '0%';
    
    // Если прогресс - число
    if (typeof progress === 'number') {
      return `${Math.round(progress)}%`;
    }
    
    // Если прогресс в процентах уже
    if (typeof progress === 'string' && progress.includes('%')) {
      return progress;
    }
    
    // Если есть поле progress_percent
    if (progress.progress_percent !== undefined) {
      return `${progress.progress_percent}%`;
    }
    
    return '0%';
  };

  return (
    <TableContainer component={Paper} sx={adminPanelStyles.progressTableContainer}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '170px', fontWeight: 'bold' }}>Пользователь</TableCell>
            <TableCell sx={{ width: '200px', fontWeight: 'bold' }}>Курс</TableCell>
            <TableCell sx={{ width: '100px', fontWeight: 'bold' }}>Статус</TableCell>
            <TableCell sx={{ width: '100px', fontWeight: 'bold' }}>Прогресс</TableCell>
            <TableCell sx={{ width: '120px', fontWeight: 'bold' }}>Дата начала</TableCell>
            <TableCell sx={{ width: '120px', fontWeight: 'bold' }}>Дата завершения</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProgress.map((progress, index) => {
            const user = progress.user || {};
            const course = progress.course || {};
            const key = `${user.id || 'unknown'}-${course.id || 'unknown'}-${index}`;

            return (
              <TableRow key={key} hover>
                <TableCell sx={adminPanelStyles.progressTableCell}>
                  <Typography variant="body2">
                    {getUserName(user)}
                  </Typography>
                  {user.email && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {user.email}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={adminPanelStyles.progressTableCell}>
                  <Typography variant="body2">
                    {course.title || 'Без названия'}
                  </Typography>
                  {course.category && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {course.category}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={adminPanelStyles.progressTableCell}>
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: progress.status === 'completed' ? 'success.main' : 
                             progress.status === 'in_progress' ? 'info.main' : 
                             'text.secondary',
                      fontWeight: progress.status === 'completed' ? 'bold' : 'normal'
                    }}
                  >
                    {getStatusText(progress.status)}
                  </Typography>
                </TableCell>
                <TableCell sx={adminPanelStyles.progressTableCell}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: progress.status === 'completed' ? 'success.main' : 'primary.main'
                    }}
                  >
                    {getProgressPercent(progress)}
                  </Typography>
                </TableCell>
                <TableCell sx={adminPanelStyles.progressTableCell}>
                  {formatDate(progress.started_at)}
                </TableCell>
                <TableCell sx={adminPanelStyles.progressTableCell}>
                  {formatDate(progress.completed_at)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Информация о количестве отображаемых записей */}
      {progressData.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="right">
            Показано {paginatedProgress.length} из {progressData.length} записей
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
};

export default ProgressTable;