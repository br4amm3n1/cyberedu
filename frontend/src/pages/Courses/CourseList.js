import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, 
         Button, CircularProgress, 
         Alert
        } 
from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { getAllCourses, getUserProgressCourses } from '../../api/courses';
import { AuthContext } from '../../context/AuthContext';
import {
  StyledContainer,
  StyledGridContainer,
  StyledGridItem,
  StyledCard,
  StyledCardContent,
  StyledTitle,
  StyledDescription,
  StyledSubscribedText,
  StyledSearchBox,
  StyledSearchField
} from './styles/CourseListStyles';

const CourseList = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribedCourseIds, setSubscribedCourseIds] = useState([]);
  const { isAuthenticated, user } = useContext(AuthContext);

  const extractCourseIds = (data) => {
    if (!data) return [];

    const coursesData = data.results || data;

    if (Array.isArray(coursesData)) {
      return coursesData.map(item => item.course?.id || item.id);
    }

    return [];
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [subscribedResponse, allCoursesResponse] = await Promise.all([
          getUserProgressCourses(),
          getAllCourses()
        ]);

        let subscribedIds;

        if (user?.is_staff) {
          const data = subscribedResponse.data || [];

          const filteredData = data.filter(unit => {
              return unit?.user?.id === user?.id;
          });

          subscribedIds = extractCourseIds(filteredData);
          setSubscribedCourseIds(subscribedIds);
        } else {
          subscribedIds = extractCourseIds(subscribedResponse.data);
          setSubscribedCourseIds(subscribedIds);
        };

        if (Array.isArray(allCoursesResponse)) {
          setAllCourses(allCoursesResponse);
          
          const userCourses = allCoursesResponse.filter(course => 
            subscribedIds.includes(course.id)
          );
          setFilteredCourses(userCourses);
        } else {
          setError('Неправильный формат данных');
          setFilteredCourses([]);
        }
        
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCourses();
    } else {
      setLoading(false);
    }

  }, [isAuthenticated]);

  useEffect(() => {
    if (searchTerm) {
      // Фильтруем подписанные курсы по поисковому запросу
      const results = allCourses.filter(course =>
        subscribedCourseIds.includes(course.id) &&
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(results);
    } else {
      // Без поиска показываем все подписанные курсы
      const userCourses = allCourses.filter(course => 
        subscribedCourseIds.includes(course.id)
      );
      setFilteredCourses(userCourses);
    }
  }, [searchTerm, allCourses, subscribedCourseIds]);

  if (!isAuthenticated) {
    return (
      <Container>
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          Пожалуйста, войдите в аккаунт или зарегистрируйтесь, чтобы увидеть доступные курсы
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <StyledContainer maxWidth="lg">
      <Typography variant="h4" gutterBottom>Мои курсы</Typography>
      
      <StyledSearchBox>
        <StyledSearchField
          fullWidth
          variant="outlined"
          placeholder="Поиск курсов по названию..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </StyledSearchBox>

      {filteredCourses.length === 0 ? (
        <Typography variant="body1">
          {searchTerm ? 'Ничего не найдено' : 'Вы не подписаны ни на один курс'}
        </Typography>
      ) : (
        <StyledGridContainer container spacing={3}>
          {filteredCourses.map((course) => (
            <StyledGridItem item xs={12} sm={6} key={course.id}>
              <StyledCard component={Link} to={`/courses/${course.id}`}>
                <StyledCardContent>
                  <StyledTitle variant="h5" mt={1.5}>
                    {course.title}
                  </StyledTitle>
                  
                  <StyledDescription variant="body1" color="text.secondary">
                    {course.description}
                  </StyledDescription>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <StyledSubscribedText variant="body1">
                      <CheckCircle color="success" sx={{ mr: 1 }} />
                      Вы подписаны
                    </StyledSubscribedText>
                  </div>
                </StyledCardContent>
              </StyledCard>
            </StyledGridItem>
          ))}
        </StyledGridContainer>
      )}
    </StyledContainer>
  );
};

export default CourseList;