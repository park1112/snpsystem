import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Typography, Paper, Box } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

export default function SystemNotificationDetail({ detailId }) {
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



    useEffect(() => {
        const fetchPartner = async () => {
            setLoading(true);
            try {
                const partnerDoc = await getDoc(doc(db, 'notifications', detailId));
                if (partnerDoc.exists()) {
                    setNotification(partnerDoc.data());
                } else {
                    setError('systemNotifications not found');
                }
            } catch (err) {
                setError('Failed to fetch partner');
            } finally {
                setLoading(false);
            }
        };

        if (detailId) {
            fetchPartner();
        }
    }, [detailId]);

    if (loading) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }



    return (
        <Container>
            <Paper elevation={3}>
                <Box p={3}>
                    <Typography variant="h4" gutterBottom>
                        {notification.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {notification.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        Created at: {new Date(notification.createdAt.toDate()).toLocaleString()}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}