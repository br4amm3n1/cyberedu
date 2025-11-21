import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  MenuItem
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api, { 
    getCurrentUser, 
    updateUserData, updateProfileData 
} from '../../api/auth';
import { AuthContext } from '../../context/AuthContext';

const EditProfile = () => {
  const { user, profile, updateAuthState } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const isSubmitting = useRef(false);

  const branchOptions = [
    { value: '', label: 'Не выбрано' },
    { value: 'cardio', label: 'НИИ Кардиологии' },
    { value: 'oncology', label: 'НИИ Онкологии' },
    { value: 'tumen', label: 'Тюменский кардиологический научный центр' },
    { value: 'pz', label: 'НИИ Психического здоровья' },
    { value: 'medgenetics', label: 'НИИ Медицинской генетики' },
    { value: 'pharma', label: 'НИИ Фармакологии и регенеративной медицины' },
    { value: 'head', label: 'Аппарат управления ТНИМЦ' },
  ];

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      position: '',
      department: '',
      branch: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Неправильный адрес электронной почты'),
      first_name: Yup.string().max(50, 'Имя не должно превышать 50 символов'),
      last_name: Yup.string().max(50, 'Фамилия не должна превышать 50 символов'),
      position: Yup.string().max(100, 'Должность не должна превышать 100 символов'),
      department: Yup.string().max(100, 'Отдел не должен превышать 100 символов'),
      branch: Yup.string()
    }),
    onSubmit: async (values) => {
      if (isSubmitting.current) return;
      isSubmitting.current = true;
      
      setSaving(true);
      setError(null);
      setSuccess(null);

      try {
          await updateUserData(user.id, {
            first_name: values.first_name,
            last_name: values.last_name
          });

          await new Promise(resolve => setTimeout(resolve, 100));

          await updateProfileData(profile.id, {
            position: values.position,
            department: values.department,
            branch: values.branch || null,
          });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const updatedData = await getCurrentUser();

        updateAuthState({
          user: updatedData.user,
          profile: updatedData.profile,
        });
        
        setSuccess('Профиль успешно обновлен!');
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
        
      } catch (error) {
        setError('Ошибка обновления профиля');
      } finally {
        setSaving(false);
        isSubmitting.current = false;
      }
    }
  });

  useEffect(() => {
    if (user && profile) {
      if (formik.values.first_name === '') {
        formik.setValues({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          position: profile.position || '',
          department: profile.department || '',
          branch: profile.branch || '',
        });
      }
      setLoading(false);
    }
  }, [user, profile]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !profile) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Редактирование профиля
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Box mb={3}>
            <TextField
              fullWidth
              label="Имя"
              name="first_name"
              value={formik.values.first_name}
              onChange={formik.handleChange}
              error={formik.touched.first_name && Boolean(formik.errors.first_name)}
              helperText={formik.touched.first_name && formik.errors.first_name}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Фамилия"
              name="last_name"
              value={formik.values.last_name}
              onChange={formik.handleChange}
              error={formik.touched.last_name && Boolean(formik.errors.last_name)}
              helperText={formik.touched.last_name && formik.errors.last_name}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Адрес электронной почты"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              required
              disabled
              sx={{ mb: 2 }}
            />

            <TextField
                select
                fullWidth
                label="Подразделение"
                name="branch"
                value={formik.values.branch}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.branch && Boolean(formik.errors.branch)}
                helperText={formik.touched.branch && formik.errors.branch}
                sx={{ mb: 2 }}
              >
                {branchOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              fullWidth
              label="Должность"
              name="position"
              value={formik.values.position}
              onChange={formik.handleChange}
              error={formik.touched.position && Boolean(formik.errors.position)}
              helperText={formik.touched.position && formik.errors.position}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Отдел"
              name="department"
              value={formik.values.department}
              onChange={formik.handleChange}
              error={formik.touched.department && Boolean(formik.errors.department)}
              helperText={formik.touched.department && formik.errors.department}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate('/profile')}
            >
              Отменить
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Сохранить'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditProfile;