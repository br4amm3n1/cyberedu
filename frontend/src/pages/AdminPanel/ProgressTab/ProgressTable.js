import React from 'react';
import { 
  TableContainer, Table, TableHead, TableBody, 
  TableRow, TableCell, Paper 
} from '@mui/material';
import { adminPanelStyles } from '../adminPanelStyles';

const ProgressTable = ({ progressData, page, rowsPerPage }) => {
  const paginatedProgress = progressData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'in_progress': return 'В процессе';
      default: return 'Не начат';
    }
  };

  return (
    <TableContainer component={Paper} sx={adminPanelStyles.progressTableContainer}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '150px' }}>Пользователь</TableCell>
            <TableCell sx={{ width: '200px' }}>Курс</TableCell>
            <TableCell sx={{ width: '120px' }}>Статус</TableCell>
            <TableCell sx={{ width: '100px' }}>Прогресс</TableCell>
            <TableCell sx={{ width: '120px' }}>Дата начала</TableCell>
            <TableCell sx={{ width: '120px' }}>Дата завершения</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProgress.map((progress) => (
            <TableRow key={`${progress.user.id}-${progress.course.id}`}>
              <TableCell sx={adminPanelStyles.progressTableCell}>
                {progress.user?.firstname && progress.user?.lastname 
                  ? `${progress.user.firstname} ${progress.user.lastname}`
                  : progress.user?.username || `ID: ${progress.user?.id}`}
              </TableCell>
              <TableCell sx={adminPanelStyles.progressTableCell}>
                {progress.course.title}
              </TableCell>
              <TableCell sx={adminPanelStyles.progressTableCell}>
                {getStatusText(progress.status)}
              </TableCell>
              <TableCell sx={adminPanelStyles.progressTableCell}>
                {progress.progress_percent}%
              </TableCell>
              <TableCell sx={adminPanelStyles.progressTableCell}>
                {progress.started_at ? new Date(progress.started_at).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell sx={adminPanelStyles.progressTableCell}>
                {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString() : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProgressTable;