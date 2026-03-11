import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  CircularProgress,
  Box
} from '@mui/material';
import PaginationControls from "../AdminPanel/shared/PaginationControls"

const ProfileCoursesProgress = ({ courses, loadingCourses }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  if (!courses || !Array.isArray(courses)) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Нет данных для отображения
          </Typography>
        </Paper>
      );
    };
    
    if (courses.length === 0) {
      return <Typography>Вы не подписаны ни на один курс</Typography>;
    };
  
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, courses.length);
  const paginatedCourses = courses.slice(startIndex, endIndex);

  if (loadingCourses) {
    return <CircularProgress />;
  }

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setPage(1);
  };

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
      {paginatedCourses.map((courseProgress) => (
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
            </CardContent>
          </Card>
        </Grid>
      ))}

      <PaginationControls 
        count={courses.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Grid>
  );
};

export default ProfileCoursesProgress;