import React, {useEffect, useState } from 'react'
import { Grid, List, Card, CardHeader, 
    ListItemButton, ListItemText, ListItemIcon, 
    Checkbox, Button, Divider, Typography, Box } 
from '@mui/material';

function not(a, b) {
  return a.filter((value) => !b.includes(value));
}

function intersection(a, b) {
  return a.filter((value) => b.includes(value));
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

export default function SelectAllTransferList({ 
  allItems = [], 
  selectedItems = [],
  onSave,
  onClose,
  title = "Выбор элементов",
  type = "user"
}) {
  const [checked, setChecked] = useState([]);
  const [left, setLeft] = useState([]);
  const [right, setRight] = useState([]);

  // Инициализация данных
  useEffect(() => {
    const availableItems = allItems.filter(item => 
      !selectedItems.some(selected => selected.id === item.id)
    );
    setLeft(availableItems);
    setRight(selectedItems);
  }, [allItems, selectedItems]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleToggleAll = (items) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(right);
    }
  };

  const customList = (title, items) => (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        sx={{ px: 2, py: 1, bgcolor: 'grey.50' }}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={
              numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{
              'aria-label': 'all items selected',
            }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} выбрано`}
      />
      <Divider />
      <List
        sx={{
          height: 400,
          bgcolor: 'background.paper',
          overflow: 'auto',
        }}
        dense
        component="div"
        role="list"
      >
        {items.length > 0 ? (
          items.map((item) => {
            const labelId = `transfer-list-item-${item.id}-label`;
            const displayName = type === 'user' 
              ? `${item.first_name} ${item.last_name}`
              : item.title;
            const secondaryText = type === 'user' 
              ? item.email 
              : item.category || 'Без категории';

            return (
              <ListItemButton
                key={item.id}
                role="listitem"
                onClick={handleToggle(item)}
                selected={checked.includes(item)}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={checked.includes(item)}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{
                      'aria-labelledby': labelId,
                    }}
                  />
                </ListItemIcon>
                <ListItemText 
                  id={labelId} 
                  primary={
                    <Typography variant="body2" noWrap>
                      {displayName}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {secondaryText}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })
        ) : (
          <ListItemButton disabled>
            <ListItemText 
              primary="Нет данных" 
              primaryTypographyProps={{ textAlign: 'center', color: 'text.secondary' }}
            />
          </ListItemButton>
        )}
      </List>
    </Card>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ alignItems: 'stretch', mb: 2, display:'flex', justifyContent:'center' }}>
        <Grid item xs={5}>
          {customList('Доступные элементы', left)}
        </Grid>
        
        <Grid item xs={2}>
          <Grid container direction="column" sx={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
          </Grid>
        </Grid>
        
        <Grid item xs={5}>
          {customList('Выбранные элементы', right)}
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">
          Отмена
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Сохранить выбор
        </Button>
      </Box>
    </Box>
  );
}