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
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        onEdit();
        // 에디트 모드로 전환 후 메뉴 닫기
        handleMenuClose();
    };

    const handleSave = () => {
        onSave();
        handleMenuClose();
    };

    const handleDelete = () => {
        onDelete();
        handleMenuClose();
    };

    const handleCancelEdit = () => {
        onCancelEdit();
        handleMenuClose();
    };

    if (isEditing) {
        return (
            <>
                <IconButton onClick={onCancelEdit} disabled={loading}>
                    <CancelIcon />
                </IconButton>
            </>
        );
    }

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
                <MenuItem onClick={() => { onEdit(); handleMenuClose(); }} disabled={disableEdit}>
                    <EditIcon fontSize="small" style={{ marginRight: 8 }} />
                    수정
                </MenuItem>
                <MenuItem onClick={() => { onDelete(); handleMenuClose(); }}>
                    <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
                    삭제
                </MenuItem>
            </Menu>
        </>
    );
};
export default TodoItemActions;