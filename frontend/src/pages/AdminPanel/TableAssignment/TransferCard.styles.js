// TransferCard.styles.js
export const cardStyles = {
  card: (cardHeight, minHeight, maxHeight) => ({
    height: cardHeight,
    minHeight: minHeight,
    maxHeight: maxHeight,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }),
  
  cardHeader: {
    px: 2,
    py: 1,
    bgcolor: 'grey.50',
    flexShrink: 0,
    '& .MuiCardHeader-content': {
      overflow: 'hidden',
    },
    '& .MuiCardHeader-title': {
      fontSize: '1rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '& .MuiCardHeader-subheader': {
      fontSize: '0.875rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }
  },
  
  list: {
    flex: 1,
    minHeight: 200,
    overflow: 'auto',
    p: 0,
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#555',
    }
  },
  
  listItemButton: {
    px: 2,
    py: 1,
    // Светлый цвет выделения для лучшей читаемости текста
    '&.Mui-selected': {
      backgroundColor: 'primary.50', // Очень светлый синий
      '&:hover': {
        backgroundColor: 'primary.100', // Чуть темнее при наведении
      }
    },
    // Для темной темы
    '&.Mui-selected.MuiListItemButton-root.Mui-selected': {
      backgroundColor: 'primary.50',
    }
  },
  
  checkboxIcon: {
    minWidth: 42,
  },
  
  primaryText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.875rem',
  },
  
  secondaryText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '0.75rem',
  },
  
  noDataItem: {
    justifyContent: 'center',
    py: 3,
  },
  
  noDataText: {
    textAlign: 'center',
    color: 'text.secondary',
    '& .MuiListItemText-primary': {
      fontSize: '0.875rem',
    }
  },
};