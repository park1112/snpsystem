import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useRouter } from 'next/router';

export default function SystemNotificationsList() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchSystemNotifications();
    }, []);

    const fetchSystemNotifications = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'systemNotifications'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const notificationsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(notificationsData);
        } catch (error) {
            console.error('Error fetching system notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = (notificationId) => {
        router.push(`/system-notifications/${notificationId}`);
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                시스템 알림
            </Typography>
            <List>
                {notifications.map((notification) => (
                    <ListItem
                        key={notification.id}
                        button
                        onClick={() => handleNotificationClick(notification.id)}
                    >
                        <ListItemAvatar>
                            <Avatar>
                                <Iconify icon="eva:alert-triangle-fill" />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={notification.title}
                            secondary={new Date(notification.createdAt.toDate()).toLocaleString()}
                        />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
}