import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, resendConfirmationEmail } from '../../api/auth';
import { TextField, Button, Typography, Container, Box, Link } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const { handleLogin } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Обязательное поле'),
      password: Yup.string().required('Обязательное поле'),
    }),
    onSubmit: async (values) => {
      try {
        await login(values);
        await handleLogin();
        
        navigate('/');
      } catch (err) {
        if (err.error) {
          if (err.error === 'email_not_confirmed') {
            setErrorType('email');
            setError(err.message);
          } else {
            setErrorType('auth');
            setError(err.message || 'Ошибка авторизации');
          }
        } else {
          setErrorType('auth');
          setError('Ошибка соединения с сервером');
        }
      }
    },
  });

  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(60);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, countdown]);

  const handleResendConfirmation = async (email) => {
    try {
      setResendDisabled(true);
      setCountdown(60);
      await resendConfirmationEmail(email);
      setErrorType('email');
      setError('Письмо с подтверждением отправлено повторно. Проверьте вашу почту.');
    } catch (err) {
      setErrorType('email');
      setError(err.message || 'Ошибка при отправке письма');
      setResendDisabled(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom>Вход</Typography>
        {errorType === 'email' && (
          <Box sx={{ 
            backgroundColor: '#fff3e0',
            p: 2,
            mb: 2,
            borderLeft: '4px solid #ffa000'
          }}>
            <Typography color="warning.main">
              {error}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Не получили письмо?{' '}
              <Link 
                component="button" 
                variant="body2"
                onClick={() => handleResendConfirmation(formik.values.username)}
                sx={{ color: 'primary.main' }}
                disabled={resendDisabled}
              >
                {resendDisabled ? `Отправить повторно (${countdown} сек)` : 'Отправить повторно'}
              </Link>
            </Typography>
          </Box>
        )}
        
        {errorType === 'auth' && (
          <Typography color="error">{error}</Typography>
        )}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Электронный почтовый адрес"
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Пароль"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            Войти
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Login;