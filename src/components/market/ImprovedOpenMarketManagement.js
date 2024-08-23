import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Button, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { collection, getDocs, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import FileUploader from './FileUploader';

const ImprovedOpenMarketManagement = () => {
    const [openMarkets, setOpenMarkets] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [loading, setLoading] = useState(true);
    const [processedData, setProcessedData] = useState({});


    useEffect(() => {
        fetchOpenMarkets();
    }, []);

    const fetchOpenMarkets = async () => {
        const snapshot = await getDocs(collection(db, 'open_market'));
        const markets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOpenMarkets(markets);
        setLoading(false);
    };

    const handleFileUpload = (marketId, file) => {
        setUploadedFiles(prev => ({ ...prev, [marketId]: file }));
    };

    const processFiles = async () => {
        setLoading(true);
        const processedData = {};
        const today = new Date().toISOString().split('T')[0];

        for (const market of openMarkets) {
            if (uploadedFiles[market.id]) {
                const data = await readFileData(uploadedFiles[market.id]);
                processedData[market.id] = aggregateData(data);
            }
        }

        setProcessedData(processedData);
        updateInventory(processedData);

        setLoading(false);
    };

    const readFileData = (file) => {
        // Implement file reading logic here
        // This could involve using FileReader API or a library like XLSX
        // Return the parsed data
    };

    const aggregateData = (data) => {
        // Implement data aggregation logic here
        // Group by product, sum quantities, etc.
        // Return the aggregated data
    };


    const updateInventory = async (data) => {
        for (const [marketId, marketData] of Object.entries(data)) {
            for (const [productId, quantity] of Object.entries(marketData)) {
                const productRef = doc(db, 'market_products', productId);
                await updateDoc(productRef, {
                    stock: increment(-quantity)
                });
            }
        }
    };


    if (loading) return <CircularProgress />;

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>오픈마켓 관리</Typography>

            <Grid container spacing={3}>
                {openMarkets.map(market => (
                    <Grid item xs={12} sm={6} md={4} key={market.id}>
                        <FileUploader
                            marketId={market.id}
                            marketName={market.name}
                            onFileUpload={handleFileUpload}
                        />
                    </Grid>
                ))}
            </Grid>

            <Button
                variant="contained"
                color="primary"
                onClick={processFiles}
                disabled={Object.keys(uploadedFiles).length === 0}
                style={{ marginTop: '20px' }}
            >
                파일 처리 및 재고 업데이트
            </Button>

            {Object.keys(processedData).length > 0 && (
                <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>오픈마켓</TableCell>
                                <TableCell>제품</TableCell>
                                <TableCell align="right">출고량</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(processedData).map(([marketId, marketData]) =>
                                Object.entries(marketData).map(([productId, quantity]) => (
                                    <TableRow key={`${marketId}-${productId}`}>
                                        <TableCell>{openMarkets.find(m => m.id === marketId)?.name}</TableCell>
                                        <TableCell>{productId}</TableCell>
                                        <TableCell align="right">{quantity}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default ImprovedOpenMarketManagement;