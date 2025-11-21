import React, { useState, useMemo } from 'react';
import { Box, TextField } from '@mui/material';
import UsersTable from './UsersTable';
import PaginationControls from '../shared/PaginationControls';

const UsersTab = ({ users, courses, onError, onSuccess }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedCourses, setSelectedCourses] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтрация пользователей по имени
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.first_name?.toLowerCase().includes(term) ||
      user.last_name?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handlePageChange = (newPage) => setPage(newPage);
  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Сбрасываем на первую страницу при поиске
  };

  return (
    <>
      {/* Поле поиска */}
      <Box mt={2} mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск по имени пользователя..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <PaginationControls 
        count={filteredUsers.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      
      <Box mt={2}>
        <UsersTable
          users={filteredUsers}
          courses={courses}
          page={page}
          rowsPerPage={rowsPerPage}
          selectedCourses={selectedCourses}
          setSelectedCourses={setSelectedCourses}
          onError={onError}
          onSuccess={onSuccess}
        />
      </Box>
    </>
  );
};

export default UsersTab;