
// NotificationDialog.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const NotificationDialog = ({ open, onClose, allUsers }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSend = async () => {
        try {
            const batch = writeBatch(db);

            allUsers.forEach(user => {
                const notificationRef = doc(collection(db, 'notifications'));
                batch.set(notificationRef, {
                    userId: user.id,
                    title,
                    description: content,
                    createdAt: new Date(),
                    isUnRead: true,
                    type: 'admin_message',
                });
            });

            await batch.commit();

            onClose();
            setTitle('');
            setContent('');
            alert('전체 알림이 성공적으로 전송되었습니다.');
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('알림 전송 중 오류가 발생했습니다.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>전체 회원에게 알림 보내기</DialogTitle>
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
                    전체 발송
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NotificationDialog;