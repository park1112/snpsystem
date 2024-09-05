
// components/chat/NewChatDialog.js
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar
} from '@mui/material';

export default function NewChatDialog({ open, onClose, onSelectUser, allUsers }) {
    const [selectedUser, setSelectedUser] = useState(null);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
    };

    const handleStartChat = () => {
        if (selectedUser) {
            onSelectUser(selectedUser);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>채팅을 시작할 유저를 선택해주세요.</DialogTitle>
            <DialogContent>
                <List>
                    {allUsers.map((user) => (
                        <ListItem
                            button
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                            selected={selectedUser && selectedUser.id === user.id}
                        >
                            <ListItemAvatar>
                                <Avatar alt={user.name} src={user.photoURL} />
                            </ListItemAvatar>
                            <ListItemText primary={user.name} secondary={user.email} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button onClick={handleStartChat} color="primary" disabled={!selectedUser}>
                    채팅 시작
                </Button>
            </DialogActions>
        </Dialog>
    );
}