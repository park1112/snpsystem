import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { List, ListItem, ListItemText, Typography, CircularProgress, Box, Alert } from '@mui/material';

const BuyList = () => {
    const [buys, setBuys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'buy'), orderBy('createdAt', 'desc'), limit(5));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const buys = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setBuys(buys);
            setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (date) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(date).toLocaleDateString('ko-KR', options);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <List>
            <Typography variant="h6">Recently Added Buys</Typography>
            {buys.map((buy) => (
                <ListItem key={buy.id}>
                    <ListItemText
                        primary={`ID: ${buy.id}`}
                        secondary={`Products: ${buy.products.map(p => p.name).join(', ')} | Work Team: ${buy.team.workTeam} | Transport Team: ${buy.team.transportTeam} | Date: ${formatDate(buy.createdAt)}`}
                    />
                </ListItem>
            ))}
        </List>
    );
};

export default BuyList;
