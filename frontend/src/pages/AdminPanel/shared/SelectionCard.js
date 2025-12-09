import { 
  Box, 
  Card, 
  CardHeader, 
  List, 
  ListItem, 
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export const SelectionCard = ({ title, items, onAdd, onRemove, type }) => (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
    }}>
      <CardHeader 
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">{title}</Typography>
            <Chip 
              label={items.length} 
              color="primary" 
              size="small" 
            />
          </Box>
        }
        action={
          <IconButton 
            onClick={onAdd}
            sx={{
              width: '40px',
              height: '40px',
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }}
          >
            <AddIcon />
          </IconButton>
        }
        sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
      />
      <List sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        height: '300px',
        minHeight: '300px',
        maxHeight: '300px'
      }}>
        {items.length > 0 ? (
          items.map((item) => (
            <ListItem 
              key={item.id} 
              divider
              secondaryAction={
                <Tooltip title="Удалить">
                  <IconButton 
                    edge="end" 
                    onClick={() => onRemove(item.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemText 
                primary={
                  <Typography variant="body1" fontWeight="medium">
                    {type === 'profile' 
                      ? `${item.user.first_name} ${item.user.last_name}`
                      : item.title
                    }
                  </Typography>
                }
                secondary={
                  type === 'profile' 
                    ? `${item.user.email} • ${item.branch || 'Не указано'}` 
                    : `ID: ${item.id} • ${item.category || 'Без категории'}`
                }
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText 
              primary={
                <Typography color="text.secondary" textAlign="center">
                  Нет выбранных элементов
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Нажмите "+" чтобы выбрать
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Card>
  );