import { styled } from '@mui/material/styles';
import { Container, Typography, 
        Grid, Card, CardContent,
        Box, TextField
       } 
from '@mui/material';

export const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4, 0),
}));

export const StyledGridContainer = styled(Grid)(({ theme }) => ({
  display: "grid",
  justifyContent: 'center',
  marginTop: theme.spacing(4), // Добавлен отступ сверху
  '& .MuiGrid-item': {
    paddingLeft: '0 !important',
    paddingRight: '0 !important'
  },
  gridTemplateColumns: "auto auto",
}));

export const StyledGridItem = styled(Grid)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(0, 1.5),
}));

export const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  height: '320px',
  display: 'flex',
  flexDirection: 'column',
  textDecoration: 'none',
  transition: 'box-shadow 0.3s ease-in-out', // Добавлена анимация
  '&:hover': {
    boxShadow: theme.shadows[6], // Усилен эффект при наведении
  }
}));

export const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flex: '1 1 auto',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
}));

export const StyledTitle = styled(Typography)({
  marginBottom: '16px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  lineHeight: '1.5rem'
});

export const StyledDescription = styled(Typography)({
  flex: '1 1 auto',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 5,
  WebkitBoxOrient: 'vertical',
  marginBottom: '16px'
});

export const StyledSubscribedText = styled(Typography)(({ theme }) => ({
  display: 'flex', 
  alignItems: 'center',
  justifyContent: 'center',
  height: '36px',
  color: theme.palette.success.main,
}));

export const StyledSearchBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export const StyledSearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.dark,
    },
  },
}));