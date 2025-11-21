import React from 'react';
import { 
    Paper, Typography, Box, 
    Chip, List, ListItem, 
    ListItemText, ListItemIcon, 
    Radio, Checkbox, TextField,
    CardMedia 
} from '@mui/material';
import { getImage } from '../../../api/courses';

const TestQuestion = ({ 
  question, 
  index, 
  userAnswers, 
  textAnswers, 
  handleOptionChange, 
  handleTextAnswerChange,
  options
}) => {
  const renderQuestionOptions = () => {
    if (!options[question.id]) {
      return <Typography>Нет вариантов ответа</Typography>;
    }
    
    const questionOptions = options[question.id];
    if (!Array.isArray(questionOptions)) {
      return <Typography>Ошибка загрузки вариантов ответа</Typography>;
    }

    switch (question.question_type) {
      case 'single':
        return (
          <List>
            {questionOptions.map((option) => (
              <ListItem 
                key={option.id} 
                button
                onClick={() => handleOptionChange(question.id, option.id, false)}
              >
                <ListItemIcon>
                  <Radio
                    checked={userAnswers[question.id]?.includes(option.id) || false}
                    onChange={() => handleOptionChange(question.id, option.id, false)}
                  />
                </ListItemIcon>
                <ListItemText primary={option.text} />
              </ListItem>
            ))}
          </List>
        );
      case 'multiple':
        return (
          <List>
            {questionOptions.map((option) => (
              <ListItem 
                key={option.id} 
                button
                dense
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={userAnswers[question.id]?.includes(option.id) || false}
                    onChange={() => handleOptionChange(question.id, option.id, true)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={option.text} 
                  onClick={() => handleOptionChange(question.id, option.id, true)}
                />
              </ListItem>
            ))}
          </List>
        );
      case 'text':
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Введите ваш ответ"
            value={textAnswers[question.id] || ''}
            onChange={(e) => handleTextAnswerChange(question.id, e.target.value)}
            sx={{ mt: 2 }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Вопрос {index + 1}
      </Typography>
      <Typography sx={{ mb: 2 }}>{question.text}</Typography>
      
      <Box display="flex" gap={1} mb={2}>
        <Chip label={question.question_type} size="small" />
        <Chip label={`${question.points} баллов`} size="small" color="primary" />
      </Box>
      
      <Typography variant="subtitle2" gutterBottom>
        Варианты ответа:
      </Typography>
      
      {renderQuestionOptions()}
    </Paper>
  );
};

export default TestQuestion;