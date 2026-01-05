import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import {
    Box, Typography, Button, CircularProgress, Paper, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Divider, IconButton
} from '@mui/material';
import { Edit, Delete, ArrowBack, CalendarToday, Update, LocalShipping, Inventory, AttachMoney } from '@mui/icons-material';
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
        try {
            await deleteDoc(doc(db, 'market_products', id));
            router.push('/market/list');
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleEdit = () => {
        router.push(`/market/edit/${id}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px"
                sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', borderRadius: 3 }}>
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    if (!product) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="#9ca3af">상품을 찾을 수 없습니다.</Typography>
                <Button onClick={() => router.push('/market/list')} sx={{ mt: 2 }}>목록으로</Button>
            </Box>
        );
    }

    const createdAt = product.createdAt ? dayjs(product.createdAt.toDate()).format('YYYY-MM-DD HH:mm') : 'N/A';
    const updatedAt = product.updatedAt ? dayjs(product.updatedAt.toDate()).format('YYYY-MM-DD HH:mm') : 'N/A';

    const InfoCard = ({ icon, label, value, color = '#667eea' }) => (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%', transition: 'all 0.2s', '&:hover': { borderColor: color, boxShadow: `0 4px 12px ${color}15` } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: 2, backgroundColor: `${color}10`, color: color }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>{label}</Typography>
                    <Typography variant="h6" sx={{ color: '#374151', fontWeight: 600 }}>{value || '-'}</Typography>
                </Box>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Button startIcon={<ArrowBack />} onClick={() => router.push('/market/list')}
                        sx={{ mb: 2, color: '#667eea', '&:hover': { backgroundColor: 'rgba(102,126,234,0.04)' } }}>
                        목록으로
                    </Button>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#374151', mb: 1 }}>
                        {product.registeredProductName}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip size="small" icon={<CalendarToday sx={{ fontSize: 14 }} />} label={`등록: ${createdAt}`}
                            sx={{ backgroundColor: '#f0fdf4', color: '#16a34a', '& .MuiChip-icon': { color: '#16a34a' } }} />
                        <Chip size="small" icon={<Update sx={{ fontSize: 14 }} />} label={`수정: ${updatedAt}`}
                            sx={{ backgroundColor: '#fef3c7', color: '#d97706', '& .MuiChip-icon': { color: '#d97706' } }} />
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}
                        sx={{ borderColor: '#667eea', color: '#667eea', borderRadius: 2, '&:hover': { borderColor: '#5a6fd6', backgroundColor: 'rgba(102,126,234,0.04)' } }}>
                        수정
                    </Button>
                    <Button variant="outlined" startIcon={<Delete />} onClick={() => setOpenDeleteDialog(true)}
                        sx={{ borderColor: '#ef4444', color: '#ef4444', borderRadius: 2, '&:hover': { borderColor: '#dc2626', backgroundColor: 'rgba(239,68,68,0.04)' } }}>
                        삭제
                    </Button>
                </Box>
            </Box>

            {/* Product Info Cards */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Inventory sx={{ color: '#667eea' }} /> 상품 정보
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <InfoCard icon={<LocalShipping />} label="택배 상품명" value={product.deliveryProductName} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <InfoCard icon={<AttachMoney />} label="상품 가격" value={product.productPrice?.toLocaleString()} color="#10b981" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <InfoCard icon={<Inventory />} label="박스 타입" value={product.boxType} color="#f59e0b" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <InfoCard icon={<Inventory />} label="택배변환 수량" value={product.count} color="#8b5cf6" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <InfoCard icon={<AttachMoney />} label="마진" value={product.margin?.toLocaleString()} color="#ec4899" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <InfoCard icon={<AttachMoney />} label="가격" value={product.price?.toLocaleString()} color="#06b6d4" />
                </Grid>
            </Grid>

            {/* Market Options */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Inventory sx={{ color: '#667eea' }} /> 마켓별 옵션 정보
            </Typography>

            {product.marketOptions && Object.entries(product.marketOptions).length > 0 ? (
                <Grid container spacing={2}>
                    {Object.entries(product.marketOptions).map(([marketId, options]) => (
                        options && options.length > 0 && (
                            <Grid item xs={12} md={6} key={marketId}>
                                <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                    <Box sx={{ px: 2, py: 1.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                                            {markets[marketId] || marketId}
                                        </Typography>
                                    </Box>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>옵션 ID</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>가격</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {options.map((option, index) => (
                                                    <TableRow key={index} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                                        <TableCell sx={{ color: '#667eea', fontFamily: 'monospace' }}>
                                                            {option.optionId}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: '#374151' }}>
                                                            {option.price?.toLocaleString() || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>
                        )
                    ))}
                </Grid>
            ) : (
                <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#9ca3af' }}>등록된 옵션 정보가 없습니다.</Typography>
                </Paper>
            )}

            {/* Delete Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 600 }}>상품 삭제</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <strong>{product.registeredProductName}</strong>을(를) 정말 삭제하시겠습니까?
                        <br />이 작업은 되돌릴 수 없습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: '#6b7280' }}>취소</Button>
                    <Button onClick={handleDelete} variant="contained"
                        sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}>
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductDetailPage;
