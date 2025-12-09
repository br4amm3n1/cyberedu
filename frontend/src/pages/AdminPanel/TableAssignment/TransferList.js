import { useState, useEffect, useMemo } from 'react';
import { Grid, Button, Box, Container } from '@mui/material';
import TransferCard from './TransferCard';
import SearchField from './SearchField';
import { styles } from './TransferList.styles';

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
  type = "profile",
  branchChoices = [],
}) {
  const [checked, setChecked] = useState([]);
  const [left, setLeft] = useState([]);
  const [checkedBranches, setCheckedBranches] = useState([]);
  const [allSelected, setAllSelected] = useState(selectedItems);
  const [filteredLeft, setFilteredLeft] = useState([]);
  const [filteredRight, setFilteredRight] = useState([]);

  const hasBranchChoices = branchChoices && branchChoices.length > 0;

  // Получаем размеры для текущего типа
  const cardSizes = styles.cardSizes[type] || styles.cardSizes.profile;

  // Локальная фильтрация профилей по branch
  const filteredItems = useMemo(() => {
    if (type === 'profile' && hasBranchChoices && checkedBranches.length > 0) {
      return allItems.filter(item => {
        const itemBranch = item.branch;
        return checkedBranches.some(branch => {
          return branch[0] === itemBranch || branch[1] === itemBranch;
        });
      });
    }
    return allItems;
  }, [allItems, checkedBranches, type, hasBranchChoices]);

  // Инициализация состояний
  useEffect(() => {
    const availableItems = filteredItems.filter(item => 
      !allSelected.some(selected => selected.id === item.id)
    );
    setLeft(availableItems);
    setFilteredLeft(availableItems);
  }, [filteredItems, allSelected]);

  useEffect(() => {
    setFilteredRight([...allSelected]);
  }, [allSelected]);

  useEffect(() => {
    setAllSelected(selectedItems);
  }, [selectedItems]);

  const handleLeftSearchChange = (filteredItems) => {
    setFilteredLeft(filteredItems);
  };

  const handleRightSearchChange = (filteredItems) => {
    setFilteredRight(filteredItems);
  };

  const getSearchPlaceholder = () => {
    switch (type) {
      case 'profile':
        return "Поиск по имени или email...";
      case 'course':
        return "Поиск по названию курса...";
      case 'branch':
        return "Поиск по институтам...";
      default:
        return "Поиск...";
    }
  };

  const createToggleHandler = (checkedState, setCheckedState) => (value) => () => {
    const currentIndex = checkedState.indexOf(value);
    const newChecked = [...checkedState];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setCheckedState(newChecked);
  };

  const createToggleAllHandler = (checkedState, setCheckedState) => (items) => () => {
    const currentChecked = intersection(checkedState, items);
    if (currentChecked.length === items.length) {
      setCheckedState(not(checkedState, items));
    } else {
      setCheckedState(union(checkedState, items));
    }
  };

  const getDisplayName = (item, type) => {
    switch (type) {
      case 'profile':
        const user = item.user || {};
        return `${user.first_name || ''} ${user.last_name || ''}`.trim();
      case 'course':
        return item.title || 'Без названия';
      case 'branch':
        return item[1] || item[0] || 'Без названия';
      default:
        return item.title || item.name || 'Без названия';
    }
  };

  const getSecondaryText = (item, type) => {
    switch (type) {
      case 'profile':
        const user = item.user || {};
        const email = user.email || 'Нет email';
        const branch = item.branch || 'Без branch';
        return `${email} • ${branch}`;
      case 'course':
        return item.category || 'Без категории';
      case 'branch':
        return null;
      default:
        return item.description || null;
    }
  };

  const handleToggle = createToggleHandler(checked, setChecked);
  const handleToggleAll = createToggleAllHandler(checked, setChecked);
  const handleToggleBranches = createToggleHandler(checkedBranches, setCheckedBranches);
  const handleToggleAllBranches = createToggleAllHandler(checkedBranches, setCheckedBranches);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, allSelected.filter(item => 
    filteredItems.some(filtered => filtered.id === item.id)
  ));

  const handleCheckedRight = () => {
    const newSelected = [...allSelected, ...leftChecked];
    setAllSelected(newSelected);
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    const newSelected = allSelected.filter(item => 
      !rightChecked.some(checkedItem => checkedItem.id === item.id)
    );
    setAllSelected(newSelected);
    setChecked(not(checked, rightChecked));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(allSelected);
    }
  };

  return (
    <Container maxWidth="xl" sx={styles.container}>
      <Grid container spacing={2} sx={styles.gridContainer}>
        {hasBranchChoices && type === 'profile' && (
          <Grid item xs={12} md={5} lg={4} sx={styles.cardContainer}>
            <TransferCard
              title="Фильтр по институтам"
              items={branchChoices}
              checked={checkedBranches}
              onToggle={handleToggleBranches}
              onToggleAll={handleToggleAllBranches}
              getDisplayName={getDisplayName}
              getSecondaryText={getSecondaryText}
              type="branch"
              cardHeight={styles.cardSizes.branch.height}
              minHeight={styles.cardSizes.branch.minHeight}
              maxHeight={styles.cardSizes.branch.maxHeight}
            />
          </Grid>
        )}
        
        <Grid item xs={12} md={5} lg={4} sx={styles.cardContainer}>
          <TransferCard
            title={type === 'profile' ? "Доступные пользователи" : "Доступные элементы"}
            items={filteredLeft}
            checked={checked}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            getDisplayName={getDisplayName}
            getSecondaryText={getSecondaryText}
            SearchField={
              <SearchField
                items={left}
                onSearchChange={handleLeftSearchChange}
                placeholder={getSearchPlaceholder()}
              />
            }
            type={type}
            cardHeight={cardSizes.height}
            minHeight={cardSizes.minHeight}
            maxHeight={cardSizes.maxHeight}
          />
        </Grid>
        
        <Grid item xs={12} md={2} lg={1} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={styles.buttonColumn}>
            <Button
              sx={styles.actionButtons}
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={styles.actionButtons}
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={5} lg={4} sx={styles.cardContainer}>
          <TransferCard
            title={type === 'profile' ? "Выбранные пользователи" : "Выбранные элементы"}
            items={filteredRight}
            checked={checked}
            onToggle={handleToggle}
            onToggleAll={handleToggleAll}
            getDisplayName={getDisplayName}
            getSecondaryText={getSecondaryText}
            type={type}
            SearchField={
              <SearchField
                items={allSelected}
                onSearchChange={handleRightSearchChange}
                placeholder={getSearchPlaceholder()}
              />
            }
            cardHeight={cardSizes.height}
            minHeight={cardSizes.minHeight}
            maxHeight={cardSizes.maxHeight}
          />
        </Grid>
      </Grid>

      <Box sx={styles.footer}>
        <Button onClick={onClose} variant="outlined" size="medium">
          Отмена
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" size="medium">
          Сохранить выбор
        </Button>
      </Box>
    </Container>
  );
}