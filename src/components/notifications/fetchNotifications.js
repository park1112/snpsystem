import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    CircularProgress,
    Button,
} from '@mui/material';
import { query, collection, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuthState } from '../../hooks/useAuthState';
import { fToNow } from '../../utils/formatTime';

const NOTIFICATIONS_PER_PAGE = 20;

export default function AllNotificationsPage() {
    const [user] = useAuthState();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = async (startAfterDoc = null) => {
        if (!user) return;
        setLoading(true);
        try {
            let q = query(
                collection(db, 'notifications'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(NOTIFICATIONS_PER_PAGE)
            );

            if (startAfterDoc) {
                q = query(q, startAfter(startAfterDoc));
            }

            const querySnapshot = await getDocs(q);
            const newNotifications = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setNotifications(prev => [...prev, ...newNotifications]);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            setHasMore(querySnapshot.docs.length === NOTIFICATIONS_PER_PAGE);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const handleLoadMore = () => {
        if (lastVisible) {
            fetchNotifications(lastVisible);
        }
    };

    if (!user) {
        return <Typography>Please log in to view notifications.</Typography>;
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                전체 알림 메시지
            </Typography>
            <List>
                {notifications.map((notification) => (
                    <ListItem key={notification.id} alignItems="flex-start">
                        <ListItemAvatar>
                            <Avatar>{/* Add appropriate icon or image */}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={notification.title}
                            secondary={
                                <React.Fragment>
                                    <Typography component="span" variant="body2" color="text.primary">
                                        {notification.description}
                                    </Typography>
                                    {" — "}{fToNow(notification.createdAt.toDate())}
                                </React.Fragment>
                            }
                        />
                    </ListItem>
                ))}
            </List>
            {loading && <CircularProgress />}
            {hasMore && !loading && (
                <Button onClick={handleLoadMore} fullWidth variant="outlined">
                    Load More
                </Button>
            )}
        </Container>
    );
}