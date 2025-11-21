import React from 'react';
import { Box, Button, CircularProgress, Tooltip } from '@mui/material';

const TestSubmitButton = ({ 
    submitting, 
    submitSuccess, 
    handleSubmitTest,
    allAnswered,
    questionsCount,
    answeredCount 
  }) => {
    const disabled = submitting || submitSuccess || !allAnswered;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Tooltip 
            title={!allAnswered ? `Ответьте на все вопросы (${answeredCount}/${questionsCount})` : ''}
            arrow
          >
            <span>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmitTest}
                disabled={disabled}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Отправка...
                  </>
                ) : (
                  'Завершить тест'
                )}
              </Button>
            </span>
          </Tooltip>
        </Box>
      );
    };
    
    export default TestSubmitButton;