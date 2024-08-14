import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Checkbox, FormControlLabel } from '@mui/material';
import { collection, addDoc, getDocs, query, limit, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const NotificationDialog = ({ open, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sendToAll, setSendToAll] = useState(false);

    const handleSend = async () => {
        try {
            const notificationData = {
                title,
                description: content,
                createdAt: new Date(),
                isRead: false,
                type: 'admin_message',
            };

            const batch = writeBatch(db);

            if (sendToAll) {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.forEach(userDoc => {
                    const notificationRef = doc(collection(db, 'notifications'));
                    batch.set(notificationRef, { ...notificationData, userId: userDoc.id });
                });
            } else {
                // 특정 사용자에게 알림 보내기 (이 부분은 사용자 선택 UI가 필요합니다)
                // 예시: 첫 번째 사용자에게 보내기
                const usersRef = collection(db, 'users');
                const q = query(usersRef, limit(1));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const firstUser = querySnapshot.docs[0];
                    const notificationRef = doc(collection(db, 'notifications'));
                    batch.set(notificationRef, { ...notificationData, userId: firstUser.id });
                }
            }

            await batch.commit();

            onClose();
            setTitle('');
            setContent('');
            setSendToAll(false);
            alert('알림이 성공적으로 전송되었습니다.');
        } catch (error) {
            console.error('Error sending notification:', error);
            alert('알림 전송 중 오류가 발생했습니다.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{sendToAll ? '전체 회원에게 알림 보내기' : '알림 보내기'}</DialogTitle>
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
                <FormControlLabel
                    control={<Checkbox checked={sendToAll} onChange={(e) => setSendToAll(e.target.checked)} />}
                    label="전체 회원에게 보내기"
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

export default NotificationDialog;