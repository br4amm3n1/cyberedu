import { useState, useEffect, useCallback } from "react";
import { Box, TextField } from "@mui/material";


const SearchField = ({
    items = [],
    onSearchChange,
    placeholder = 'Поиск...'
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleSearchInternal = useCallback((value, itemsToSearch) => {
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

            if (item.title) return item.title.toLowerCase().includes(value.toLowerCase());
            if (item.name) return item.name.toLowerCase().includes(value.toLowerCase());
            
            return false;
        });

        onSearchChange(results);
    }, [onSearchChange]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
    };
    
    useEffect(() => {
        if (searchTerm) {
            handleSearchInternal(searchTerm, items);
        } else {
            onSearchChange(items);
        }
    }, [searchTerm, handleSearchInternal, items, onSearchChange]);
    
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