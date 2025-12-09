import { useState, useEffect } from "react";
import { Box, TextField } from "@mui/material";


const SearchField = ({
    items = [],
    onSearchChange,
    placeholder = 'Поиск...'
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [localItems, setLocalItems] = useState(items);
    
    useEffect(() => {
        setLocalItems(items);
        // Также сбрасываем поиск, если items изменились
        if (searchTerm) {
            handleSearchInternal(searchTerm, items);
        }
    }, [items]);

    const handleSearchInternal = (value, itemsToSearch) => {
        if (value.trim() === "") {
            onSearchChange(itemsToSearch);
            return;
        }

        const results = itemsToSearch.filter(item => {
            if (item.user) {
                const firstName = item.user?.first_name || '';
                const lastName = item.user?.last_name || '';
                const fullName = `${firstName} ${lastName}`.toLowerCase();
                const email = item.user?.email || '';

                return fullName.includes(value.toLowerCase()) || 
                       email.toLowerCase().includes(value.toLowerCase());
            };

            // Для других типов
            if (item.title) return item.title.toLowerCase().includes(value.toLowerCase());
            if (item.name) return item.name.toLowerCase().includes(value.toLowerCase());
            
            return false;
        });

        onSearchChange(results);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        handleSearchInternal(value, localItems);
    };
    
    return (
        <Box sx={{ p: 2 }}>
        <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ 
                    '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem',
                    }
                }}
        />
        </Box>
    );
}

export default SearchField;