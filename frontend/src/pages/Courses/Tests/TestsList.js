import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Button, 
  CircularProgress,
  Chip,
  Divider,
  Box,
  Alert,
  Tooltip,
  Stack,
  Typography
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import DoneIcon from '@mui/icons-material/Done';
import CheckCircle from '@mui/icons-material/CheckCircle';
import api, { getUserProgressCourses, subscribeToCourse, getUserTestResults } from '../../../api/courses';
import { AuthContext } from '../../../context/AuthContext';

const TestsList = () => {
  const { id } = useParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscribeInProgress, setSubscribeInProgress] = useState(false);
  const [testResults, setTestResults] = useState({});
  const { isAuthenticated }= useContext(AuthContext)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Сначала получаем информацию о курсе для проверки
        const courseResponse = await api.get(`courses/${id}/`);
        setCourseInfo(courseResponse.data);

        // Затем получаем тесты только для этого курса
        const testsResponse = await api.get('tests/', {
          params: { 
            course_id: id,
            course__is_active: true 
          }
        });

        // Дополнительная проверка на случай, если API вернет все тесты
        const filteredTests = testsResponse.data.results 
          ? testsResponse.data.results.filter(test => test.course == id)
          : testsResponse.data.filter(test => test.course == id);

        setTests(filteredTests);

        if (isAuthenticated) {
            const subscribedResponse = await getUserProgressCourses();
            const subscribedCourses = subscribedResponse.data.results || subscribedResponse.data;
            const isUserSubscribed = subscribedCourses.some(
                sub => (sub.course?.id || sub.course) == id
            );
            setIsSubscribed(isUserSubscribed)
        }

        const resultsResponse = await getUserTestResults(id);
        const results = {};
        resultsResponse.data.forEach(result => {
          results[result.test] = result;
        });
        setTestResults(results);

      } catch (err) {
        setError(err.response?.data?.detail || 'Ошибка загрузки данных');
        console.error('Error:', err);
      } finally {
        setLoading(false);
        setSubscriptionLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  const handleSubscribe = async () => {
    try {
        setSubscribeInProgress(true);
        await subscribeToCourse(id);
        setIsSubscribed(true);
    } catch (error) {
        console.error('Subscribe failed', error);
        setError('Ошибка при подписке на курс')
    } finally {
        setSubscribeInProgress(false);
    }
  };
  
  const renderTestResult = (testId) => {
    const result = testResults[testId];
    if (!result) return null;

    return (
      <Stack direction="row" spacing={1} alignItems="center" marginTop="10px">
        <Typography variant="body2" color="text.secondary">
          Попытка {result.attempt_number}. Результат: {result.score}/{result.max_score} баллов
        </Typography>
        <Chip 
          label={result.is_passed ? 'Пройден' : 'Не пройден'} 
          size="small" 
          color={result.is_passed ? 'success' : 'error'} 
          variant="outlined"
        />
      </Stack>
    );
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!courseInfo) {
    return (
      <Alert severity="warning">
        Курс не найден
      </Alert>
    );
  }

  return (
    <Box>
      {!isAuthenticated && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Для прохождения тестов необходимо войти в систему
        </Alert>
      )}

      {isAuthenticated && !subscriptionLoading && !isSubscribed && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleSubscribe}
              disabled={subscribeInProgress}
              startIcon={
                subscribeInProgress ? 
                  <CircularProgress size={16} /> : 
                  <CheckCircle />
              }
            >
              {subscribeInProgress ? 'Подписка...' : 'Подписаться'}
            </Button>
          }
        >
          Для доступа к тестам необходимо подписаться на курс
        </Alert>
      )}        
      
      {isSubscribed && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          icon={<CheckCircle fontSize="inherit" />}
        >
          Вы подписаны на этот курс
        </Alert>
      )}

      {tests.length === 0 ? (
        <Alert severity="info">
          В этом курсе нет доступных тестов
        </Alert>
      ) : (
        <List sx={{ bgcolor: 'background.paper' }}>
          {tests.map((test) => (
            <React.Fragment key={test.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={test.title}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip 
                          label={`Макс. баллы: ${test.max_score}`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`Проходной балл: ${test.passing_score}`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                      {testResults[test.id] && renderTestResult(test.id)}
                    </Box>
                  }
                />

                {testResults[test.id] ? (
                  testResults[test.id].is_passed ? (
                    <Tooltip title="Тест уже пройден">
                      <DoneIcon color="success" fontSize="large" />
                    </Tooltip>
                  ) : (
                    <Button
                      component={Link}
                      to={`/courses/${id}/tests/${test.id}`}
                      variant="contained"
                      size="small"
                      sx={{ ml: 2 }}
                    >
                      Пройти заново
                    </Button>
                  )
                ) : isSubscribed ? (
                  <Button
                    component={Link}
                    to={`/courses/${id}/tests/${test.id}`}
                    variant="contained"
                    size="small"
                    sx={{ ml: 2 }}
                  >
                    Начать
                  </Button>
                ) : (
                  <Tooltip title="Подпишитесь на курс для доступа к тесту">
                    <span>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ ml: 2 }}
                        disabled
                        startIcon={<LockIcon />}
                      >
                        Начать
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default TestsList;