import { Button, Typography, Box } from '@mui/material';
import { useState } from 'react';

const ReusableButton = ({ label, options = [], onSelect }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleClick = (option) => {
        setSelectedOption(option);
        onSelect(option);
    };

    return (
        <Box mb={2} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {options.length > 0 ? (
                options.map((option, index) => (
                    <Button
                        key={index}
                        variant={selectedOption === option ? 'contained' : 'outlined'} // 선택된 상태에 따라 variant 변경
                        color="primary"
                        onClick={() => handleClick(option)}
                        sx={{ flexGrow: 1, minWidth: '120px', py: 1.5 }}
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
