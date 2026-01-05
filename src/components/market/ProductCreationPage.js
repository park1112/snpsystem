import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Paper,
    MenuItem, Snackbar, CircularProgress, FormHelperText, IconButton,
    Alert, Chip, Divider, InputAdornment
} from '@mui/material';
import { Add, Delete, ArrowBack, Save, Inventory, AttachMoney, LocalShipping, Store } from '@mui/icons-material';
import { collection, addDoc, getDocs, updateDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useRouter } from 'next/router';

const BOX_TYPES = {
    '극소': { price: 0, boxPrice: 528, DeliveryPrice: 2500 },
    '소': { price: 0, boxPrice: 900, DeliveryPrice: 3000 },
    '중': { price: 0, boxPrice: 1300, DeliveryPrice: 3500 },
    '대': { price: 0, boxPrice: 1300, DeliveryPrice: 5000 }
};

const ProductCreationPage = () => {
    const [productInfo, setProductInfo] = useState({
        registeredProductName: '',
        deliveryProductName: '',
        boxType: '극소',
        price: 0,
        count: 1,
        productPrice: '',
        selectedMarket: '',
    });
    const [openMarkets, setOpenMarkets] = useState({});
    const [markets, setMarkets] = useState([]);
    const [marketOptions, setMarketOptions] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [loading, setLoading] = useState(true);
    const [margin, setMargin] = useState(2000);
    const [errors, setErrors] = useState({});

    const router = useRouter();
    const { id } = router.query;
    const isEditMode = !!id;

    const fetchOpenMarkets = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'open_market'));
            const openMarketsData = {};
            querySnapshot.docs.forEach(doc => {
                openMarketsData[doc.id] = { name: doc.data().name, tex: doc.data().tex };
            });
            setOpenMarkets(openMarketsData);
        } catch (error) {
            console.error("Error fetching open markets:", error);
            setSnackbar({ open: true, message: '오픈마켓 정보를 불러오는 데 실패했습니다.', severity: 'error' });
        }
    }, []);

    const fetchMarkets = useCallback(async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'markets'));
            const marketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            marketsData.sort((a, b) => a.code - b.code);
            setMarkets(marketsData);
        } catch (error) {
            console.error("Error fetching markets:", error);
            setSnackbar({ open: true, message: '마켓 정보를 불러오는 데 실패했습니다.', severity: 'error' });
        }
    }, []);

    const fetchProductData = useCallback(async (productId) => {
        try {
            const docRef = doc(db, 'market_products', productId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProductInfo({
                    registeredProductName: data.registeredProductName || '',
                    deliveryProductName: data.deliveryProductName || '',
                    boxType: data.boxType || '극소',
                    price: data.price || 0,
                    productPrice: data.productPrice || '',
                    count: data.count !== undefined ? data.count : 1,
                    selectedMarket: data.selectedMarket || '',
                });
                setMargin(data.margin || 2000);
                setMarketOptions(data.marketOptions || {});
            } else {
                setSnackbar({ open: true, message: '상품 정보를 찾을 수 없습니다.', severity: 'error' });
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
            setSnackbar({ open: true, message: '상품 정보를 불러오는 데 실패했습니다.', severity: 'error' });
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await fetchOpenMarkets();
                await fetchMarkets();
                if (isEditMode && id) {
                    await fetchProductData(id);
                } else {
                    setInitialMarketOptions();
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setSnackbar({ open: true, message: '데이터를 불러오는 데 실패했습니다.', severity: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode, fetchOpenMarkets, fetchMarkets, fetchProductData]);

    useEffect(() => {
        if (productInfo.boxType) {
            setProductInfo(prev => ({
                ...prev,
                price: BOX_TYPES[prev.boxType].price
            }));
        }
    }, [productInfo.boxType]);

    useEffect(() => {
        if (productInfo.selectedMarket && productInfo.productPrice) {
            updateAllMarketPrices();
        }
    }, [productInfo.selectedMarket, productInfo.productPrice, productInfo.boxType, margin]);

    const handleMarketOptionChange = (marketId, index, field, value) => {
        setMarketOptions(prev => {
            const updatedOptions = [...(prev[marketId] || [])];
            updatedOptions[index] = { ...updatedOptions[index], [field]: value };
            return { ...prev, [marketId]: updatedOptions };
        });
    };

    const removeOptionId = (marketId, index) => {
        setMarketOptions(prev => {
            const currentOptions = prev[marketId];
            if (!currentOptions || !Array.isArray(currentOptions)) return prev;
            const updatedOptions = currentOptions.filter((_, i) => i !== index);
            return { ...prev, [marketId]: updatedOptions };
        });
    };

    const setInitialMarketOptions = () => {
        const initialOptions = {};
        markets.forEach(market => {
            initialOptions[market.id] = isEditMode ? [] : [{ optionId: '', price: '' }];
        });
        setMarketOptions(initialOptions);
    };

    const addOptionId = (marketId) => {
        setMarketOptions(prev => ({
            ...prev,
            [marketId]: [...(prev[marketId] || []), { optionId: '', price: '' }]
        }));
    };

    const handleProductInfoChange = (e) => {
        const { name, value } = e.target;
        setProductInfo(prev => ({ ...prev, [name]: value }));
    };

    const calculateMarketPrice = () => {
        const productPrice = Number(productInfo.productPrice);
        const deliveryPrice = BOX_TYPES[productInfo.boxType].DeliveryPrice;
        const boxPrice = BOX_TYPES[productInfo.boxType].boxPrice;
        const totalCost = productPrice + deliveryPrice + boxPrice;
        const fee = Number(openMarkets[productInfo.selectedMarket]?.tex) / 100;
        return Math.ceil((totalCost + margin) / (1 - fee));
    };

    const updateAllMarketPrices = () => {
        const calculatedPrice = calculateMarketPrice();
        setMarketOptions(prev => {
            const updatedOptions = { ...prev };
            Object.keys(updatedOptions).forEach(marketId => {
                updatedOptions[marketId] = updatedOptions[marketId].map(option => ({
                    ...option,
                    price: calculatedPrice
                }));
            });
            return updatedOptions;
        });
    };

    const validateInputs = () => {
        const newErrors = {};
        if (!productInfo.selectedMarket) newErrors.selectedMarket = '오픈마켓을 선택하세요';
        if (!productInfo.registeredProductName) newErrors.registeredProductName = '등록된 상품명을 입력하세요';
        if (!productInfo.deliveryProductName) newErrors.deliveryProductName = '택배 상품명을 입력하세요';
        if (!productInfo.productPrice) newErrors.productPrice = '상품 가격을 입력하세요';
        if (!margin) newErrors.margin = '마진을 입력하세요';

        const hasValidOption = Object.values(marketOptions).some(options =>
            options.some(opt => opt.optionId && String(opt.optionId).trim() !== '')
        );
        if (!hasValidOption) {
            newErrors.optionId = '최소 하나의 마켓에 유효한 옵션 ID를 입력하세요';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInputs()) return;

        setLoading(true);
        try {
            let productData = {
                ...productInfo,
                margin,
                marketOptions: Object.fromEntries(
                    Object.entries(marketOptions).map(([marketId, options]) => [
                        marketId,
                        options.filter(opt => opt.optionId && String(opt.optionId).trim() !== '')
                            .map(opt => ({ optionId: String(opt.optionId).trim(), price: opt.price || '' }))
                    ]).filter(([_, options]) => options.length > 0)
                ),
            };

            if (isEditMode) {
                productData.updatedAt = new Date();
                await updateDoc(doc(db, 'market_products', id), productData);
                setSnackbar({ open: true, message: '상품이 성공적으로 수정되었습니다.', severity: 'success' });
            } else {
                productData.createdAt = new Date();
                const docRef = await addDoc(collection(db, 'market_products'), productData);
                await updateDoc(docRef, { UID: docRef.id });
                setSnackbar({ open: true, message: '상품이 성공적으로 생성되었습니다.', severity: 'success' });
            }
            router.push('/market/list');
        } catch (error) {
            console.error("Error saving product:", error);
            setSnackbar({ open: true, message: '상품 저장 중 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#fafafa',
            '&:hover': { backgroundColor: '#f5f5f5' },
            '&.Mui-focused': { backgroundColor: 'white' },
            '&.Mui-focused fieldset': { borderColor: '#667eea' }
        },
        '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px"
                sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', borderRadius: 3 }}>
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Button startIcon={<ArrowBack />} onClick={() => router.push('/market/list')}
                    sx={{ mb: 2, color: '#667eea', '&:hover': { backgroundColor: 'rgba(102,126,234,0.04)' } }}>
                    목록으로
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#374151' }}>
                    {isEditMode ? '상품 수정' : '새 상품 등록'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af', mt: 0.5 }}>
                    {isEditMode ? '상품 정보를 수정합니다.' : '새로운 상품을 등록합니다.'}
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                {/* 기본 정보 섹션 */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Inventory sx={{ color: '#667eea' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>기본 정보</Typography>
                    </Box>

                    <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                            <TextField fullWidth select label="오픈마켓 선택" name="selectedMarket"
                                value={productInfo.selectedMarket} onChange={handleProductInfoChange}
                                error={!!errors.selectedMarket} sx={inputStyle}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Store sx={{ color: '#9ca3af' }} /></InputAdornment> }}>
                                {Object.entries(openMarkets).map(([id, market]) => (
                                    <MenuItem key={id} value={id}>{market.name}</MenuItem>
                                ))}
                            </TextField>
                            {errors.selectedMarket && <FormHelperText error>{errors.selectedMarket}</FormHelperText>}
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth label="등록된 상품명" name="registeredProductName"
                                value={productInfo.registeredProductName} onChange={handleProductInfoChange}
                                error={!!errors.registeredProductName} sx={inputStyle} placeholder="상품명을 입력하세요" />
                            {errors.registeredProductName && <FormHelperText error>{errors.registeredProductName}</FormHelperText>}
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth label="택배 상품명" name="deliveryProductName"
                                value={productInfo.deliveryProductName} onChange={handleProductInfoChange}
                                error={!!errors.deliveryProductName} sx={inputStyle} placeholder="택배에 표시될 상품명"
                                InputProps={{ startAdornment: <InputAdornment position="start"><LocalShipping sx={{ color: '#9ca3af' }} /></InputAdornment> }} />
                            {errors.deliveryProductName && <FormHelperText error>{errors.deliveryProductName}</FormHelperText>}
                        </Grid>
                    </Grid>
                </Paper>

                {/* 가격 정보 섹션 */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <AttachMoney sx={{ color: '#10b981' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>가격 정보</Typography>
                    </Box>

                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="상품 가격" name="productPrice" type="number"
                                value={productInfo.productPrice} onChange={handleProductInfoChange}
                                error={!!errors.productPrice} sx={inputStyle}
                                InputProps={{ startAdornment: <InputAdornment position="start">₩</InputAdornment> }} />
                            {errors.productPrice && <FormHelperText error>{errors.productPrice}</FormHelperText>}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="마진" type="number" value={margin}
                                onChange={(e) => setMargin(Number(e.target.value))}
                                error={!!errors.margin} sx={inputStyle}
                                InputProps={{ startAdornment: <InputAdornment position="start">₩</InputAdornment> }} />
                            {errors.margin && <FormHelperText error>{errors.margin}</FormHelperText>}
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="기본수량" name="count" type="number"
                                value={productInfo.count} onChange={handleProductInfoChange} sx={inputStyle} />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth select label="박스 타입" name="boxType"
                                value={productInfo.boxType} onChange={handleProductInfoChange} sx={inputStyle}>
                                {Object.keys(BOX_TYPES).map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type} (배송비: {BOX_TYPES[type].DeliveryPrice.toLocaleString()}원)
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>
                </Paper>

                {/* 마켓 옵션 섹션 */}
                <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Store sx={{ color: '#f59e0b' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>마켓별 옵션</Typography>
                        {errors.optionId && <Chip label={errors.optionId} size="small" color="error" sx={{ ml: 2 }} />}
                    </Box>

                    {markets.map((market) => (
                        <Paper key={market.id} elevation={0}
                            sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                                    {market.name}
                                </Typography>
                                <Button size="small" startIcon={<Add />} onClick={() => addOptionId(market.id)}
                                    sx={{ color: '#667eea', '&:hover': { backgroundColor: 'rgba(102,126,234,0.04)' } }}>
                                    옵션 추가
                                </Button>
                            </Box>

                            {(marketOptions[market.id] || []).map((option, index) => (
                                <Grid container spacing={2} key={index} sx={{ mb: 1.5 }}>
                                    <Grid item xs={5}>
                                        <TextField fullWidth size="small" label="옵션 ID" placeholder="옵션 ID 입력"
                                            value={option.optionId || ''}
                                            onChange={(e) => handleMarketOptionChange(market.id, index, 'optionId', e.target.value)}
                                            sx={{ ...inputStyle, '& .MuiOutlinedInput-root': { ...inputStyle['& .MuiOutlinedInput-root'], backgroundColor: 'white' } }} />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField fullWidth size="small" label="수수료" disabled
                                            value={openMarkets[productInfo.selectedMarket]?.tex ? `${openMarkets[productInfo.selectedMarket].tex}%` : '-'}
                                            sx={inputStyle} />
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField fullWidth size="small" label="판매가" type="number"
                                            value={option.price || ''}
                                            onChange={(e) => handleMarketOptionChange(market.id, index, 'price', e.target.value)}
                                            sx={{ ...inputStyle, '& .MuiOutlinedInput-root': { ...inputStyle['& .MuiOutlinedInput-root'], backgroundColor: 'white' } }} />
                                    </Grid>
                                    <Grid item xs={1} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <IconButton size="small" onClick={() => removeOptionId(market.id, index)}
                                            sx={{ color: '#ef4444', '&:hover': { backgroundColor: 'rgba(239,68,68,0.04)' } }}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}

                            {(!marketOptions[market.id] || marketOptions[market.id].length === 0) && (
                                <Typography variant="body2" sx={{ color: '#9ca3af', textAlign: 'center', py: 2 }}>
                                    등록된 옵션이 없습니다. 옵션을 추가해주세요.
                                </Typography>
                            )}
                        </Paper>
                    ))}
                </Paper>

                {/* Submit Button */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button type="button" variant="outlined" size="large" onClick={() => router.push('/market/list')}
                        sx={{ flex: 1, py: 1.5, borderRadius: 2, borderColor: '#e2e8f0', color: '#6b7280', '&:hover': { borderColor: '#d1d5db', backgroundColor: '#f9fafb' } }}>
                        취소
                    </Button>
                    <Button type="submit" variant="contained" size="large" startIcon={<Save />} disabled={loading}
                        sx={{ flex: 2, py: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102,126,234,0.4)', '&:hover': { background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)' } }}>
                        {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : (isEditMode ? '상품 수정' : '상품 등록')}
                    </Button>
                </Box>
            </form>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProductCreationPage;
