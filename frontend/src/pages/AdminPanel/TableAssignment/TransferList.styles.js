// TransferList.styles.js
export const styles = {
  container: {
    p: { xs: 1, sm: 2, md: 3 },
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 500,
    maxHeight: '90vh',
    width: '100%',
  },
  
  gridContainer: {
    alignItems: 'stretch',
    mb: 2,
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
  },
  
  cardContainer: {
    display: 'flex',
  },
  
  buttonColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: 300,
    gap: 1,
  },
  
  actionButtons: {
    my: 0.5,
    minWidth: 40,
    height: 36,
  },
  
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 2,
    pt: 2,
    borderTop: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
    mt: 'auto',
    px: { xs: 0, sm: 1 },
  },
  
  // Размеры для разных типов
  cardSizes: {
    profile: {
      height: '600px',
      minHeight: 400,
      maxHeight: '70vh',
    },
    course: {
      height: '500px',
      minHeight: 400,
      maxHeight: '60vh',
    },
    branch: {
      height: '400px',
      minHeight: 300,
      maxHeight: '50vh',
    },
  },
  
  // Цвета для выделенных элементов (альтернативные варианты)
  selectionColors: {
    lightBlue: 'primary.50',     // Очень светлый синий
    lightGreen: 'success.50',    // Очень светлый зеленый
    lightPurple: 'secondary.50', // Очень светлый фиолетовый
    lightGray: 'grey.100',       // Светло-серый
    lightYellow: 'warning.50',   // Очень светлый желтый
  }
};