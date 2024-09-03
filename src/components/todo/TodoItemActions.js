import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const TodoItemActions = ({ onEdit, onDelete, disableEdit = false, loading = false }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        onEdit();
        handleMenuClose();
    };

    const handleDelete = () => {
        onDelete();
        handleMenuClose();
    };

    return (
        <>
            <IconButton edge="end" onClick={handleMenuOpen} disabled={loading}>
                <MoreVertIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit} disabled={disableEdit}>
                    <EditIcon fontSize="small" style={{ marginRight: 8 }} />
                    수정
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
                    삭제
                </MenuItem>
            </Menu>
        </>
    );
};

export default TodoItemActions;