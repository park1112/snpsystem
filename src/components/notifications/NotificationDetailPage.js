// NotificationDetailPage.js
import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Divider,
    Box,
    Chip,
    CircularProgress,
    Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { fToNow } from '../../utils/formatTime';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
}));

export default function NotificationDetailPage() {
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchNotification = async () => {
            if (id) {
                try {
                    const docRef = doc(db, 'notifications', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setNotification({ id: docSnap.id, ...docSnap.data() });
                    } else {
                        console.log('No such notification!');
                    }
                } catch (error) {
                    console.error('Error fetching notification:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchNotification();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!notification) {
        return <Typography>게시글이 없습니다.</Typography>;
    }

    return (
        <Container maxWidth="md">
            <StyledPaper>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                    sx={{ mb: 2 }}
                >
                    뒤로가기
                </Button>
                <Typography variant="h4" gutterBottom>
                    {notification.title}
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="caption" color="text.secondary" mr={1}>
                        {fToNow(notification.createdAt.toDate())}
                    </Typography>
                    {notification.isUnRead && <Chip label="New" color="primary" size="small" />}
                </Box>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="body1" paragraph>
                    {notification.description}
                </Typography>
                {notification.type && (
                    <Chip
                        label={`메시지 종류: ${notification.type}`}
                        variant="outlined"
                        sx={{ mt: 2 }}
                    />
                )}
            </StyledPaper>
        </Container>
    );
}