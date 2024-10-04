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
    TextField
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import dayjs from 'dayjs';

const DailyReportPage = () => {
    const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [marketNames, setMarketNames] = useState([]);
    const [totalSummary, setTotalSummary] = useState({});

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
        } catch (error) {
            console.error('데이터 가져오기 오류: ', error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (fetchedData) => {
        const processedData = {};
        const markets = new Set();

        fetchedData.forEach((doc) => {
            const date = dayjs(doc.updatedAt).format('YYYY-MM-DD');
            if (!processedData[date]) {
                processedData[date] = {};
            }
            if (!processedData[date][doc.marketName]) {
                processedData[date][doc.marketName] = { quantity: 0, amount: 0 };
            }

            doc.summary.forEach((item) => {
                processedData[date][doc.marketName].quantity += item.totalQuantity;
                processedData[date][doc.marketName].amount += item.totalPrice; // totalAmount를 totalPrice로 변경
            });

            markets.add(doc.marketName);
        });

        const sortedData = Object.entries(processedData)
            .sort(([dateA], [dateB]) => dayjs(dateB).diff(dayjs(dateA)))
            .map(([date, marketData]) => ({
                date,
                ...marketData
            }));

        const totalSummary = {};
        markets.forEach(market => {
            totalSummary[market] = { quantity: 0, amount: 0 };
        });

        sortedData.forEach(dayData => {
            markets.forEach(market => {
                if (dayData[market]) {
                    totalSummary[market].quantity += dayData[market].quantity;
                    totalSummary[market].amount += dayData[market].amount;
                }
            });
        });

        setReportData(sortedData);
        setMarketNames([...markets]);
        setTotalSummary(totalSummary);
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom align="center" style={{ margin: '20px 0' }}>
                    일자별 판매 레포트
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
                ) : reportData.length === 0 ? (
                    <Typography align="center">데이터가 없습니다. 날짜 범위를 다시 설정하세요.</Typography>
                ) : (
                    <>
                        <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                            <Typography variant="h6" gutterBottom>
                                총 요약 ({dateRange[0].format('YYYY-MM-DD')} ~ {dateRange[1].format('YYYY-MM-DD')})
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>마켓</TableCell>
                                            <TableCell align="right">총 판매수량</TableCell>
                                            <TableCell align="right">총 판매금액</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {marketNames.map((market) => (
                                            <TableRow key={market}>
                                                <TableCell>{market}</TableCell>
                                                <TableCell align="right">{totalSummary[market]?.quantity || 0}</TableCell>
                                                <TableCell align="right">{(totalSummary[market]?.amount || 0).toLocaleString()} 원</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell><strong>총계</strong></TableCell>
                                            <TableCell align="right"><strong>
                                                {marketNames.reduce((sum, market) => sum + (totalSummary[market]?.quantity || 0), 0)}
                                            </strong></TableCell>
                                            <TableCell align="right"><strong>
                                                {marketNames.reduce((sum, market) => sum + (totalSummary[market]?.amount || 0), 0).toLocaleString()} 원
                                            </strong></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>

                        {reportData.map((dayData, index) => (
                            <Paper key={dayData.date} elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                                <Typography variant="h6" gutterBottom>
                                    {dayjs(dayData.date).format('YYYY년 MM월 DD일')}
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>마켓</TableCell>
                                                <TableCell align="right">판매수량</TableCell>
                                                <TableCell align="right">판매금액</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {marketNames.map((market) => (
                                                <TableRow key={market}>
                                                    <TableCell>{market}</TableCell>
                                                    <TableCell align="right">{dayData[market]?.quantity || 0}</TableCell>
                                                    <TableCell align="right">{(dayData[market]?.amount || 0).toLocaleString()} 원</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell><strong>총계</strong></TableCell>
                                                <TableCell align="right"><strong>
                                                    {marketNames.reduce((sum, market) => sum + (dayData[market]?.quantity || 0), 0)}
                                                </strong></TableCell>
                                                <TableCell align="right"><strong>
                                                    {marketNames.reduce((sum, market) => sum + (dayData[market]?.amount || 0), 0).toLocaleString()} 원
                                                </strong></TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        ))}
                    </>
                )}
            </Container>
        </LocalizationProvider>
    );
};

export default DailyReportPage;