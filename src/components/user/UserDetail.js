// pages/user-detail.js
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import {
    Container,
    Typography,
    Box,
    Paper,
    Avatar,
    Grid,
    Skeleton,
    Divider,
    Chip
} from '@mui/material';
import { Email as EmailIcon, Phone as PhoneIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';

export default function UserDetail({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    useEffect(() => {
        const fetchUser = async () => {
            console.log(userId)
            if (!userId) return;

            setLoading(true);
            try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                    setUser({ id: userDoc.id, ...userDoc.data() });
                } else {
                    setError('사용자를 찾을 수 없습니다.');
                }
            } catch (err) {
                console.error("Error fetching user:", err);
                setError('사용자 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Skeleton variant="circular" width={120} height={120} />
                        <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 2 }} />
                        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mt: 2 }} />
                    </Box>
                </Paper>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography color="error" align="center">{error}</Typography>
                </Paper>
            </Container>
        );
    }

    if (!user) return null;

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ mt: 4, p: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar
                        src={user.photoURL}
                        sx={{ width: 120, height: 120, mb: 2 }}
                    />
                    <Typography variant="h4" gutterBottom>
                        {user.name}
                    </Typography>
                    <Chip
                        label={user.role || 'User'}
                        color="primary"
                        sx={{ mb: 2 }}
                    />
                    <Divider sx={{ width: '100%', mb: 2 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon sx={{ mr: 1 }} color="action" />
                                <Typography>{user.email}</Typography>
                            </Box>
                        </Grid>
                        {user.phone && (
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PhoneIcon sx={{ mr: 1 }} color="action" />
                                    <Typography>{user.phone}</Typography>
                                </Box>
                            </Grid>
                        )}
                        {user.createdAt && (
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarIcon sx={{ mr: 1 }} color="action" />
                                    <Typography>가입일: {new Date(user.createdAt.toDate()).toLocaleDateString()}</Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
}