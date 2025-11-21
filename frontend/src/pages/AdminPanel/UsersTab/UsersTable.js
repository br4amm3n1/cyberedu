import React from 'react';
import { 
  TableContainer, Table, TableHead, TableBody, TableRow, 
  TableCell, Paper, Select, MenuItem, Button, Box 
} from '@mui/material';
import { adminPanelStyles } from '../adminPanelStyles';
import { assignCourseToUser } from '../../../api/courses';

const UsersTable = ({ 
  users, 
  courses, 
  page, 
  rowsPerPage, 
  selectedCourses, 
  setSelectedCourses,
  onError,
  onSuccess
}) => {
  const handleCourseSelect = (userId, courseId) => {
    setSelectedCourses(prev => ({ ...prev, [userId]: courseId }));
  };

  const handleAssignCourse = async (userId) => {
    const courseId = selectedCourses[userId];
    if (!courseId) return;

    try {
      await assignCourseToUser({ user_id: userId, course_id: courseId });
      
      const userName = users.find(u => u.id === userId)?.username || 'Пользователь';
      const courseName = courses.find(c => c.id === courseId)?.title || 'курс';
      
      onSuccess(`${userName} успешно подписан на ${courseName}`);
      setSelectedCourses(prev => ({ ...prev, [userId]: '' }));
    } catch (error) {
      onError('Ошибка при назначении курса', error);
    }
  };

  const paginatedUsers = users.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <TableContainer component={Paper} sx={adminPanelStyles.tableContainer}>
      <Table sx={adminPanelStyles.fixedTable}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '20%' }}>Имя пользователя</TableCell>
            <TableCell sx={{ width: '25%' }}>Email</TableCell>
            <TableCell sx={{ width: '40%' }}>Назначить курс</TableCell>
            <TableCell sx={{ width: '15%' }}>Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell sx={adminPanelStyles.column}>{user.first_name} {user.last_name}</TableCell>
                <TableCell sx={adminPanelStyles.column}>{user.email}</TableCell>
                <TableCell sx={adminPanelStyles.selectCell}>
                  <Box sx={adminPanelStyles.selectWrapper}>
                    <Select
                      fullWidth
                      value={selectedCourses[user.id] || ''}
                      onChange={(e) => handleCourseSelect(user.id, e.target.value)}
                      size="small"
                      sx={adminPanelStyles.select}
                      MenuProps={adminPanelStyles.menuProps}
                    >
                      <MenuItem value="">Выберите курс</MenuItem>
                      {courses.map((course) => (
                        <MenuItem 
                          key={course.id} 
                          value={course.id}
                          sx={adminPanelStyles.menuItem}
                        >
                          {course.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="contained" 
                    onClick={() => handleAssignCourse(user.id)}
                    disabled={!selectedCourses[user.id]}
                  >
                    Назначить
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                Пользователи не найдены
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UsersTable;