import React, { useState } from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction, IconButton, Menu, MenuItem, TextField, Typography, Checkbox, Box, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import FormattedDate from './FormattedDate';

const GoalItem = ({ goal, onToggle, onEdit, onDelete, onSave, formatDateForInput, loading }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedGoal, setEditedGoal] = useState(goal);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        handleMenuClose();
    };

    const handleDeleteClick = () => {
        onDelete(goal.id);
        handleMenuClose();
    };

    const handleSave = () => {
        onSave(editedGoal);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedGoal(goal);
    };

    return (
        <ListItem
            dense
            sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 2,
                borderBottom: '1px solid #e0e0e0',
            }}
        >
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: isEditing ? 2 : 0 }}>
                <Checkbox
                    edge="start"
                    checked={goal.completed}
                    onChange={() => onToggle(goal.id, goal.completed)}
                    disabled={loading || isEditing}
                />
                {!isEditing && (
                    <>
                        <ListItemText
                            primary={
                                <Typography
                                    variant="h6"
                                    style={{
                                        textDecoration: goal.completed ? 'line-through' : 'none',
                                        color: goal.completed ? 'text.secondary' : 'text.primary',
                                    }}
                                >
                                    {goal.title}
                                </Typography>
                            }
                            secondary={
                                <Typography variant="caption">
                                    목표 기한: {formatDateForInput(goal.deadline)} |
                                    등록자: {goal.createdBy}
                                    <br />
                                    생성: <FormattedDate date={goal.createdAt} />
                                    {goal.completed && ` | 완료: ${<FormattedDate date={goal.completedAt} />}`}
                                </Typography>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={handleMenuOpen} disabled={loading}>
                                <MoreVertIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </>
                )}
            </Box>
            {isEditing && (
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <TextField
                        fullWidth
                        value={editedGoal.title}
                        onChange={(e) => setEditedGoal({ ...editedGoal, title: e.target.value })}
                        margin="normal"
                        variant="outlined"
                        label="목표"
                        disabled={loading}
                    />
                    <TextField
                        fullWidth
                        type="date"
                        value={editedGoal.deadline}
                        onChange={(e) => setEditedGoal({ ...editedGoal, deadline: e.target.value })}
                        margin="normal"
                        variant="outlined"
                        label="기한"
                        disabled={loading}
                        InputLabelProps={{ shrink: true }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={loading}
                            variant="contained"
                            color="primary"
                            sx={{ mr: 1 }}
                        >
                            저장
                        </Button>
                        <Button
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                            disabled={loading}
                            variant="outlined"
                        >
                            취소
                        </Button>
                    </Box>
                </Box>
            )}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditClick}>수정</MenuItem>
                <MenuItem onClick={handleDeleteClick}>삭제</MenuItem>
            </Menu>
        </ListItem>
    );
};

export default GoalItem;