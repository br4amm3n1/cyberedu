import { useState, useEffect } from 'react';
import { useParams, Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Box, 
  CircularProgress, 
  LinearProgress, 
  Chip,
  Button,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import { CheckCircle, PlayCircle, Lock } from '@mui/icons-material';
import api from '../../api/courses';
import MaterialsList from './MaterialsList';
import { getUserProgressCourses } from '../../api/courses';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const tabValue = location.pathname.includes('tests') ? 1 : 0;

  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        const [responseCourse] = await Promise.all([
          api.get(`/courses/${id}/`),
        ]);
        
        const responseProgress = await getUserProgressCourses(id);

        setCourse(responseCourse.data);
        setCourseProgress(responseProgress.data || null);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Ошибка загрузки данных курса');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseInfo();
  }, [id]);

  const handleSubscribe = async () => {
    try {
      const response = await api.post('/progress/subscribe/', { course_id: id });
      setCourseProgress(response.data);
    } catch (error) {
      console.error('Subscribe failed:', error);
      setError('Ошибка подписки на курс');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!course) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Курс не найден
        </Typography>
      </Container>
    );
  }

  if (error) {
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" variant="h6" gutterBottom>
              {error}
            </Typography>
          </Paper>
        </Container>
      );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок и описание курса */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
          {course.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {course.description}
        </Typography>
      </Box>

      {/* Блок прогресса */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4,
          borderLeft: '4px solid',
          borderColor: theme => 
            courseProgress?.status === 'completed' ? theme.palette.success.main :
            courseProgress?.status === 'in_progress' ? theme.palette.primary.main :
            theme.palette.grey[400]
        }}
      >
        {courseProgress ? (
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {courseProgress.status === 'completed' ? (
                <CheckCircle color="success" sx={{ fontSize: 32, mr: 2 }} />
              ) : (
                <PlayCircle color="primary" sx={{ fontSize: 32, mr: 2 }} />
              )}
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {courseProgress.status === 'completed' ? 'Курс завершен' :
                 courseProgress.status === 'in_progress' ? 'Курс в процессе' : 'Курс не начат'}
              </Typography>
              <Chip 
                label={
                  courseProgress.status === 'completed' ? 'Завершен' :
                  courseProgress.status === 'in_progress' ? 'В процессе' : 'Не начат'
                } 
                color={
                  courseProgress.status === 'completed' ? 'success' :
                  courseProgress.status === 'in_progress' ? 'primary' : 'default'
                }
                variant="outlined"
                size="medium"
              />
            </Box>

            {courseProgress.status === 'in_progress' && (
              <>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Прогресс прохождения:
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={courseProgress.progress_percent}
                    sx={{ 
                      height: 10,
                      borderRadius: 5,
                      mb: 1
                    }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      {courseProgress.progress_percent}% выполнено
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Осталось: {100 - courseProgress.progress_percent}%
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Lock sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Вы не подписаны на этот курс
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Подпишитесь, чтобы получить доступ к материалам и начать обучение
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubscribe}
              sx={{ mt: 2 }}
            >
              Подписаться на курс
            </Button>
          </Box>
        )}
      </Paper>

      {/* Навигационные табы */}
      <Tabs 
        value={tabValue} 
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: '4px 4px 0 0'
          }
        }}
      >
        <Tab 
          label="Материалы" 
          component={Link} 
          to="" 
          value={0}
          sx={{ fontSize: '1rem', fontWeight: 600 }}
        />
        <Tab 
          label="Тесты" 
          component={Link} 
          to="tests" 
          value={1}
          sx={{ fontSize: '1rem', fontWeight: 600 }}
        />
      </Tabs>

      {/* Контент */}
      <Box>
        {tabValue === 0 && <MaterialsList courseId={id} />}
        <Outlet />
      </Box>
    </Container>
  );
};

export default CourseDetail;