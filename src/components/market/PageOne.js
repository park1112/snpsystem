import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardHeader, Button,
    CircularProgress, MenuItem, TextField, CardContent
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import FileUploader from './FileUploader';
import ProductSummary from './ProductSummary';
import ExcelDownloader from './ExcelDownloader';

const PageOne = () => {
    const { themeStretch } = useSettings();
    const [openMarkets, setOpenMarkets] = useState([]);
    const [selectedMarket, setSelectedMarket] = useState('');
    const [productMappings, setProductMappings] = useState({});
    const [itemList, setItemList] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOpenMarketsAndMappings();
    }, []);

    const fetchOpenMarketsAndMappings = async () => {
        try {
            const openMarketsSnapshot = await getDocs(collection(db, 'markets'));
            const openMarketsData = openMarketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            openMarketsData.sort((a, b) => a.code - b.code);
            setOpenMarkets(openMarketsData);

            const mappingsSnapshot = await getDocs(collection(db, 'market_products'));
            const mappingsData = mappingsSnapshot.docs.reduce((acc, doc) => {
                const data = doc.data();
                if (data.marketOptions) {
                    Object.entries(data.marketOptions).forEach(([marketId, options]) => {
                        if (!acc[marketId]) acc[marketId] = {};
                        acc[marketId][options.optionId] = {
                            registeredProductName: data.registeredProductName,
                            deliveryProductName: data.deliveryProductName,
                            boxType: data.boxType,
                            price: data.price
                        };
                    });
                }
                return acc;
            }, {});
            setProductMappings(mappingsData);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
            setLoading(false);
        }
    };

    const handleMarketChange = (event) => {
        setSelectedMarket(event.target.value);
    };

    const handleFileUpload = (data) => {
        console.log("Raw uploaded data:", data);
        if (Array.isArray(data) && data.length > 0) {
            setItemList(prev => ({
                ...prev,
                [selectedMarket]: data
            }));
        } else {
            console.error("Uploaded data is not in the expected format:", data);
            alert('업로드된 파일의 형식이 올바르지 않습니다.');
        }
    };

    const handleDataAggregate = () => {
        if (!selectedMarket || !itemList[selectedMarket]) {
            alert('오픈마켓을 선택하고 파일을 업로드해주세요.');
            return;
        }

        console.log("Selected Market UID:", selectedMarket);
        console.log("Product Mappings:", productMappings);
        console.log("Uploaded File Data:", itemList[selectedMarket]);

        const marketMapping = productMappings[selectedMarket] || {};
        console.log("Market Mapping for selected market:", marketMapping);

        const marketData = itemList[selectedMarket];

        let filteredData = [];
        if (Array.isArray(marketData)) {
            filteredData = marketData.map(item => {
                const optionId = item.옵션ID || item.옵션정보 || item.상품번호 || item.옵션 || item.옵션번호;
                console.log(`Processing item with Option ID: ${optionId}`);
                const matchedProduct = marketMapping[optionId];
                console.log("Matched product:", matchedProduct);
                return {
                    ...item,
                    matchedProduct: matchedProduct
                };
            });
        } else {
            console.error(`Unexpected data type for market ${selectedMarket}:`, marketData);
        }

        console.log("Filtered Data:", filteredData);

        // Update itemList with the new filtered data
        setItemList(prev => ({
            ...prev,
            [selectedMarket]: filteredData
        }));
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Page title="오픈마켓">
            <Container maxWidth={themeStretch ? false : 'xl'}>
                <Typography variant="h3" component="h1" paragraph>
                    오픈마켓 총 합계
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="오픈마켓 선택"
                            value={selectedMarket}
                            onChange={handleMarketChange}
                        >
                            {openMarkets.map((market) => (
                                <MenuItem key={market.id} value={market.id}>
                                    {market.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FileUploader
                            marketId={selectedMarket}
                            marketName={openMarkets.find(m => m.id === selectedMarket)?.name || ''}
                            onFileUpload={handleFileUpload}
                            disabled={!selectedMarket}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            onClick={handleDataAggregate}
                            variant="contained"
                            color="primary"
                            endIcon={<Iconify icon="ic:round-access-alarm" />}
                            disabled={!selectedMarket || !itemList[selectedMarket]}
                        >
                            자료집계
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <ProductSummary itemList={itemList} productMappings={productMappings} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <ExcelDownloader
                            itemList={itemList}
                            productMappings={productMappings}
                            selectedMarket={selectedMarket}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Page>
    );
};

export default PageOne;