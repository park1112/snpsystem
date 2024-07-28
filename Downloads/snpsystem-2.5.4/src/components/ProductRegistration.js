import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Button, TextField, CircularProgress, Alert } from '@mui/material';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const PriceAndPaymentForm = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [priceData, setPriceData] = useState({});
    const [paymentInfo, setPaymentInfo] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'buy'), orderBy('createdAt', 'desc'), limit(5));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(products);
            setLoading(false);
        }, (err) => {
            setError(err.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handlePriceChange = (productId, fieldName, value) => {
        setPriceData({
            ...priceData,
            [productId]: {
                ...priceData[productId],
                [fieldName]: value
            }
        });
    };

    const handlePaymentInfoChange = (productId, e) => {
        const { name, value } = e.target;
        setPaymentInfo({
            ...paymentInfo,
            [productId]: {
                ...paymentInfo[productId],
                [name]: value
            }
        });
    };

    const handleSubmit = async (productId) => {
        setSubmitLoading(true);
        setSubmitError(null);
        try {
            const productRef = doc(db, 'buy', productId);
            await updateDoc(productRef, {
                price: priceData[productId],
                paymentInfo: paymentInfo[productId]
            });
            alert('Price and payment information updated successfully!');
        } catch (error) {
            console.error('Error updating price and payment information: ', error);
            setSubmitError('Error updating price and payment information. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

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
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Price and Payment Information</Typography>
            {products.map((product) => (
                <Box key={product.id} sx={{ mb: 4 }}>
                    <Typography variant="h6">{`Product ID: ${product.id}`}</Typography>
                    <Typography>{`Products: ${product.products.map(p => p.name).join(', ')} | Work Team: ${product.team.workTeam} | Transport Team: ${product.team.transportTeam} | Date: ${formatDate(product.createdAt)}`}</Typography>
                    {product.products.map((p, index) => (
                        <Grid container spacing={2} key={index} sx={{ mt: 2 }}>
                            <Grid item xs={6}>
                                <TextField
                                    label={`Price for ${p.name}`}
                                    type="number"
                                    fullWidth
                                    value={priceData[product.id]?.[p.name] || ''}
                                    onChange={(e) => handlePriceChange(product.id, p.name, e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label={`Quantity for ${p.name}`}
                                    type="number"
                                    fullWidth
                                    value={p.quantity}
                                    disabled
                                />
                            </Grid>
                        </Grid>
                    ))}
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={6}>
                            <TextField
                                label="Payment Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                name="paymentDate"
                                value={paymentInfo[product.id]?.paymentDate || ''}
                                onChange={(e) => handlePaymentInfoChange(product.id, e)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Payment Method"
                                fullWidth
                                name="paymentMethod"
                                value={paymentInfo[product.id]?.paymentMethod || ''}
                                onChange={(e) => handlePaymentInfoChange(product.id, e)}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSubmit(product.id)}
                        sx={{ mt: 2 }}
                        disabled={submitLoading}
                    >
                        {submitLoading ? <CircularProgress size={24} /> : 'Update Information'}
                    </Button>
                    {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
                </Box>
            ))}
        </Container>
    );
};

export default PriceAndPaymentForm;
