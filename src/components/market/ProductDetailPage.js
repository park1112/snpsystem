import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import {
    Container, Typography, Button, CircularProgress, Paper, Box, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import dayjs from 'dayjs';

const ProductDetailPage = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [markets, setMarkets] = useState({});
    const router = useRouter();
    const { id } = router.query;

    const fetchProduct = useCallback(async () => {
        if (!id) return;
        try {
            const docRef = doc(db, 'market_products', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProduct({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.error('No such document!');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    }, [id]);

    const fetchMarkets = useCallback(async () => {
        try {
            const marketsCollection = collection(db, 'markets');
            const marketsSnapshot = await getDocs(marketsCollection);
            const marketsData = {};
            marketsSnapshot.forEach((doc) => {
                marketsData[doc.id] = doc.data().name;
            });
            setMarkets(marketsData);
        } catch (error) {
            console.error('Error fetching markets:', error);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchProduct(), fetchMarkets()]);
            setLoading(false);
        };
        fetchData();
    }, [fetchProduct, fetchMarkets]);


    const handleDelete = async () => {
        if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
            try {
                await deleteDoc(doc(db, 'market_products', id));
                alert('상품이 성공적으로 삭제되었습니다.');
                router.push('/market/products');
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleOpenDeleteDialog = () => {
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };

    const handleEdit = () => {
        router.push(`/market/edit/${id}`);
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (!product) {
        return (
            <Container maxWidth="lg">
                <Typography variant="h4">상품을 찾을 수 없습니다.</Typography>
            </Container>
        );
    }

    const createdAt = product.createdAt ? dayjs(product.createdAt.toDate()).format('YYYY-MM-DD HH:mm') : 'N/A';
    const updatedAt = product.updatedAt ? dayjs(product.updatedAt.toDate()).format('YYYY-MM-DD HH:mm') : 'N/A';

    return (
        <Container maxWidth="lg">
            <Paper sx={{ padding: 3, marginTop: 3, minWidth: '800px', minHeight: '600px' }}>
                <Typography variant="h3" gutterBottom>
                    택배 상품 상세
                </Typography>
                <Box mb={6}>
                    <Typography variant="h4" gutterBottom>
                        상품 이름: {product.registeredProductName}
                    </Typography>
                </Box>
                <Box mb={6}>
                    <Typography variant="h5" gutterBottom>
                        상품 내용
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <Typography variant="body1"><strong>이름:</strong> {product.deliveryProductName}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1"><strong>가격:</strong> {product.productPrice}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1"><strong>택배크기:</strong> {product.boxType}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1"><strong>택배변환 수량:</strong> {product.count}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1"><strong>마진:</strong> {product.margin}</Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box mb={6}>
                    <Typography variant="h5" gutterBottom>
                        데이터
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <Typography variant="body1"><strong>생성된 날짜:</strong> {createdAt}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body1"><strong>업데이트된 날짜:</strong> {updatedAt}</Typography>
                        </Grid>
                    </Grid>
                </Box>
                <Box mb={6}>
                    <Typography variant="h5" gutterBottom>
                        옵션 정보
                    </Typography>
                    {product.marketOptions && Object.entries(product.marketOptions).length > 0 ? (
                        Object.entries(product.marketOptions).map(([marketId, options]) => (
                            <Box key={marketId} mb={3}>
                                <Typography variant="h6" gutterBottom>
                                    {markets[marketId] || marketId}
                                </Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>옵션 ID</TableCell>
                                                <TableCell align="right">가격</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {options.map((option, index) => (
                                                <TableRow key={index}>
                                                    <TableCell component="th" scope="row">
                                                        {option.optionId}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {option.price}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body1">등록된 옵션 정보가 없습니다.</Typography>
                    )}
                </Box>
                <Box mt={6} display="flex" justifyContent="space-between">
                    <Button variant="contained" color="primary" onClick={handleEdit}>
                        Edit
                    </Button>
                    <Button variant="contained" color="secondary" onClick={handleOpenDeleteDialog}>
                        Delete
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => router.push('/market/list')}>
                        뒤로가기
                    </Button>
                </Box>
            </Paper>

            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Delete Product</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        정말로 {product.deliveryProductName}을 삭제 하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="secondary">
                        삭제하기
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProductDetailPage;
