import { List, Card, CardHeader, 
    ListItemButton, ListItemText, ListItemIcon, 
    Checkbox, Divider, Typography } 
from '@mui/material';
import { cardStyles } from './TransferCard.styles';

function intersection(a, b) {
    return a.filter((value) => b.includes(value));
};

const TransferCard = ({ 
  title,
  items,
  checked,
  onToggle,
  onToggleAll,
  getDisplayName,
  getSecondaryText,
  SearchField,
  type = 'profile',
  cardHeight = '600px',
  minHeight = 400,
  maxHeight = '70vh',
}) => {
  const numberOfChecked = intersection(checked, items).length;

  return (
    <Card sx={cardStyles.card(cardHeight, minHeight, maxHeight)}>
      <CardHeader
        sx={cardStyles.cardHeader}
        avatar={
          <Checkbox
            onClick={onToggleAll(items)}
            checked={numberOfChecked === items.length && items.length !== 0}
            indeterminate={numberOfChecked !== items.length && numberOfChecked !== 0}
            disabled={items.length === 0}
            size="small"
          />
        }
        title={title}
        subheader={`${numberOfChecked}/${items.length} выбрано`}
      />
      
      {SearchField && SearchField}

      <Divider />
      <List
        sx={cardStyles.list}
        dense
        component="div"
        role="list"
      >
        {items.length > 0 ? (
          items.map((item) => {
            const displayName = getDisplayName(item, type);
            const secondaryText = getSecondaryText(item, type);
            const itemId = type === 'branch' ? item[0] : item.id;

            return (
              <ListItemButton
                key={itemId}
                role="listitem"
                onClick={onToggle(item)}
                selected={checked.includes(item)}
                sx={cardStyles.listItemButton}
              >
                <ListItemIcon sx={cardStyles.checkboxIcon}>
                  <Checkbox
                    checked={checked.includes(item)}
                    tabIndex={-1}
                    disableRipple
                    size="small"
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography 
                      variant="body2" 
                      sx={cardStyles.primaryText}
                    >
                      {displayName}
                    </Typography>
                  }
                  secondary={secondaryText && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={cardStyles.secondaryText}
                    >
                      {secondaryText}
                    </Typography>
                  )}
                />
              </ListItemButton>
            );
          })
        ) : (
          <ListItemButton 
            disabled 
            sx={cardStyles.noDataItem}
          >
            <ListItemText 
              primary="Нет данных" 
              sx={cardStyles.noDataText}
            />
          </ListItemButton>
        )}
      </List>
    </Card>
  );
};

export default TransferCard;