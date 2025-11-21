import React, { useState, useEffect } from 'react';
import { register } from '../../api/auth';
import { TextField, Button, Typography, Container, Box, Paper, 
  Step, StepLabel, Stepper, Alert, MenuItem } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Register = () => {
  const [error, setError] = useState('');
  const [domainError, setDomainError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const branchOptions = [
    { value: 'cardio', label: 'НИИ Кардиологии' },
    { value: 'oncology', label: 'НИИ Онкологии' },
    { value: 'tumen', label: 'Тюменский кардиологический научный центр' },
    { value: 'pz', label: 'НИИ Психического здоровья' },
    { value: 'medgenetics', label: 'НИИ Медицинской генетики' },
    { value: 'pharma', label: 'НИИ Фармакологии и регенеративной медицины' },
    { value: 'head', label: 'Аппарат управления ТНИМЦ' },
  ];

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      patronymic: '',
      department: '',
      position: '',
      branch: '',
      password: '',
      password2: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Обязательное поле'),
      email: Yup.string().email('Некорректный адрес электронной почты').required('Обязательное поле'),
      first_name: Yup.string().required('Обязательное поле'),
      last_name: Yup.string().required('Обязательное поле'),
      patronymic: Yup.string(),
      department: Yup.string().required('Обязательное поле'),
      position: Yup.string().required('Обязательное поле'),
      branch: Yup.string().required('Обязательное поле'),
      password: Yup.string().required('Обязательное поле').min(8),
      password2: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Пароли не совпадают')
        .required('Обязательное поле'),
    }),
    onSubmit: async (values) => {
      try {
        const { password2, ...userData } = values;
        const data = await register(userData);
        setSuccess('Вы успешно зарегистрировались. Вам на почту отправлено письмо с подтверждением адреса электронной почты');
        setError('');
      } catch (err) {
        if (err.username) {
          setError('Пользователь с таким электронным почтовым адресом уже существует.')
        } else if (err.password) {
          setError('Пароль должен быть длиной не менее 8 символов и содержать хотя бы 1 символ, 1 цифру и 1 заглавную букву.');
        } else {
          setError(err.email || 'Регистрация не удалась');
        }
        setSuccess('');
      }
    },
  });

  // Автоматическое заполнение username на основе email
  useEffect(() => {
    if (formik.values.email) {
      const username = formik.values.email;
      formik.setFieldValue('username', username);
    }
  }, [formik.values.email]);

  useEffect(() => {
    if (formik.values.email && domainError) {
      const isValidDomain = checkMailDomain(formik.values.email);
      if (isValidDomain) {
        setDomainError(false);
        setError('');
      }
    }
  }, [formik.values.email, domainError]);
  
  const checkMailDomain = (email) => {
    if (!email) return false; 

    const allowedDomains = ['medgenetics', 'tnimc', 'pharmso', 'cardio-tomsk', 'infarkta'];

    const nameMailDomain = email.slice(email.indexOf('@') + 1, email.lastIndexOf('.'));

    return allowedDomains.includes(nameMailDomain);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Проверка заполнения всех обязательных полей
      const requiredFields = ['email', 'first_name', 'last_name', 'department', 'position', 'branch'];
      const emptyFields = requiredFields.filter(field => !formik.values[field]);
      
      if (emptyFields.length > 0) {
        // Помечаем незаполненные поля как touched, чтобы показать ошибки
        emptyFields.forEach(field => {
          formik.setFieldTouched(field, true);
        });
        setError('Заполните все обязательные поля');
        return;
      }

      // Проверка валидности email
      if (formik.errors.email) {
        formik.setFieldTouched('email', true);
        setError(formik.errors.email);
        return;
      }

      // Проверка домена email
      const isValidDomain = checkMailDomain(formik.values.email);
      if (!isValidDomain) {
        setDomainError(true);
        formik.setFieldTouched('email', true);
        setError('Для регистрации воспользуйтесь адресом личной корпоративной почты.');
        return;
      }

      // Проверка ошибок валидации для всех полей
      const fieldsWithErrors = requiredFields.filter(field => formik.errors[field]);
      if (fieldsWithErrors.length > 0) {
        fieldsWithErrors.forEach(field => {
          formik.setFieldTouched(field, true);
        });
        setError('Исправьте ошибки в полях');
        return;
      }

      // Все проверки пройдены - переходим на следующий шаг
      setActiveStep(activeStep + 1);
      setError('');
      setDomainError(false);
    } else {
      formik.handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Регистрация</Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          <Step><StepLabel>Информация о вас</StepLabel></Step>
          <Step><StepLabel>Ввод пароля</StepLabel></Step>
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && <Typography color="success">{success}</Typography>}
        
        <Paper elevation={3} sx={{ p: 3 }}>
          {activeStep === 0 ? (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Имя пользователя"
                name="username"
                value={formik.values.username}
                disabled
              />
              <TextField
                fullWidth
                margin="normal"
                label="Фамилия"
                name="last_name"
                value={formik.values.last_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Имя"
                name="first_name"
                value={formik.values.first_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                helperText={formik.touched.first_name && formik.errors.first_name}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Отчество"
                name="patronymic"
                value={formik.values.patronymic}
                onChange={formik.handleChange}
              />
              <TextField
                select
                fullWidth
                margin="normal"
                label="Подразделение"
                name="branch"
                value={formik.values.branch}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.branch && Boolean(formik.errors.branch)}
                helperText={formik.touched.branch && formik.errors.branch}
              >
                {branchOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                margin="normal"
                label="Отдел"
                name="department"
                value={formik.values.department}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.department && Boolean(formik.errors.department)}
                helperText={formik.touched.department && formik.errors.department}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Должность"
                name="position"
                value={formik.values.position}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.position && Boolean(formik.errors.position)}
                helperText={formik.touched.position && formik.errors.position}
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Пароль"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Подтверждение пароля"
                name="password2"
                type="password"
                value={formik.values.password2}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password2 && Boolean(formik.errors.password2)}
                helperText={formik.touched.password2 && formik.errors.password2}
              />
            </>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} variant="outlined">
                Назад
              </Button>
            )}
            <Button
              onClick={handleNext}
              variant="contained"
              color="primary"
              sx={{ ml: 'auto' }}
            >
              {activeStep === 0 ? 'Далее' : 'Зарегистрироваться'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;