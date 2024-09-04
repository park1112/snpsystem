// IndividualNotificationDialog.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const IndividualNotificationDialog = ({ open, onClose, user }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSend = async () => {
        try {
            const notificationData = {
                userId: user.id,
                title,
                description: content,
                createdAt: new Date(),
                isUnRead: true,
                type: 'admin_message',
            };

            await addDoc(collection(db, 'notifications'), notificationData);

            onClose();
            setTitle('');
            setContent('');
            alert(`${user.name}님에게 알림이 성공적으로 전송되었습니다.`);
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('알림 전송 중 오류가 발생했습니다.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{`${user?.name}님에게 알림 보내기`}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="제목"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="내용"
                    fullWidth
                    multiline
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
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

export default IndividualNotificationDialog;