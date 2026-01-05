import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Typography, Grid, Card, CardHeader, Button,
    CircularProgress, MenuItem, TextField, CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // 아이콘을 추가합니다.
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import useSettings from '../../hooks/useSettings';
import Page from '../Page';
import Iconify from '../Iconify';
import FileUploader from './FileUploader';
import ProductSummary from './ProductSummary';
import ExcelDownloader from './ExcelDownloader';
import DailyAggregateViewer from './DailyAggregateViewer';

import { StockInForm, InventoryViewer, updateInventory, handleStockOut } from './StockManagementComponents';


const MarketManagement = () => {
    const { themeStretch } = useSettings();
    const [markets, setMarkets] = useState([]);
    const [selectedMarket, setSelectedMarket] = useState('');
    const [productMappings, setProductMappings] = useState({});
    const [itemList, setItemList] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openMarkets, setOpenMarkets] = useState([]);
    const [fileStates, setFileStates] = useState({});
    const fileUploaderRefs = useRef({});

    useEffect(() => {
        fetchOpenMarketsAndMappings();
        fetchOpenMarkets();
    }, []);


    const fetchOpenMarkets = async () => {
        const snapshot = await getDocs(collection(db, 'open_market'));
        const markets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOpenMarkets(markets);
        setLoading(false);
    };

    const fetchOpenMarketsAndMappings = async () => {
        try {
            const openMarketsSnapshot = await getDocs(collection(db, 'markets'));
            const openMarketsData = openMarketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            openMarketsData.sort((a, b) => a.code - b.code);
            setMarkets(openMarketsData);

            const mappingsSnapshot = await getDocs(collection(db, 'market_products'));
            const mappingsData = mappingsSnapshot.docs.reduce((acc, doc) => {
                const data = doc.data();
                if (data.marketOptions) {
                    Object.entries(data.marketOptions).forEach(([marketId, options]) => {
                        if (!acc[marketId]) acc[marketId] = {};
                        if (Array.isArray(options)) {
                            options.forEach(option => {
                                if (option.optionId) {
                                    acc[marketId][option.optionId] = {
                                        registeredProductName: data.registeredProductName,
                                        deliveryProductName: data.deliveryProductName,
                                        boxType: data.boxType,
                                        price: option.price,
                                        count: data.count,
                                        productPrice: data.productPrice,
                                        selectedMarket: data.selectedMarket,
                                        UID: data.UID
                                    };
                                }
                            });
                        }
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
    const handleFileUpload = (data, fileName) => {
        console.log("Raw uploaded data:", data);
        if (data === null) {
            // 파일이 삭제된 경우
            setItemList(prev => {
                const newItemList = { ...prev };
                delete newItemList[selectedMarket];
                return newItemList;
            });
            setFileStates(prev => {
                const newFileStates = { ...prev };
                delete newFileStates[selectedMarket];
                return newFileStates;
            });
            console.log("File removed for market:", selectedMarket);
        } else if (Array.isArray(data) && data.length > 0) {
            setItemList(prev => ({
                ...prev,
                [selectedMarket]: [...(prev[selectedMarket] || []), ...data]
            }));
            setFileStates(prev => ({
                ...prev,
                [selectedMarket]: fileName
            }));
            console.log("File uploaded successfully for market:", selectedMarket);
        } else {
            console.error("Uploaded data is not in the expected format:", data);
            alert('업로드된 파일의 형식이 올바르지 않습니다.');
        }
    };

    const handleDataAggregate = () => {
        if (Object.keys(itemList).length === 0) {
            alert('파일을 업로드해주세요.');
            return;
        }

        console.log("Product Mappings:", productMappings);

        const allFilteredData = Object.entries(itemList).flatMap(([marketId, items]) => {
            const marketMapping = productMappings[marketId] || {};
            return items.map(item => {
                const optionId = item.옵션ID || item.옵션정보 || item.상품번호 || item.옵션 || item.옵션번호 || item.상품코드;
                console.log(`Processing item with Option ID: ${optionId}`);
                const matchedProduct = marketMapping[optionId];
                console.log("Matched product:", matchedProduct);
                return {
                    ...item,
                    matchedProduct: matchedProduct || {} // 빈 객체를 기본값으로 설정
                };
            });
        });

        console.log("All Filtered Data:", allFilteredData);

        setItemList(prev => ({
            ...prev,
            aggregated: allFilteredData
        }));
    };

    const handleClearUploadedData = () => {
        if (window.confirm('정말 모든 업로드된 데이터를 삭제하시겠습니까?')) {
            setItemList({});

            // 모든 FileUploader 컴포넌트의 파일 상태를 초기화
            openMarkets.forEach(market => {
                if (fileUploaderRefs.current[market.id]) {
                    fileUploaderRefs.current[market.id].clearFile(); // clearFile 호출
                }
            });

            console.log('All uploaded data and file states have been cleared.');
        }
    };






    // const handleFileUpload = (data) => {
    //     console.log("Raw uploaded data:", data);
    //     if (data === null) {
    //         // 파일이 삭제된 경우
    //         setItemList(prev => {
    //             const newItemList = { ...prev };
    //             delete newItemList[selectedMarket];
    //             return newItemList;
    //         });
    //         console.log("File removed for market:", selectedMarket);
    //     } else if (Array.isArray(data) && data.length > 0) {
    //         setItemList(prev => ({
    //             ...prev,
    //             [selectedMarket]: data
    //         }));
    //         console.log("File uploaded successfully for market:", selectedMarket);
    //     } else {
    //         console.error("Uploaded data is not in the expected format:", data);
    //         alert('업로드된 파일의 형식이 올바르지 않습니다.');
    //     }
    // };

    // const handleDataAggregate = () => {
    //     if (!selectedMarket || !itemList[selectedMarket]) {
    //         alert('오픈마켓을 선택하고 파일을 업로드해주세요.');
    //         return;
    //     }


    //     console.log("Product Mappings:", productMappings);


    //     const marketMapping = productMappings[selectedMarket] || {};


    //     const marketData = itemList[selectedMarket];

    //     let filteredData = [];
    //     if (Array.isArray(marketData)) {
    //         filteredData = marketData.map(item => {
    //             const optionId = item.옵션ID || item.옵션정보 || item.상품번호 || item.옵션 || item.옵션번호;
    //             console.log(`Processing item with Option ID: ${optionId}`);
    //             const matchedProduct = marketMapping[optionId];
    //             console.log("Matched product:", matchedProduct);
    //             return {
    //                 ...item,
    //                 matchedProduct: matchedProduct
    //             };

    //         });
    //     } else {
    //         console.error(`Unexpected data type for market ${selectedMarket}:`, marketData);
    //     }



    //     console.log("Filtered Data:", filteredData);

    //     // Update itemList with the new filtered data
    //     setItemList(prev => ({
    //         ...prev,
    //         [selectedMarket]: filteredData
    //     }));
    // };

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
                            variant="outlined"
                        >
                            {markets.map((market) => (
                                <MenuItem key={market.id} value={market.id}>
                                    {market.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="오픈마켓 파일 업로드" />
                            <CardContent>
                                <Grid container spacing={3}>
                                    {openMarkets.map(market => (
                                        <Grid item xs={12} sm={6} md={4} key={market.id}>
                                            <FileUploader
                                                ref={(el) => fileUploaderRefs.current[market.id] = el}
                                                marketId={market.id}
                                                marketName={market.name}
                                                onFileUpload={handleFileUpload}
                                                disabled={!selectedMarket}
                                            />

                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} container justifyContent="center" spacing={2}>
                        <Grid item>
                            <Button
                                onClick={handleDataAggregate}
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<Iconify icon="ic:round-access-alarm" />}
                                disabled={!selectedMarket || !itemList[selectedMarket]}
                            >
                                자료집계
                            </Button>
                        </Grid>
                        <Grid item>
                            <ExcelDownloader
                                itemList={itemList}
                                productMappings={productMappings}
                                selectedMarket={selectedMarket}
                                markets={markets}
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                onClick={handleClearUploadedData}
                                variant="outlined"
                                color="secondary"
                                size="large"
                                startIcon={<DeleteIcon />}
                                disabled={Object.keys(itemList).length === 0}
                            >
                                데이터 삭제
                            </Button>
                        </Grid>
                    </Grid>

                    <Grid item xs={12}>
                        <Card>
                            <CardHeader title="상품 요약" />
                            <CardContent>
                                <ProductSummary itemList={itemList} productMappings={productMappings} marketName={markets.find(market => market.id === selectedMarket)?.name || ''} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Page>
    );
};

export default MarketManagement;