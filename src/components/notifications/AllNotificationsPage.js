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
    Paper,
    Divider,
    Box,
    Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Notifications as NotificationsIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { query, collection, where, orderBy, limit, startAfter, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useAuthState } from '../../hooks/useAuthState';
import { fToNow } from '../../utils/formatTime';
import { useRouter } from 'next/router';


const NOTIFICATIONS_PER_PAGE = 20;

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({

}));

export default function AllNotificationsPage() {
    const [user] = useAuthState();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const router = useRouter();

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
    const handleNotificationClick = async (notificationId) => {
        try {
            // 해당 알림의 isUnRead 상태를 false로 업데이트
            const notificationRef = doc(db, 'notifications', notificationId);
            await updateDoc(notificationRef, { isUnRead: false });

            // 디테일 페이지로 이동
            router.push(`/notifications/${notificationId}`);
        } catch (error) {
            console.error("Error updating notification:", error);
        }
    };

    if (!user) {
        return <Typography>Please log in to view notifications.</Typography>;
    }

    return (
        <Container maxWidth="md">
            <StyledPaper>
                <Typography variant="h4" gutterBottom>
                    알림 메시지
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <List>
                    {notifications.map((notification) => (
                        <StyledListItem
                            key={notification.id}
                            alignItems="flex-start"
                            onClick={() => handleNotificationClick(notification.id)}
                            button
                        >
                            <ListItemAvatar>
                                <StyledAvatar>
                                    <NotificationsIcon />
                                </StyledAvatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography variant="subtitle1" component="div">
                                        {notification.title}
                                        {notification.isUnRead &&
                                            <Chip
                                                label="New"
                                                color="primary"
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        }
                                    </Typography>
                                }
                                secondary={
                                    <React.Fragment>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            {notification.description}
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            {fToNow(notification.createdAt.toDate())}
                                        </Typography>
                                    </React.Fragment>
                                }
                            />
                            <ChevronRightIcon color="action" />
                        </StyledListItem>
                    ))}
                </List>
                {loading && (
                    <Box display="flex" justifyContent="center" my={2}>
                        <CircularProgress />
                    </Box>
                )}
                {hasMore && !loading && (
                    <Button
                        onClick={handleLoadMore}
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                    >
                        더 보기
                    </Button>
                )}
            </StyledPaper>
        </Container>
    );
}