import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

const SystemNotificationDialog = ({ open, onClose, onSend }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const handleSend = () => {
        onSend(title, message);
        setTitle('');
        setMessage('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>전체 사용자에게 알림 보내기</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="알림 제목"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="알림 내용"
                    fullWidth
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button onClick={handleSend} color="primary">
                    보내기
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SystemNotificationDialog;