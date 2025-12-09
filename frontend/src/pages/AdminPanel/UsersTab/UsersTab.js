import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Grid, 
  Typography,
  Container,
  CircularProgress
} from '@mui/material';
import SelectAllTransferList from '../TableAssignment/TransferList';
import SelectionModal from '../shared/SelectionModal';
import { SelectionCard } from '../shared/SelectionCard';
import { assignCourseToUser } from '../../../api/courses';
import { getProfiles, getBranchChoices } from '../../../api/auth';
import { getAllCourses } from '../../../api/courses';

const UsersTab = ({ onError, onSuccess }) => {
  // Состояния для данных
  const [profiles, setProfiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [branchChoices, setBranchChoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Состояния для модальных окон
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  
  // Выбранные пользователи и курсы
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [selectedCoursesForBulk, setSelectedCoursesForBulk] = useState([]);

  // Загрузка данных при монтировании
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profilesData, coursesData, branchesData] = await Promise.all([
          getProfiles(),
          getAllCourses(),
          getBranchChoices()
        ]);
        setProfiles(profilesData);
        setCourses(coursesData);
        setBranchChoices(branchesData);
      } catch (error) {
        onError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [onError]);

  const handleOpenUserModal = () => setUserModalOpen(true);
  const handleCloseUserModal = () => setUserModalOpen(false);
  
  const handleSaveUsers = (selectedProfiles) => {
    setSelectedProfiles(selectedProfiles);
    setUserModalOpen(false);
  };

  const handleOpenCourseModal = () => setCourseModalOpen(true);
  const handleCloseCourseModal = () => setCourseModalOpen(false);
  const handleSaveCourses = (courses) => {
    setSelectedCoursesForBulk(courses);
    setCourseModalOpen(false);
  };

  const handleRemoveUser = (profileId) => {
    setSelectedProfiles(prev => prev.filter(profile => profile.id !== profileId));
  };

  const handleRemoveCourse = (courseId) => {
    setSelectedCoursesForBulk(prev => prev.filter(course => course.id !== courseId));
  };

  const handleBulkAssign = async () => {
    if (!selectedProfiles.length || !selectedCoursesForBulk.length) {
      onError('Выберите пользователей и курсы для назначения');
      return;
    }

    try {
      const assignments = [];
      
      for (const profile of selectedProfiles) {
        for (const course of selectedCoursesForBulk) {
          assignments.push({ profile, course });
        }
      }

      const results = await Promise.allSettled(
        assignments.map(({ profile, course }) => 
          assignCourseToUser({ 
            user_id: profile.user.id, 
            course_id: course.id 
          })
        )
      );

      const successful = [];
      const alreadyAssigned = [];
      const failed = [];

      results.forEach((result, index) => {
        const { profile, course } = assignments[index];
        
        if (result.status === 'fulfilled') {
          if (result.value.status === 'already subscribed') {
            alreadyAssigned.push({ profile, course });
          } else {
            successful.push({ profile, course });
          }
        } else {
          failed.push({ profile, course, error: result.reason });
        }
      });

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
        setSelectedProfiles([]);
        setSelectedCoursesForBulk([]);
      } else {
        onError(message.trim());
      }

    } catch (error) {
      onError('Ошибка при массовом назначении курсов');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

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
          allItems={profiles}
          selectedItems={selectedProfiles}
          onSave={handleSaveUsers}
          onClose={handleCloseUserModal}
          type="profile"
          branchChoices={branchChoices}
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
            items={selectedProfiles}
            onAdd={handleOpenUserModal}
            onRemove={handleRemoveUser}
            type="profile"
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
            {selectedProfiles.length} пользователей × {selectedCoursesForBulk.length} курсов = {selectedProfiles.length * selectedCoursesForBulk.length} назначений
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleBulkAssign}
            disabled={selectedProfiles.length === 0 || selectedCoursesForBulk.length === 0}
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