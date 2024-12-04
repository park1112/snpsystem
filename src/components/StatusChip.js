import React from 'react';
import { Chip, styled } from '@mui/material';

const StyledChip = styled(Chip)(({ theme, isActive }) => ({
    fontSize: '0.9rem',
    fontWeight: 'bold',
    padding: '4px 0',
    height: 32,
    width: 80,
    borderRadius: '16px',
    color: '#FFFFFF',
    backgroundColor: isActive ? theme.palette.primary.main : theme.palette.error.main,
    '&:hover': {
        backgroundColor: isActive ? theme.palette.primary.dark : theme.palette.error.dark,
    },
    '& .MuiChip-label': {
        padding: '0 12px',
    },
    boxShadow: isActive
        ? `0 2px 4px ${theme.palette.primary.light}`
        : `0 2px 4px ${theme.palette.error.light}`,
    transition: 'all 0.3s ease',
}));

const StatusChip = ({ status }) => {
    const isActive = status === true || status === 'true' || status === 'active';

    return (
        <StyledChip
            label={isActive ? "활성화" : "비활성화"}
            isActive={isActive}
        />
    );
};

export default StatusChip;


