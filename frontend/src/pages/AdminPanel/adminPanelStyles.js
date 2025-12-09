// src/styles/adminPanelStyles.js
export const adminPanelStyles = {
  tableContainer: {
    mt: 2,
    maxWidth: '100%',
    overflowX: 'auto' // Добавляем горизонтальный скролл только при необходимости
  },
  fixedTable: {
    tableLayout: 'fixed', // Меняем на fixed для жесткого контроля ширины
    width: '97%'
  },
  column: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  idColumn: {
    width: '80px'
  },
  usernameColumn: {
    width: '150px'
  },
  emailColumn: {
    width: '200px'
  },
  courseSelectColumn: {
    width: '300px'
  },
  actionsColumn: {
    width: '150px'
  },
  select: {
    '& .MuiSelect-select': {
      whiteSpace: 'normal',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    }
  },
  menuProps: {
    PaperProps: {
      style: {
        maxHeight: 300,
        width: 'fit-content', // Ширина по содержимому, но не более 300px
        maxWidth: 300,
      },
    },
  },
  menuItem: {
    whiteSpace: 'normal',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  },
  progressTableContainer: {
    maxHeight: '600px',
    overflow: 'auto',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
  },
  
  progressTableCell: {
    padding: '12px 16px',
    verticalAlign: 'top',
  },
  selectCell: {
    width: '300px',
    maxWidth: '300px',
    overflow: 'hidden'
  },
  selectWrapper: {
    width: '100%',
    maxWidth: '300px',
    display: 'inline-block'
  },
  pagination: {
    '& .MuiPagination-ul': {
        justifyContent: 'center',
    },
    marginTop: 2,
    marginBottom: 2
  },
    
  rowsPerPageSelect: {
    minWidth: 120,
    marginLeft: 'auto',
    marginBottom: 2
  }
};