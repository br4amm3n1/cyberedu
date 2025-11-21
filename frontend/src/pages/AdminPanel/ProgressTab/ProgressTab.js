import React, { useState } from 'react';
import { Box } from '@mui/material';
import ProgressTable from './ProgressTable';
import PaginationControls from '../shared/PaginationControls';

const ProgressTab = ({ progressData }) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handlePageChange = (newPage) => setPage(newPage);
  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(value);
    setPage(1);
  };

  return (
    <>
      <PaginationControls 
        count={progressData.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      
      <Box mt={2}>
        <ProgressTable 
          progressData={progressData} 
          page={page}
          rowsPerPage={rowsPerPage}
        />
      </Box>
    </>
  );
};

export default ProgressTab;