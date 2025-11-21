import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, CircularProgress, Alert, Paper, Typography } from '@mui/material';
import api from '../../../api/courses';
import TestHeader from './TestHeader';
import TestQuestionsList from './TestQuestionsList';
import TestSubmitButton from './TestSubmitButton';

const TestDetail = () => {
  const { id, testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userAnswers, setUserAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const questionsPerPage = 5;

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const testResponse = await api.get(`tests/${testId}/?course_id=${id}`);
        
        if (testResponse.data.error) {
          throw new Error(testResponse.data.error);
        }
        
        setTest(testResponse.data);

        const questionsResponse = await api.get(`questions/?test_id=${testId}`);
        const questions = questionsResponse.data.results || questionsResponse.data;
        
        if (!Array.isArray(questions)) {
          throw new Error('Questions data is not an array');
        }

        setQuestions(questions);

        const optionsData = {};
        for (const question of questions) {
          const optionsResponse = await api.get(`options/?question_id=${question.id}`);
          optionsData[question.id] = optionsResponse.data.options || optionsResponse.data;
        }
        setOptions(optionsData);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки данных');
        console.error('Error loading test:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [id, testId]);

  // Эффект для прокрутки страницы вверх при успешной отправке
  useEffect(() => {
    if (submitSuccess) {
      // Прокручиваем страницу к верху
      window.scrollTo(0, 0);
    }
  }, [submitSuccess]); // Срабатывает при изменении submitSuccess

  const handleOptionChange = (questionId, optionId, isMultiple) => {
    setUserAnswers(prev => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        const newAnswers = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: newAnswers };
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const handleTextAnswerChange = (questionId, text) => {
    setTextAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const allQuestionsAnswered = () => {
    return questions.every(question => {
      if (question.question_type === 'text') {
        return textAnswers[question.id]?.trim() !== '';
      } else {
        return userAnswers[question.id]?.length > 0;
      }
    });
  };

  const handleSubmitTest = async () => {
    if (!allQuestionsAnswered()) {
      setError('Пожалуйста, ответьте на все вопросы перед завершением теста');
      return;
    }

    setSubmitting(true);
    try {
      const answers = [];
      
      Object.entries(userAnswers).forEach(([questionId, optionIds]) => {
        const question = questions.find(q => q.id == questionId);
        if (!question) return;
        
        answers.push({
          question: questionId,
          selected_options: optionIds,
          answer_data: null
        });
      });
      
      Object.entries(textAnswers).forEach(([questionId, text]) => {
        answers.push({
          question: questionId,
          selected_options: [],
          answer_data: text
        });
      });
      
      const response = await api.post(`tests/${testId}/submit/`, {
        answers,
        course_id: id
      });
      
      setSubmitSuccess(true);
      setTimeout(() => navigate(`/courses/${id}/tests`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при сохранении ответов');
      console.error('Error submitting test:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) {
    return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="h6" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate(`/courses/${id}`)}
            sx={{ mt: 2 }}
          >
            Вернуться к курсу
          </Button>
        </Paper>
      </Container>
    );
  }

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );

  const answeredCount = questions.filter(question => {
    if (question.question_type === 'text') {
      return textAnswers[question.id]?.trim() !== '';
    } else {
      return userAnswers[question.id]?.length > 0;
    }
  }).length;

  return (
    <Container maxWidth="md">
      <Button 
        onClick={() => navigate(`/courses/${id}/tests`)}
        sx={{ mb: 2 }}
      >
        Назад к списку тестов
      </Button>
      
      <TestHeader test={test} questions={questions} answeredCount={answeredCount} />
      
      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Тест успешно отправлен! Вы будете перенаправлены на страницу тестов...
        </Alert>
      )}
      
      <TestQuestionsList
        questions={currentQuestions}
        currentPage={currentPage}
        questionsPerPage={questionsPerPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        userAnswers={userAnswers}
        textAnswers={textAnswers}
        handleOptionChange={handleOptionChange}
        handleTextAnswerChange={handleTextAnswerChange}
        options={options}
      />
      
      <TestSubmitButton
        submitting={submitting}
        submitSuccess={submitSuccess}
        handleSubmitTest={handleSubmitTest}
        allAnswered={allQuestionsAnswered()}
        questionsCount={questions.length}
        answeredCount={answeredCount}
      />
    </Container>
  );
};

export default TestDetail;