import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Box,
    TableSortLabel,
    TextField
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MarketAnalysisPage = () => {
    const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
    const [marketData, setMarketData] = useState({});
    const [loading, setLoading] = useState(false);
    const [marketNames, setMarketNames] = useState([]);
    const [productTotals, setProductTotals] = useState({});
    const [dataFetched, setDataFetched] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'desc' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'daily_summaries'),
                where('updatedAt', '>=', dateRange[0].toDate()),
                where('updatedAt', '<=', dateRange[1].toDate())
            );
            const querySnapshot = await getDocs(q);
            const fetchedData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                updatedAt: doc.data().updatedAt.toDate(),
            }));
            processData(fetchedData);
            setDataFetched(true);
        } catch (error) {
            console.error('Error fetching data: ', error);
            setDataFetched(false);
        } finally {
            setLoading(false);
        }
    };

    const processData = (fetchedData) => {
        const processedData = {};
        const totals = {};
        const markets = new Set();

        fetchedData.forEach((doc) => {
            doc.summary.forEach((item) => {
                if (!processedData[item.productName]) {
                    processedData[item.productName] = {};
                    totals[item.productName] = 0;
                }
                if (!processedData[item.productName][doc.marketName]) {
                    processedData[item.productName][doc.marketName] = 0;
                }

                processedData[item.productName][doc.marketName] += item.totalQuantity;
                totals[item.productName] += item.totalQuantity;
                markets.add(doc.marketName);
            });
        });

        setMarketData(processedData);
        setProductTotals(totals);
        setMarketNames([...markets]);
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedProducts = Object.keys(productTotals).sort((a, b) => {
        if (sortConfig.key === 'productName') {
            return sortConfig.direction === 'asc'
                ? a.localeCompare(b)
                : b.localeCompare(a);
        } else if (sortConfig.key === 'total') {
            return sortConfig.direction === 'asc'
                ? productTotals[a] - productTotals[b]
                : productTotals[b] - productTotals[a];
        } else {
            return sortConfig.direction === 'asc'
                ? (marketData[a][sortConfig.key] || 0) - (marketData[b][sortConfig.key] || 0)
                : (marketData[b][sortConfig.key] || 0) - (marketData[a][sortConfig.key] || 0);
        }
    });

    const top10Products = sortedProducts.slice(0, 7);

    const getGraphData = () => top10Products.map((productName) => {
            const rowData = { name: productName };
            marketNames.forEach((market) => {
                rowData[market] = marketData[productName]
                    ? marketData[productName][market] || 0
                    : 0;
            });
            return rowData;
        });

    const graphData = getGraphData();

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c', '#d0ed57', '#ffc658', '#ff8042'];

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom align="center" style={{ margin: '20px 0' }}>
                    마켓별 제품 판매량 분석
                </Typography>
                <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={8}>
                            <DateRangePicker
                                startText="시작 날짜"
                                endText="종료 날짜"
                                value={dateRange}
                                onChange={(newValue) => setDateRange(newValue)}
                                renderInput={(startProps, endProps) => (
                                    <>
                                        <TextField {...startProps} fullWidth />
                                        <Box sx={{ mx: 2 }}> to </Box>
                                        <TextField {...endProps} fullWidth />
                                    </>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button variant="contained" color="primary" onClick={fetchData} fullWidth>
                                데이터 갱신
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                        <CircularProgress />
                    </Box>
                ) : !dataFetched ? (
                    <Typography align="center">데이터가 없습니다. 날짜 범위를 다시 설정하세요.</Typography>
                ) : (
                    <>
                        <Typography variant="h6" gutterBottom align="center">
                            상위 7개 제품 판매량 (마켓별)
                        </Typography>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            {graphData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        {marketNames.map((market, index) => (
                                            <Bar key={index} dataKey={market} fill={colors[index % colors.length]} />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Typography align="center">그래프를 표시할 데이터가 없습니다.</Typography>
                            )}
                        </Paper>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <TableSortLabel
                                                active={sortConfig.key === 'productName'}
                                                direction={sortConfig.key === 'productName' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('productName')}
                                            >
                                                제품명
                                            </TableSortLabel>
                                        </TableCell>
                                        {marketNames.map((market, index) => (
                                            <TableCell key={index} align="right">
                                                <TableSortLabel
                                                    active={sortConfig.key === market}
                                                    direction={sortConfig.key === market ? sortConfig.direction : 'asc'}
                                                    onClick={() => handleSort(market)}
                                                >
                                                    {market}
                                                </TableSortLabel>
                                            </TableCell>
                                        ))}
                                        <TableCell align="right">
                                            <TableSortLabel
                                                active={sortConfig.key === 'total'}
                                                direction={sortConfig.key === 'total' ? sortConfig.direction : 'asc'}
                                                onClick={() => handleSort('total')}
                                            >
                                                총 판매량
                                            </TableSortLabel>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedProducts.map((productName, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{productName}</TableCell>
                                            {marketNames.map((market) => (
                                                <TableCell key={market} align="right">
                                                    {marketData[productName] && marketData[productName][market] ? marketData[productName][market] : 0}
                                                </TableCell>
                                            ))}
                                            <TableCell align="right" style={{ fontWeight: 'bold' }}>
                                                {productTotals[productName]}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </Container>
        </LocalizationProvider>
    );
};

export default MarketAnalysisPage;
