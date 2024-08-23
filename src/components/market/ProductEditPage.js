import React, { useState, useEffect } from 'react';
import {
    Container, Typography, TextField, Button, Grid, Paper, CircularProgress, Snackbar
} from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { db } from '../../utils/firebase';

const ProductEditPage = () => {
    const [productInfo, setProductInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!router.isReady) return;

            console.log('Router object:', JSON.stringify(router, null, 2));
            const { id } = router.query;
            console.log('Product ID:', id);

            if (!id) {
                console.log("Product ID is not available yet");
                return;
            }

            try {
                console.log(`Fetching product with ID: ${id}`);
                const docRef = doc(db, 'market_products', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    console.log("Product data:", docSnap.data());
                    setProductInfo(docSnap.data());
                } else {
                    console.error("No such document!");
                    setSnackbar({ open: true, message: '상품 정보를 찾을 수 없습니다.', severity: 'error' });
                }
            } catch (error) {
                console.error("Error fetching product: ", error);
                setError("상품 정보를 불러오는 중 문제가 발생했습니다.");
                setSnackbar({ open: true, message: '상품 정보를 불러오는 데 실패했습니다.', severity: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [router.isReady, router.query]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!router.query.id) {
            console.error("Product ID is missing");
            setSnackbar({ open: true, message: '상품 ID가 없습니다.', severity: 'error' });
            return;
        }

        try {
            setLoading(true);
            console.log("Submitting product data:", productInfo);
            const docRef = doc(db, 'market_products', router.query.id);
            await updateDoc(docRef, productInfo);
            setSnackbar({ open: true, message: '상품이 성공적으로 수정되었습니다.', severity: 'success' });
            router.push('/product/list');
        } catch (error) {
            console.error("Error updating product: ", error);
            setSnackbar({ open: true, message: '상품 수정 중 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!router.isReady || loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography variant="h6" color="error">{error}</Typography>;
    }

    if (!productInfo) {
        return <Typography variant="h6">상품 정보를 불러올 수 없습니다.</Typography>;
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                상품 수정 (ID: {router.query.id})
            </Typography>
            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="등록된 상품명"
                                name="registeredProductName"
                                value={productInfo.registeredProductName || ''}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="택배 상품명"
                                name="deliveryProductName"
                                value={productInfo.deliveryProductName || ''}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="상품 가격"
                                name="productPrice"
                                type="number"
                                value={productInfo.productPrice || ''}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="박스타입"
                                name="boxType"
                                value={productInfo.boxType || ''}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="마진"
                                name="margin"
                                type="number"
                                value={productInfo.margin || ''}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" size="large" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : '상품 수정'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Container>
    );
};

export default ProductEditPage;
