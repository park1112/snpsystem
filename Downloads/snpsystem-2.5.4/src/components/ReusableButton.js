import { Button, Typography, Box } from '@mui/material';
import { useState } from 'react';

const ReusableButton = ({ label, options = [], onSelect }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleClick = (option) => {
        setSelectedOption(option);
        onSelect(option);
    };

    return (
        <Box mb={2} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, overflowX: 'auto' }}>
            {options.length > 0 ? (
                options.map((option, index) => (
                    <Button
                        key={index}
                        variant={selectedOption === option ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => handleClick(option)}
                    >
                        {option}
                    </Button>
                ))
            ) : (
                <Typography variant="body1">No options available</Typography>
            )}
        </Box>
    );
};

export default ReusableButton;
