import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Chip, TextField,
    ToggleButton, ToggleButtonGroup, Card, CardContent, Tabs, Tab
} from '@mui/material';
import {
    TrendingUp, CalendarToday, Today, DateRange, CalendarMonth,
    Store, Inventory, AttachMoney, ArrowBack, Refresh, BarChart as BarChartIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useRouter } from 'next/router';

const COLORS = ['#667eea', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

const MarketAnalysisPage = () => {
    const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day').startOf('day'));
    const [endDate, setEndDate] = useState(dayjs());
    const [marketData, setMarketData] = useState({});
    const [loading, setLoading] = useState(false);
    const [marketNames, setMarketNames] = useState([]);
    const [marketsInfo, setMarketsInfo] = useState({}); // 거래처 정보 (코드 포함)
    const [productTotals, setProductTotals] = useState({});
    const [dataFetched, setDataFetched] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedTab, setSelectedTab] = useState(0);
    const [quickSelect, setQuickSelect] = useState('week');
    const router = useRouter();

    // 거래처 정보 불러오기
    const fetchMarkets = async () => {
        try {
            const marketsSnapshot = await getDocs(collection(db, 'markets'));
            const marketsData = {};
            marketsSnapshot.forEach((doc) => {
                const data = doc.data();
                marketsData[data.name] = {
                    id: doc.id,
                    code: data.code || 0,
                    name: data.name
                };
            });
            setMarketsInfo(marketsData);
        } catch (error) {
            console.error('Error fetching markets:', error);
        }
    };

    useEffect(() => {
        fetchMarkets();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'daily_summaries'),
                where('updatedAt', '>=', startDate.toDate()),
                where('updatedAt', '<=', endDate.endOf('day').toDate())
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
        let totalAmountSum = 0;

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

                // 모든 마켓의 총 금액 계산
                totalAmountSum += item.totalAmount || 0;
            });
        });

        setMarketData(processedData);
        setProductTotals(totals);
        setMarketNames([...markets]); // 정렬은 sortedMarketNames에서 처리
        setTotalAmount(totalAmountSum);
    };

    // 거래처 코드 기준 정렬된 마켓 목록 (코드 숫자가 낮은 순서)
    const sortedMarketNames = useMemo(() => {
        return [...marketNames].sort((a, b) => {
            const codeA = marketsInfo[a]?.code || 999;
            const codeB = marketsInfo[b]?.code || 999;
            return codeA - codeB;
        });
    }, [marketNames, marketsInfo]);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const handleQuickSelect = (event, newValue) => {
        if (!newValue) return;
        setQuickSelect(newValue);
        const today = dayjs();

        switch (newValue) {
            case 'today':
                setStartDate(today.startOf('day'));
                setEndDate(today);
                break;
            case 'week':
                setStartDate(today.subtract(7, 'day').startOf('day'));
                setEndDate(today);
                break;
            case 'month':
                setStartDate(today.subtract(1, 'month').startOf('day'));
                setEndDate(today);
                break;
            case 'custom':
                break;
        }
    };

    // 각 마켓별 상위 7개 상품 데이터 생성
    const getMarketTopProducts = (marketName) => {
        const products = Object.keys(marketData)
            .filter(productName => marketData[productName][marketName] > 0)
            .map(productName => ({
                name: productName,
                quantity: marketData[productName][marketName] || 0
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 7);

        return products;
    };

    // 마켓별 총 판매량
    const getMarketTotal = (marketName) => {
        return Object.keys(marketData).reduce((sum, productName) => {
            return sum + (marketData[productName][marketName] || 0);
        }, 0);
    };

    // 전체 상위 7개 상품
    const topProducts = useMemo(() => {
        return Object.keys(productTotals)
            .sort((a, b) => productTotals[b] - productTotals[a])
            .slice(0, 7);
    }, [productTotals]);

    const totalQuantity = useMemo(() => {
        return Object.values(productTotals).reduce((sum, val) => sum + val, 0);
    }, [productTotals]);

    const StatCard = ({ icon, label, value, color = '#667eea', subValue }) => (
        <Paper elevation={0} sx={{
            p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%',
            transition: 'all 0.2s',
            '&:hover': { borderColor: color, boxShadow: `0 4px 12px ${color}20` }
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                    p: 1.5, borderRadius: 2,
                    backgroundColor: `${color}15`, color: color
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500 }}>
                        {label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#374151' }}>
                        {value}
                    </Typography>
                    {subValue && (
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {subValue}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Paper>
    );

    const MarketCard = ({ marketName, index }) => {
        const topProducts = getMarketTopProducts(marketName);
        const marketTotal = getMarketTotal(marketName);
        const color = COLORS[index % COLORS.length];
        const marketCode = marketsInfo[marketName]?.code;

        return (
            <Paper elevation={0} sx={{
                borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
            }}>
                {/* Market Header */}
                <Box sx={{
                    px: 3, py: 2, backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: 2,
                            backgroundColor: `${color}15`, color: color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700
                        }}>
                            {marketCode || marketName.charAt(0)}
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', lineHeight: 1.2 }}>
                                {marketName}
                            </Typography>
                            {marketCode && (
                                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                    거래처 코드: {marketCode}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Chip
                        label={`총 ${marketTotal.toLocaleString()}개`}
                        size="small"
                        sx={{ backgroundColor: `${color}15`, color: color, fontWeight: 600 }}
                    />
                </Box>

                {/* Chart */}
                <Box sx={{ p: 2 }}>
                    {topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: '#374151' }}
                                    width={80}
                                    tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value.toLocaleString()}개`, '판매량']}
                                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                                />
                                <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                                    {topProducts.map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <Box sx={{ py: 4, textAlign: 'center', color: '#9ca3af' }}>
                            <Inventory sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
                            <Typography variant="body2">데이터가 없습니다</Typography>
                        </Box>
                    )}
                </Box>

                {/* Top Products Table */}
                {topProducts.length > 0 && (
                    <TableContainer sx={{ maxHeight: 250 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& th': { backgroundColor: '#f8fafc', fontWeight: 600, color: '#374151' } }}>
                                    <TableCell>순위</TableCell>
                                    <TableCell>상품명</TableCell>
                                    <TableCell align="right">판매량</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topProducts.map((product, idx) => (
                                    <TableRow key={idx} sx={{
                                        '&:hover': { backgroundColor: '#f8fafc' },
                                        backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa'
                                    }}>
                                        <TableCell>
                                            <Chip
                                                label={idx + 1}
                                                size="small"
                                                sx={{
                                                    minWidth: 28, height: 24,
                                                    backgroundColor: idx < 3 ? COLORS[idx] : '#e2e8f0',
                                                    color: idx < 3 ? 'white' : '#6b7280',
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: '#374151', fontWeight: 500 }}>
                                            {product.name}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: color, fontWeight: 600 }}>
                                            {product.quantity.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        );
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => router.back()}
                        sx={{ mb: 2, color: '#667eea', '&:hover': { backgroundColor: 'rgba(102,126,234,0.04)' } }}
                    >
                        뒤로가기
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            p: 1.5, borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}>
                            <TrendingUp />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#374151' }}>
                                마켓별 판매 분석
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                기간별 마켓 판매 현황을 분석합니다
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Date Selection */}
                <Paper elevation={0} sx={{
                    p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <CalendarToday sx={{ color: '#667eea' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                            기간 설정
                        </Typography>
                    </Box>

                    <Grid container spacing={3} alignItems="center">
                        {/* Quick Select Buttons */}
                        <Grid item xs={12} md={5}>
                            <ToggleButtonGroup
                                value={quickSelect}
                                exclusive
                                onChange={handleQuickSelect}
                                sx={{
                                    width: '100%',
                                    '& .MuiToggleButton-root': {
                                        flex: 1,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.5,
                                        '&.Mui-selected': {
                                            backgroundColor: '#667eea',
                                            color: 'white',
                                            '&:hover': { backgroundColor: '#5a6fd6' }
                                        }
                                    }
                                }}
                            >
                                <ToggleButton value="today">
                                    <Today sx={{ mr: 1, fontSize: 18 }} />
                                    오늘
                                </ToggleButton>
                                <ToggleButton value="week">
                                    <DateRange sx={{ mr: 1, fontSize: 18 }} />
                                    1주일
                                </ToggleButton>
                                <ToggleButton value="month">
                                    <CalendarMonth sx={{ mr: 1, fontSize: 18 }} />
                                    1개월
                                </ToggleButton>
                                <ToggleButton value="custom">
                                    <CalendarToday sx={{ mr: 1, fontSize: 18 }} />
                                    직접선택
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Grid>

                        {/* Date Pickers */}
                        <Grid item xs={12} md={5}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <DatePicker
                                    label="시작일"
                                    value={startDate}
                                    onChange={(newValue) => {
                                        setStartDate(newValue);
                                        setQuickSelect('custom');
                                    }}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            fullWidth: true,
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                                }
                                            }
                                        }
                                    }}
                                />
                                <Typography sx={{ color: '#9ca3af' }}>~</Typography>
                                <DatePicker
                                    label="종료일"
                                    value={endDate}
                                    onChange={(newValue) => {
                                        setEndDate(newValue);
                                        setQuickSelect('custom');
                                    }}
                                    slotProps={{
                                        textField: {
                                            size: 'small',
                                            fullWidth: true,
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                                }
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Refresh Button */}
                        <Grid item xs={12} md={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<Refresh />}
                                onClick={fetchData}
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: 2,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                    }
                                }}
                            >
                                새로고침
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {!dataFetched ? (
                    <Paper elevation={0} sx={{ p: 8, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <BarChartIcon sx={{ fontSize: 64, color: '#e2e8f0', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#9ca3af' }}>
                            데이터가 없습니다
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                            날짜 범위를 조정하거나 새로고침 버튼을 클릭하세요
                        </Typography>
                    </Paper>
                ) : (
                    <>
                        {/* Summary Stats */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    icon={<Store />}
                                    label="총 마켓 수"
                                    value={`${sortedMarketNames.length}개`}
                                    color="#667eea"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    icon={<Inventory />}
                                    label="총 상품 수"
                                    value={`${Object.keys(productTotals).length}개`}
                                    color="#8b5cf6"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    icon={<TrendingUp />}
                                    label="총 판매량"
                                    value={totalQuantity.toLocaleString()}
                                    color="#10b981"
                                    subValue="개"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    icon={<AttachMoney />}
                                    label="총 금액"
                                    value={totalAmount.toLocaleString()}
                                    color="#f59e0b"
                                    subValue="원"
                                />
                            </Grid>
                        </Grid>

                        {/* Market Cards */}
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Store sx={{ color: '#667eea' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                                    마켓별 상위 7개 상품
                                </Typography>
                                <Chip
                                    label={`${sortedMarketNames.length}개 마켓`}
                                    size="small"
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                            </Box>

                            <Grid container spacing={3}>
                                {sortedMarketNames.map((marketName, index) => (
                                    <Grid item xs={12} md={6} key={marketName}>
                                        <MarketCard marketName={marketName} index={index} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {/* Overall Summary Table */}
                        <Paper elevation={0} sx={{
                            borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden'
                        }}>
                            <Box sx={{
                                px: 3, py: 2, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                                display: 'flex', alignItems: 'center', gap: 1
                            }}>
                                <BarChartIcon sx={{ color: '#667eea' }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                                    전체 판매 현황
                                </Typography>
                            </Box>

                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ '& th': { backgroundColor: '#f8fafc', fontWeight: 600, color: '#374151' } }}>
                                            <TableCell>제품명</TableCell>
                                            {sortedMarketNames.map((market) => (
                                                <TableCell key={market} align="right">
                                                    {market}
                                                    {marketsInfo[market]?.code && (
                                                        <Typography variant="caption" sx={{ display: 'block', color: '#9ca3af', fontSize: '0.65rem' }}>
                                                            코드: {marketsInfo[market].code}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            ))}
                                            <TableCell align="right" sx={{ backgroundColor: '#f0f4ff !important', color: '#667eea !important' }}>
                                                총 판매량
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Object.keys(productTotals)
                                            .sort((a, b) => productTotals[b] - productTotals[a])
                                            .map((productName, index) => (
                                                <TableRow key={index} sx={{
                                                    backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                                                    '&:hover': { backgroundColor: '#f0f4ff' }
                                                }}>
                                                    <TableCell sx={{ fontWeight: 500, color: '#374151' }}>
                                                        {productName}
                                                    </TableCell>
                                                    {sortedMarketNames.map((market) => (
                                                        <TableCell key={market} align="right" sx={{ color: '#6b7280' }}>
                                                            {marketData[productName]?.[market]?.toLocaleString() || 0}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#667eea', backgroundColor: '#f0f4ff' }}>
                                                        {productTotals[productName].toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        {/* Total Row */}
                                        <TableRow sx={{ backgroundColor: '#f8fafc', '& td': { fontWeight: 700 } }}>
                                            <TableCell sx={{ color: '#374151' }}>합계</TableCell>
                                            {sortedMarketNames.map((market) => (
                                                <TableCell key={market} align="right" sx={{ color: '#374151' }}>
                                                    {Object.keys(marketData).reduce((sum, product) =>
                                                        sum + (marketData[product][market] || 0), 0
                                                    ).toLocaleString()}
                                                </TableCell>
                                            ))}
                                            <TableCell align="right" sx={{ color: '#667eea', backgroundColor: '#e0e7ff' }}>
                                                {totalQuantity.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default MarketAnalysisPage;
