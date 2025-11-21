import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';

const SelectionModal = ({ 
  open, 
  onClose, 
  title, 
  children,
  maxWidth = 'md'
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={maxWidth}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default SelectionModal;