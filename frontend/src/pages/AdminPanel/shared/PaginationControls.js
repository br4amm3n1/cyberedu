import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Pagination from '@mui/material/Pagination';

const PaginationControls = ({ 
  count, 
  page, 
  rowsPerPage, 
  rowsPerPageLabel,
  rowsPerPageOptions,
  onPageChange, 
  onRowsPerPageChange,
}) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Pagination
        count={Math.ceil(count / rowsPerPage)}
        page={page}
        onChange={(e, newPage) => onPageChange(newPage)}
        color="primary"
      />
      
      <FormControl size="small" sx={{ width: '150px', ml: 2 }}>
        <InputLabel>{rowsPerPageLabel}</InputLabel>
        <Select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(e.target.value)}
          label="Строк на странице"
        >
          {rowsPerPageOptions.map((num) => (
            <MenuItem key={num} value={num}>{num}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default PaginationControls;