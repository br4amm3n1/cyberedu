import React from 'react';
import { Box, Paper, Pagination, Typography } from '@mui/material';
import TestQuestion from './TestQuestion';

const TestQuestionsList = ({ 
  questions, 
  currentPage, 
  questionsPerPage, 
  totalPages, 
  handlePageChange,
  userAnswers,
  textAnswers,
  handleOptionChange,
  handleTextAnswerChange,
  options
}) => {
  const indexOfFirstQuestion = (currentPage - 1) * questionsPerPage;
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>Вопросы</Typography>
      
      {questions.length === 0 ? (
        <Typography>В этом тесте нет вопросов</Typography>
      ) : (
        <Box>
          {questions.map((question, index) => (
            <TestQuestion
              key={question.id}
              question={question}
              index={indexOfFirstQuestion + index}
              userAnswers={userAnswers}
              textAnswers={textAnswers}
              handleOptionChange={handleOptionChange}
              handleTextAnswerChange={handleTextAnswerChange}
              options={options}
            />
          ))}
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TestQuestionsList;