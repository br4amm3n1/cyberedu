import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Edit, Lock, Email, Work, Groups, CalendarToday, Business, BusinessCenterSharp } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { getUserProgressCourses, unsubscribeToCourse } from '../../api/courses';
import ProfileCoursesProgress from './ProfileCoursesProgress';

const Profile = () => {
  const { user, profile, handleLogout } = useContext(AuthContext)
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const branchMapping = {
    'cardio': 'НИИ Кардиологии',
    'oncology': 'НИИ Онкологии',
    'tumen': 'Тюменский кардиологический научный центр',
    'pz': 'НИИ Психического здоровья',
    'medgenetics': 'НИИ Медицинской генетики',
    'pharma': 'НИИ Фармакологии и регенеративной медицины',
    'head': 'Аппарат управления ТНИМЦ',
  };

  const getBranchDisplayName = (branchKey) => {
    return branchMapping[branchKey] || branchKey || 'Не указана';
  };

  const loadCourses = async () => {
    try {
        setLoadingCourses(true)
        const response = await getUserProgressCourses();

        const data = response.data || [];
        
        if (user?.is_staff) {
          const filteredData = data.filter(unit => {
            return unit?.user?.id === user?.id;
          });

          setCourses(filteredData);

        } else {
          setCourses(data);

        };
    } catch (error) {
        setError('Failed to load courses');
        console.error('Error loading courses:', error);
    } finally {
        setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
        loadCourses();
    }
  }, [user]);

  if (!user || !profile) {
    return <CircularProgress />;
  };

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Профиль
          </Typography>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEditProfile}
          >
            Редактировать
          </Button>
        </Box>

        <Box display="flex" alignItems="center" mb={4}>
          <Avatar sx={{ width: 100, height: 100, mr: 3 }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5">
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              @{user?.username}
            </Typography>
            <Chip
              label={profile?.role === 'admin' ? 'Администратор' : 'Работник'}
              color={profile?.role === 'admin' ? 'primary' : 'default'}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Email />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Электронная почта"
              secondary={user?.email || 'Не указана'}
            />
          </ListItem>

          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Business />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Подразделение"
              secondary={getBranchDisplayName(profile?.branch)}
            />
          </ListItem>

          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Work />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Должность"
              secondary={profile?.position || 'Не указана'}
            />
          </ListItem>

          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Groups />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Отдел"
              secondary={profile?.department || 'Не указана'}
            />
          </ListItem>

          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <CalendarToday />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Дата регистрации"
              secondary={new Date(profile?.registration_date).toLocaleDateString()}
            />
          </ListItem>
        </List>

        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            color="error"
            startIcon={<Lock />}
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </Box>
      </Paper>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>Мои курсы</Typography>
        <ProfileCoursesProgress 
          courses={courses} 
          loadingCourses={loadingCourses} 
          onUnsubscribe={loadCourses} 
        />
      </Container>
    </Container>
  );
};

export default Profile;