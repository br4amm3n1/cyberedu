// ConfirmEmail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { confirmEmail } from '../../api/auth';
import { Typography, Container, Box, CircularProgress } from '@mui/material';

const ConfirmEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirm = async () => {
      try {
        const data = await confirmEmail(token);
        setMessage(data.info);
      } catch (error) {
        setMessage('Invalid or expired confirmation link.');
      } finally {
        setLoading(false);
      }
    };

    confirm();
  }, [token]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Typography variant="h5">{message}</Typography>
        )}
      </Box>
    </Container>
  );
};

export default ConfirmEmail;