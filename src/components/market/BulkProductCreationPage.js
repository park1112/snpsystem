import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Grid, Paper, CircularProgress, Snackbar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField
} from '@mui/material';
import * as XLSX from 'xlsx';
import { collection, addDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Iconify from '../Iconify';

const ExcelHandler = ({ onUpload, markets }) => {
    const downloadTemplate = () => {
        const template = [
            {
                '오픈마켓 이름': '',
                '등록된 상품명': '',
                '택배 상품명': '',
                '상품 가격': '',
                '박스타입': '',
                '가격': '',
                '마진': '',
                ...Object.fromEntries(markets.map(market => [`${market.name} 옵션ID 1`, '']))
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "product_template.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const bstr = event.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            onUpload(data);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <>
            <Button variant="contained"
                color="primary"
                onClick={downloadTemplate}
                style={{ marginRight: '10px' }}
                size="large"
                startIcon={<Iconify icon="ic:round-download" />}
            >
                템플릿 다운로드
            </Button>
            <input
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileUpload}
            />
            <label htmlFor="raised-button-file">
                <Button
                    variant="contained"
                    component="span"
                    size="large"
                    startIcon={<Iconify icon="ic:round-upload" />}>
                    엑셀 업로드
                </Button>
            </label>
        </>
    );
};

const BulkProductCreationPage = () => {
    const [products, setProducts] = useState([]);
    const [openMarkets, setOpenMarkets] = useState({});
    const [markets, setMarkets] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        Promise.all([fetchOpenMarkets(), fetchMarkets()])
            .then(() => setLoading(false))
            .catch(error => {
                console.error("Error fetching data: ", error);
                setSnackbar({ open: true, message: '데이터를 불러오는 데 실패했습니다.' });
                setLoading(false);
            });
    }, []);

    const fetchOpenMarkets = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'open_market'));
            const openMarketsData = {};
            querySnapshot.docs.forEach(doc => {
                openMarketsData[doc.id] = { name: doc.data().name, tex: doc.data().tex };
            });
            setOpenMarkets(openMarketsData);
        } catch (error) {
            console.error("Error fetching open markets: ", error);
            setSnackbar({ open: true, message: '오픈마켓 데이터를 불러오는 데 실패했습니다.', severity: 'error' });
        }
    };

    const fetchMarkets = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'markets'));
            const marketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            marketsData.sort((a, b) => a.code - b.code);
            setMarkets(marketsData);
        } catch (error) {
            console.error("Error fetching markets:", error);
            setSnackbar({ open: true, message: '마켓 정보를 불러오는 데 실패했습니다.' });
        }
    };

    const handleExcelUpload = (data) => {
        setLoading(true);
        // 엑셀 데이터에서 필요한 필드를 추출하고, 저장할 데이터 형식으로 변환
        try {
            const newProducts = data.map((item) => {
                const selectedMarket = Object.keys(openMarkets).find(
                    (marketId) => openMarkets[marketId].name === item['오픈마켓 이름']
                );

                const marketOptions = markets.reduce((acc, market) => {
                    const marketName = market.name;
                    acc[market.id] = [];

                    // 같은 이름의 옵션 ID들을 모두 찾아서 처리
                    let optionIndex = 1;  // '옵션ID 1', '옵션ID 2' 등을 처리하기 위한 인덱스
                    while (item[`${marketName} 옵션ID ${optionIndex}`]) {
                        const optionId = item[`${marketName} 옵션ID ${optionIndex}`];
                        if (optionId) {
                            acc[market.id].push({ optionId });
                        }
                        optionIndex++;  // 다음 옵션ID로 이동
                    }

                    return acc;
                }, {});

                return {
                    registeredProductName: item['등록된 상품명'],
                    deliveryProductName: item['택배 상품명'],
                    productPrice: item['상품 가격'],
                    boxType: item['박스타입'],
                    price: item['가격'],
                    margin: item['마진'],
                    selectedMarket,
                    marketOptions,
                };
            });
            setProducts(newProducts);
            setLoading(false);
        }
        catch (error) {
            console.error("Error processing Excel data: ", error);
            setSnackbar({ open: true, message: '엑셀 데이터를 처리하는 중 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setLoading(false); // 엑셀 업로드 로딩 상태 종료
        }
    };

    const handleBulkUpload = async () => {
        setLoading(true);
        try {
            for (const product of products) {
                let productData = { ...product, createdAt: new Date() };

                // Remove any undefined or empty fields before uploading
                Object.keys(productData).forEach(key => {
                    if (productData[key] === undefined || productData[key] === '') {
                        delete productData[key];
                    }
                });

                const docRef = await addDoc(collection(db, 'market_products'), productData);

                // Update the document with its own UID
                await updateDoc(docRef, { UID: docRef.id });
            }
            setSnackbar({ open: true, message: '상품이 성공적으로 생성되었습니다.' });
            setProducts([]);  // 성공적으로 업로드된 후, 목록 초기화
        } catch (error) {
            console.error("Error adding documents: ", error);
            setSnackbar({ open: true, message: '상품 생성 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                상품 대량 등록
            </Typography>
            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <ExcelHandler onUpload={handleExcelUpload} markets={markets} />
                    </Grid>
                    <Grid item xs={12}>
                        {products.length > 0 && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleBulkUpload}
                                startIcon={<Iconify icon="ic:round-upload" />}
                            >
                                대량 업로드
                            </Button>
                        )}
                    </Grid>
                </Grid>

                <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>오픈마켓 이름</TableCell>
                                <TableCell>등록된 상품명</TableCell>
                                <TableCell>택배 상품명</TableCell>
                                <TableCell>상품 가격</TableCell>
                                <TableCell>박스타입</TableCell>
                                <TableCell>가격</TableCell>
                                <TableCell>마진</TableCell>
                                {markets.map(market => (
                                    <TableCell key={market.id}>{`${market.name} 옵션ID`}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product, index) => (
                                <TableRow key={index}>
                                    <TableCell>{openMarkets[product.selectedMarket]?.name}</TableCell>
                                    <TableCell>{product.registeredProductName}</TableCell>
                                    <TableCell>{product.deliveryProductName}</TableCell>
                                    <TableCell>{product.productPrice}</TableCell>
                                    <TableCell>{product.boxType}</TableCell>
                                    <TableCell>{product.price}</TableCell>
                                    <TableCell>{product.margin}</TableCell>
                                    {markets.map(market => (
                                        <TableCell key={market.id}>
                                            {product.marketOptions[market.id]?.[0]?.optionId || ''}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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

export default BulkProductCreationPage;