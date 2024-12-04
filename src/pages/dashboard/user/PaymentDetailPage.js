import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Grid, Typography, Box, Button, TextField, CircularProgress, Alert } from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';

const PaymentDetailPage = () => {
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (!id) return;

        const fetchPayment = async () => {
            try {
                const docRef = doc(db, 'payments', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPayment({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('No such document!');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [id]);

    const handleChange = (e) => {
        setPayment({
            ...payment,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdate = async () => {
        setUpdateLoading(true);
        setUpdateError(null);
        try {
            const paymentRef = doc(db, 'payments', payment.id);
            await updateDoc(paymentRef, {
                ...payment,
            });
            alert('Payment details updated successfully!');
            router.push('/dashboard/PaymentListPage');
        } catch (err) {
            setUpdateError(err.message);
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        setUpdateLoading(true);
        setUpdateError(null);
        try {
            const paymentRef = doc(db, 'payments', payment.id);
            await updateDoc(paymentRef, {
                ...payment,
                status: 'confirmed',
            });
            alert('Payment confirmed successfully!');
            router.push('/dashboard/PaymentListPage');
        } catch (err) {
            setUpdateError(err.message);
        } finally {
            setUpdateLoading(false);
        }
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
            <Typography variant="h4" gutterBottom>결제 상세 정보</Typography>
            {payment ? (
                <>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Payment Date"
                                name="paymentDate"
                                type="date"
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={payment.paymentDate || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Payment Method"
                                name="paymentMethod"
                                fullWidth
                                value={payment.paymentMethod || ''}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                    {payment.products.map((product, index) => (
                        <Grid container spacing={2} key={index} sx={{ mt: 2 }}>
                            <Grid item xs={6}>
                                <TextField
                                    label={`Price for ${product.name}`}
                                    name={`price_${index}`}
                                    type="number"
                                    fullWidth
                                    value={payment[`price_${index}`] || ''}
                                    onChange={(e) => handleChange(e, index)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label={`Quantity for ${product.name}`}
                                    name={`quantity_${index}`}
                                    type="number"
                                    fullWidth
                                    value={payment[`quantity_${index}`] || ''}
                                    onChange={(e) => handleChange(e, index)}
                                />
                            </Grid>
                        </Grid>
                    ))}
                    {updateError && <Alert severity="error" sx={{ mt: 2 }}>{updateError}</Alert>}
                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdate}
                            disabled={updateLoading}
                            sx={{ mr: 2 }}
                        >
                            {updateLoading ? <CircularProgress size={24} /> : 'Update'}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleConfirmPayment}
                            disabled={updateLoading}
                        >
                            {updateLoading ? <CircularProgress size={24} /> : 'Confirm Payment'}
                        </Button>
                    </Box>
                </>
            ) : (
                <Typography variant="h6">No payment data found.</Typography>
            )}
        </Container>
    );
};

export default PaymentDetailPage;
