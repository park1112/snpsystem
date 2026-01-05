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
    Avatar,
    Checkbox,
    TextField
} from '@mui/material';

export default function NewChatDialog({ open, onClose, onCreateChat, allUsers }) {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [isGroupChat, setIsGroupChat] = useState(false);

    const handleToggleUser = (user) => {
        setSelectedUsers(prevSelected =>
            prevSelected.some(u => u.id === user.id)
                ? prevSelected.filter(u => u.id !== user.id)
                : [...prevSelected, user]
        );
    };

    const handleCreateChat = () => {
        if (isGroupChat && (!groupName.trim() || selectedUsers.length < 2)) return;
        if (!isGroupChat && selectedUsers.length !== 1) return;

        onCreateChat({
            isGroupChat,
            name: isGroupChat ? groupName : selectedUsers[0].name,
            participants: selectedUsers.map(user => user.id)
        });
        resetForm();
    };

    const resetForm = () => {
        setSelectedUsers([]);
        setGroupName('');
        setIsGroupChat(false);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isGroupChat ? "그룹 채팅 만들기" : "채팅을 시작할 유저를 선택해주세요"}
            </DialogTitle>
            <DialogContent>
                <Button
                    onClick={() => setIsGroupChat(!isGroupChat)}
                    color="primary"
                    variant="outlined"
                    fullWidth
                    style={{ marginBottom: '1rem' }}
                >
                    {isGroupChat ? "개인 채팅으로 전환" : "그룹 채팅으로 전환"}
                </Button>
                {isGroupChat && (
                    <TextField
                        fullWidth
                        label="그룹 이름"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        margin="normal"
                    />
                )}
                <List>
                    {allUsers.map((user) => (
                        <ListItem
                            button
                            key={user.id}
                            onClick={() => handleToggleUser(user)}
                        >
                            <Checkbox
                                checked={selectedUsers.some(u => u.id === user.id)}
                                disabled={!isGroupChat && selectedUsers.length === 1 && !selectedUsers.some(u => u.id === user.id)}
                            />
                            <ListItemAvatar>
                                <Avatar alt={user.name} src={user.photoURL} />
                            </ListItemAvatar>
                            <ListItemText primary={user.name} secondary={user.email} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { onClose(); resetForm(); }}>취소</Button>
                <Button
                    onClick={handleCreateChat}
                    color="primary"
                    disabled={(isGroupChat && (!groupName.trim() || selectedUsers.length < 2)) || (!isGroupChat && selectedUsers.length !== 1)}
                >
                    채팅 시작
                </Button>
            </DialogActions>
        </Dialog>
    );
}