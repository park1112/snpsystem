import React, { useState, useEffect } from 'react';
import {
    Container, Typography, TextField, Button, Grid, Paper,
    MenuItem, Snackbar, CircularProgress, FormHelperText
} from '@mui/material';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';

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
        productPrice: '',
        selectedMarket: '',
    });

    const [openMarkets, setOpenMarkets] = useState({});
    const [markets, setMarkets] = useState([]);
    const [marketOptions, setMarketOptions] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [loading, setLoading] = useState(true);
    const [margin, setMargin] = useState(2000);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        Promise.all([fetchOpenMarkets(), fetchMarkets()])
            .then(() => setLoading(false))
            .catch(error => {
                console.error("Error fetching data: ", error);
                setSnackbar({ open: true, message: '데이터를 불러오는 데 실패했습니다.' });
                setLoading(false);
            });
    }, []);

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

    const fetchOpenMarkets = async () => {
        const querySnapshot = await getDocs(collection(db, 'open_market'));
        const openMarketsData = {};
        querySnapshot.docs.forEach(doc => {
            openMarketsData[doc.id] = { name: doc.data().name, tex: doc.data().tex };
        });
        setOpenMarkets(openMarketsData);
    };

    const fetchMarkets = async () => {
        const querySnapshot = await getDocs(collection(db, 'markets'));
        const marketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort markets by code in ascending order
        marketsData.sort((a, b) => a.code - b.code);
        setMarkets(marketsData);
        const initialOptions = {};
        marketsData.forEach(market => {
            initialOptions[market.id] = { optionId: '', price: '' };
        });
        setMarketOptions(initialOptions);
    };

    const handleProductInfoChange = (e) => {
        const { name, value } = e.target;
        setProductInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleMarketOptionChange = (marketId, field, value) => {
        setMarketOptions(prev => ({
            ...prev,
            [marketId]: { ...prev[marketId], [field]: value }
        }));
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
        const updatedOptions = { ...marketOptions };
        markets.forEach(market => {
            updatedOptions[market.id] = {
                ...updatedOptions[market.id],
                price: calculatedPrice
            };
        });
        setMarketOptions(updatedOptions);
    };

    const validateInputs = () => {
        const newErrors = {};
        if (!productInfo.selectedMarket) newErrors.selectedMarket = '오픈마켓을 선택하세요';
        if (!productInfo.registeredProductName) newErrors.registeredProductName = '등록된 상품명을 입력하세요';
        if (!productInfo.deliveryProductName) newErrors.deliveryProductName = '택배 상품명을 입력하세요';
        if (!productInfo.productPrice) newErrors.productPrice = '상품 가격을 입력하세요';
        if (!margin) newErrors.margin = '마진을 입력하세요';

        // Check if all markets have an optionId
        markets.forEach(market => {
            if (!marketOptions[market.id]?.optionId) {
                newErrors[`optionId_${market.id}`] = '옵션 ID를 입력하세요';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const removeEmptyFields = (obj) => {
        Object.keys(obj).forEach(key => {
            if (obj[key] && typeof obj[key] === 'object') {
                removeEmptyFields(obj[key]);
            } else if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
                delete obj[key];
            }
        });
        return obj;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInputs()) return;

        try {
            setLoading(true);
            let productData = {
                ...productInfo,
                margin,
                marketOptions: { ...marketOptions },
                createdAt: new Date(),
            };

            // Remove empty fields
            productData = removeEmptyFields(productData);

            // Ensure marketOptions is not empty
            if (Object.keys(productData.marketOptions).length === 0) {
                delete productData.marketOptions;
            }

            await addDoc(collection(db, 'market_products'), productData);
            setSnackbar({ open: true, message: '상품이 성공적으로 생성되었습니다.' });

            // Reset form
            setProductInfo({
                registeredProductName: '',
                deliveryProductName: '',
                boxType: '극소',
                price: 0,
                productPrice: '',
                selectedMarket: '',
            });
            setMargin(2000);
            const resetOptions = {};
            markets.forEach(market => {
                resetOptions[market.id] = { optionId: '', price: '' };
            });
            setMarketOptions(resetOptions);
        } catch (error) {
            console.error("Error adding document: ", error);
            setSnackbar({ open: true, message: '상품 생성 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };
    const handleMarginChange = (e) => {
        setMargin(Number(e.target.value));
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                상품 생성
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

                        {/* 오픈마켓별 정보 입력 및 계산된 가격 표시 */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                오픈마켓 정보
                            </Typography>
                            {markets.map((market) => (
                                <Grid container spacing={2} key={market.id}>
                                    <Grid item xs={3}>
                                        <Typography>{market.name}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <TextField
                                            fullWidth
                                            label="옵션 ID"
                                            value={marketOptions[market.id]?.optionId || ''}
                                            onChange={(e) => handleMarketOptionChange(market.id, 'optionId', e.target.value)}
                                            error={!!errors[`optionId_${market.id}`]}
                                        />
                                        {errors[`optionId_${market.id}`] && <FormHelperText error>{errors[`optionId_${market.id}`]}</FormHelperText>}
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
                                            value={marketOptions[market.id]?.price || ''}
                                            disabled
                                        />
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>

                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary">
                                상품 생성
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
            />
        </Container>
    );
};

export default ProductCreationPage;