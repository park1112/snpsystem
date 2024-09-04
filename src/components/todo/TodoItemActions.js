import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';

const TodoItemActions = ({ onEdit, onSave, onDelete, onCancelEdit, isEditing, disableEdit = false, loading = false }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        console.log('Menu opened');
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        console.log('Menu closed');
        setAnchorEl(null);
    };

    const handleEdit = () => {
        console.log('Edit option selected');
        onEdit();
        handleMenuClose();
    };

    const handleSave = () => {
        console.log('Save option selected');
        onSave();
        handleMenuClose();
    };

    const handleDelete = () => {
        console.log('Delete option selected');
        onDelete();
        handleMenuClose();
    };

    const handleCancelEdit = () => {
        console.log('Cancel edit option selected');
        onCancelEdit();
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
                {isEditing ? (
                    <>
                        <MenuItem onClick={handleSave}>
                            <SaveIcon fontSize="small" style={{ marginRight: 8 }} />
                            저장
                        </MenuItem>
                        <MenuItem onClick={handleCancelEdit}>
                            <CancelIcon fontSize="small" style={{ marginRight: 8 }} />
                            편집 취소
                        </MenuItem>
                    </>
                ) : (
                    <MenuItem onClick={handleEdit} disabled={disableEdit}>
                        <EditIcon fontSize="small" style={{ marginRight: 8 }} />
                        수정
                    </MenuItem>
                )}
                <MenuItem onClick={handleDelete}>
                    <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
                    삭제
                </MenuItem>
            </Menu>
        </>
    );
};

export default TodoItemActions;