import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardHeader, 
  List, 
  ListItem, 
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SelectAllTransferList from '../TableAssignment/TransferList';
import SelectionModal from '../shared/SelectionModal';
import { assignCourseToUser } from '../../../api/courses';

const UsersTab = ({ users, courses, onError, onSuccess }) => {
  // Состояния для модальных окон
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  
  // Выбранные пользователи и курсы
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCoursesForBulk, setSelectedCoursesForBulk] = useState([]);

  // Обработчики модальных окон для пользователей
  const handleOpenUserModal = () => setUserModalOpen(true);
  const handleCloseUserModal = () => setUserModalOpen(false);
  const handleSaveUsers = (users) => {
    setSelectedUsers(users);
    setUserModalOpen(false);
  };

  // Обработчики модальных окон для курсов
  const handleOpenCourseModal = () => setCourseModalOpen(true);
  const handleCloseCourseModal = () => setCourseModalOpen(false);
  const handleSaveCourses = (courses) => {
    setSelectedCoursesForBulk(courses);
    setCourseModalOpen(false);
  };

  // Удаление пользователя из выбранных
  const handleRemoveUser = (userId) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  // Удаление курса из выбранных
  const handleRemoveCourse = (courseId) => {
    setSelectedCoursesForBulk(prev => prev.filter(course => course.id !== courseId));
  };

  // Обработка массового назначения курсов
  const handleBulkAssign = async () => {
    if (!selectedUsers.length || !selectedCoursesForBulk.length) {
      onError('Выберите пользователей и курсы для назначения');
      return;
    }

    try {
      const assignments = [];
      
      // Создаем все задания для назначения
      for (const user of selectedUsers) {
        for (const course of selectedCoursesForBulk) {
          assignments.push({ user, course });
        }
      }

      // Выполняем все запросы параллельно
      const results = await Promise.allSettled(
        assignments.map(({ user, course }) => 
          assignCourseToUser({ user_id: user.id, course_id: course.id })
        )
      );

      // Анализируем результаты
      const successful = [];
      const alreadyAssigned = [];
      const failed = [];

      results.forEach((result, index) => {
        const { user, course } = assignments[index];
        
        if (result.status === 'fulfilled') {
          if (result.value.status === 'already subscribed') {
            alreadyAssigned.push({ user, course });
          } else {
            successful.push({ user, course });
          }
        } else {
          failed.push({ user, course, error: result.reason });
        }
      });

      // Формируем сообщения о результатах
      let message = '';
      if (successful.length > 0) {
        message += `Успешно назначено: ${successful.length} назначений. `;
      }
      if (alreadyAssigned.length > 0) {
        message += `Уже были назначены: ${alreadyAssigned.length} назначений. `;
      }
      if (failed.length > 0) {
        message += `Ошибки: ${failed.length} назначений.`;
      }

      if (failed.length === 0) {
        onSuccess(message.trim());
        // Очищаем выбранные элементы после успешного назначения
        setSelectedUsers([]);
        setSelectedCoursesForBulk([]);
      } else {
        onError(message.trim());
      }

    } catch (error) {
      onError('Ошибка при массовом назначении курсов', error);
    }
  };

  // Компонент для отображения выбранных элементов
  const SelectionCard = ({ title, items, onAdd, onRemove, type }) => (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
    }}>
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{title}</Typography>
            <Chip 
              label={items.length} 
              color="primary" 
              size="small" 
            />
          </Box>
        }
        action={
          <IconButton 
            onClick={onAdd}
            sx={{
              width: '40px',
              height: '40px',
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }}
          >
            <AddIcon />
          </IconButton>
        }
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      />
      <List sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        height: '300px',
        minHeight: '300px',
        maxHeight: '300px'
      }}>
        {items.length > 0 ? (
          items.map((item) => (
            <ListItem 
              key={item.id} 
              divider
              secondaryAction={
                <Tooltip title="Удалить">
                  <IconButton 
                    edge="end" 
                    onClick={() => onRemove(item.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemText 
                primary={
                  <Typography variant="body1" fontWeight="medium">
                    {type === 'user' 
                      ? `${item.first_name} ${item.last_name}`
                      : item.title
                    }
                  </Typography>
                }
                secondary={
                  type === 'user' 
                    ? item.email 
                    : `ID: ${item.id} • ${item.category || 'Без категории'}`
                }
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText 
              primary={
                <Typography color="text.secondary" textAlign="center">
                  Нет выбранных элементов
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Нажмите "Добавить" чтобы выбрать
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Модальные окна */}
      <SelectionModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        title="Выбор пользователей"
        maxWidth="lg"
      >
        <SelectAllTransferList 
          allItems={users}
          selectedItems={selectedUsers}
          onSave={handleSaveUsers}
          onClose={handleCloseUserModal}
          type="user"
        />
      </SelectionModal>

      <SelectionModal
        open={courseModalOpen}
        onClose={handleCloseCourseModal}
        title="Выбор курсов"
        maxWidth="lg"
      >
        <SelectAllTransferList 
          allItems={courses}
          selectedItems={selectedCoursesForBulk}
          onSave={handleSaveCourses}
          onClose={handleCloseCourseModal}
          type="course"
        />
      </SelectionModal>

      {/* Основной интерфейс */}
      <Grid container spacing={3} sx={{display: "grid", gridTemplateColumns: "1fr", width: "100%", mb: 3}}>
        <Grid item xs={12} md={6}>
          <SelectionCard
            title="Пользователи"
            items={selectedUsers}
            onAdd={handleOpenUserModal}
            onRemove={handleRemoveUser}
            type="user"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectionCard
            title="Курсы"
            items={selectedCoursesForBulk}
            onAdd={handleOpenCourseModal}
            onRemove={handleRemoveCourse}
            type="course"
          />
        </Grid>
      </Grid>

      {/* Кнопка назначения */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 3,
        p: 3,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: 2,
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Готово к назначению
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
            {selectedUsers.length} пользователей × {selectedCoursesForBulk.length} курсов = {selectedUsers.length * selectedCoursesForBulk.length} назначений
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleBulkAssign}
            disabled={selectedUsers.length === 0 || selectedCoursesForBulk.length === 0}
            size="large"
            sx={{ 
              minWidth: 300,
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Назначить курсы пользователям
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default UsersTab;