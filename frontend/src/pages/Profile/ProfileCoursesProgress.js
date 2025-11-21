import React, { useContext } from 'react';
import { Link } from "react-router-dom";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  LinearProgress,
  CircularProgress,
  Box
} from '@mui/material';
import { unsubscribeToCourse } from '../../api/courses';
import { AuthContext } from '../../context/AuthContext';

const ProfileCoursesProgress = ({ courses, loadingCourses, onUnsubscribe }) => {
    const { isAuthenticated } = useContext(AuthContext);
  
  //   const handleUnsubscribe = async (progressId) => {
  //       if (!isAuthenticated) {
  //           console.error('User is not authenticated');
  //           return;
  //       }

  //       try {
  //           await unsubscribeToCourse(progressId);
  //           onUnsubscribe();
  //       } catch (err) {
  //           console.error('Unsubscribe failed:', err);
  //       }
  // };

  if (loadingCourses) {
    return <CircularProgress />;
  }

  if (courses.length === 0) {
    return <Typography>Вы не подписаны ни на один курс</Typography>;
  }

  return (
    <Grid container spacing={3} sx={{ 
      display: "grid",
      justifyContent: 'center',
      '& .MuiGrid-item': {
        paddingLeft: '0 !important',
        paddingRight: '0 !important'
      },
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    }}>
      {courses.map((courseProgress) => (
        <Grid item xs={12} sm={6} key={courseProgress.id} sx={{ display: 'flex' }}>
          <Card 
            component={Link}
            to={`/courses/${courseProgress.course.id}`} 
            sx={{
              width: '100%',
              height: '320px',
              display: 'flex',
              flexDirection: 'column',
              textDecoration: 'none',
              '&:hover': {
                boxShadow: 4,
              }
            }}>
            <CardContent sx={{ 
              flex: '1 1 auto',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              p: 3
            }}>
              <Typography 
                variant="h6"
                sx={{
                  mb: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {courseProgress.course.title}
              </Typography>
              
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  flex: '1 1 auto',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  mb: 2
                }}
              >
                {courseProgress.course.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={
                    courseProgress.status === 'completed' ? 'Завершен' :
                    courseProgress.status === 'in_progress' ? 'В процессе' : 'Не начат'
                  } 
                  color={
                    courseProgress.status === 'completed' ? 'success' :
                    courseProgress.status === 'in_progress' ? 'primary' : 'default'
                  }
                />
              </Box>
              
              {courseProgress.status === 'in_progress' && (
                <Box sx={{ width: '100%', mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={courseProgress.progress_percent} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    Прогресс: {courseProgress.progress_percent}%
                  </Typography>
                </Box>
              )}
              
              {/* <Box sx={{ mt: 'auto', alignSelf: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnsubscribe(courseProgress.id);
                  }}
                  disabled={!isAuthenticated}
                >
                  Отменить подписку
                </Button>
              </Box> */}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProfileCoursesProgress;