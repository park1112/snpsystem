import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress, Box, Alert } from '@mui/material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useRouter } from 'next/router';

const PaymentListPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const q = query(collection(db, 'buy'), where('status', '==', 'pending'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const paymentList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPayments(paymentList);
            setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleItemClick = (id) => {
        router.push(`/dashboard/UnitPriceEntry?id=${id}`);
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
        <Container>
            <Typography variant="h4" gutterBottom>결제 목록</Typography>
            <List>
                {payments.map((payment) => (
                    <ListItem button key={payment.id} onClick={() => handleItemClick(payment.id)}>
                        <ListItemText primary={`Payment ID: ${payment.id}`} secondary={`Payment Date: ${new Date(payment.paymentDate).toLocaleString()}`} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default PaymentListPage;
