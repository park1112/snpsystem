import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, TextField, Button, Grid, Paper,
    MenuItem, Snackbar, CircularProgress, FormHelperText, IconButton,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, addDoc, getDocs, updateDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useRouter } from 'next/router';

const BOX_TYPES = {
    '극소': { price: 0, boxPrice: 528, DeliveryPrice: 2500 },
    '소': { price: 0, boxPrice: 900, DeliveryPrice: 3000 },
    '대': { price: 5000, boxPrice: 1300, DeliveryPrice: 5000 }
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
                console.log("Fetched product data:", data); // 로그 추가
                setProductInfo({
                    registeredProductName: data.registeredProductName || '',
                    deliveryProductName: data.deliveryProductName || '',
                    boxType: data.boxType || '극소',
                    price: data.price || 0,
                    productPrice: data.productPrice || '',
                    count: data.count !== undefined ? data.count : 1,  // 여기를 확인
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
            if (!currentOptions || !Array.isArray(currentOptions)) {
                console.error(`Invalid options for marketId: ${marketId}`);
                return prev;
            }
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
        setMarketOptions(prev => {
            const currentOptions = prev[marketId] || [];
            return {
                ...prev,
                [marketId]: [...currentOptions, { optionId: '', price: '' }]
            };
        });
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
                            .map(opt => ({
                                optionId: String(opt.optionId).trim(),
                                price: opt.price || ''
                            }))
                    ]).filter(([_, options]) => options.length > 0)
                ),
            };

            if (isEditMode) {
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


    const handleMarginChange = (e) => {
        setMargin(Number(e.target.value));
    };

    const renderMarketOptions = (marketId) => {
        const options = marketOptions[marketId] || [];
        return options.map((option, index) => (
            <Grid container spacing={2} key={index} style={{ marginTop: '1rem' }}>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="옵션 ID"
                        value={option.optionId || ''}
                        onChange={(e) => handleMarketOptionChange(marketId, index, 'optionId', e.target.value)}
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="수수료 (%)"
                        value={openMarkets[productInfo.selectedMarket]?.tex || ''}
                        disabled
                    />
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        fullWidth
                        label="판매 가격"
                        value={option.price || ''}
                        onChange={(e) => handleMarketOptionChange(marketId, index, 'price', e.target.value)}
                    />
                </Grid>
                <Grid item xs={2}>
                    <IconButton onClick={() => removeOptionId(marketId, index)}>
                        <DeleteIcon />
                    </IconButton>
                </Grid>
            </Grid>
        ));
    };

    if (loading) {
        return (
            <Container maxWidth="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                {isEditMode ? '상품 수정' : '상품 생성'}
            </Typography>
            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                select
                                label="오픈마켓 선택"
                                name="selectedMarket"
                                value={productInfo.selectedMarket}
                                onChange={handleProductInfoChange}
                                required
                                error={!!errors.selectedMarket}
                            >
                                {Object.entries(openMarkets).map(([id, market]) => (
                                    <MenuItem key={id} value={id}>
                                        {market.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {errors.selectedMarket && <FormHelperText error>{errors.selectedMarket}</FormHelperText>}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="등록된 상품명"
                                name="registeredProductName"
                                value={productInfo.registeredProductName}
                                onChange={handleProductInfoChange}
                                required
                                error={!!errors.registeredProductName}
                            />
                            {errors.registeredProductName && <FormHelperText error>{errors.registeredProductName}</FormHelperText>}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="택배 상품명"
                                name="deliveryProductName"
                                value={productInfo.deliveryProductName}
                                onChange={handleProductInfoChange}
                                required
                                error={!!errors.deliveryProductName}
                            />
                            {errors.deliveryProductName && <FormHelperText error>{errors.deliveryProductName}</FormHelperText>}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="상품 가격"
                                name="productPrice"
                                type="number"
                                value={productInfo.productPrice}
                                onChange={handleProductInfoChange}
                                required
                                error={!!errors.productPrice}
                            />
                            {errors.productPrice && <FormHelperText error>{errors.productPrice}</FormHelperText>}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="마진"
                                type="number"
                                value={margin}
                                onChange={handleMarginChange}
                                required
                                error={!!errors.margin}
                            />
                            {errors.margin && <FormHelperText error>{errors.margin}</FormHelperText>}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="기본수량"
                                name="count"
                                type="number"
                                value={productInfo.count}
                                onChange={handleProductInfoChange}
                                required
                            />

                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="박스 타입"
                                name="boxType"
                                value={productInfo.boxType}
                                onChange={handleProductInfoChange}
                                required
                            >
                                {Object.keys(BOX_TYPES).map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom style={{ marginTop: '2rem' }}>
                                오픈마켓 정보
                            </Typography>
                            {markets.map((market) => (
                                <Paper key={market.id} style={{ padding: '1rem', marginBottom: '1rem' }}>
                                    <Typography variant="subtitle1">{market.name}</Typography>
                                    {renderMarketOptions(market.id)}
                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={() => addOptionId(market.id)}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        옵션 추가
                                    </Button>
                                </Paper>
                            ))}
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                style={{ marginTop: '2rem' }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : (isEditMode ? '상품 수정' : '상품 생성')}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProductCreationPage;