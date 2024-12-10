import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Grid, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Box, TextField
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import ExportToExcelButton from './components/ExportToExcelButton';
dayjs.locale('ko');
const DailyReportPage = () => {
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(1, 'month').startOf('month'),
        dayjs().subtract(1, 'month').endOf('month')
    ]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [marketNames, setMarketNames] = useState([]);
    const [totalSummary, setTotalSummary] = useState({});
    const [marketNameMap, setMarketNameMap] = useState({});

    // 마켓 정보를 가져와 UID와 이름을 매핑하는 함수
    const fetchMarketNames = async () => {
        try {
            const marketSnapshot = await getDocs(collection(db, 'markets'));
            const marketMap = {};
            marketSnapshot.forEach(doc => {
                marketMap[doc.id] = doc.data().name; // UID를 이름으로 매핑
            });
            setMarketNameMap(marketMap);
        } catch (error) {
            console.error('마켓 이름 가져오기 오류: ', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const startDate = dateRange[0].format('YYYY-MM-DD');
            const endDate = dateRange[1].format('YYYY-MM-DD');

            const salesQuery = query(
                collection(db, 'daily_summaries'),
                where('updatedAt', '>=', Timestamp.fromDate(dateRange[0].startOf('day').toDate())),
                where('updatedAt', '<=', Timestamp.fromDate(dateRange[1].endOf('day').toDate()))
            );

            const returnsQuery = query(
                collection(db, 'returns'),
                where('receiptDate', '>=', startDate),
                where('receiptDate', '<=', endDate)
            );

            const [salesSnapshot, returnsSnapshot] = await Promise.all([
                getDocs(salesQuery),
                getDocs(returnsQuery)
            ]);

            const salesData = salesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                updatedAt: doc.data().updatedAt.toDate(),
            }));

            const returnsData = returnsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                receiptDate: dayjs(doc.data().receiptDate).toDate(),
                returnMember: marketNameMap[doc.data().returnMember] || doc.data().returnMember // UID를 이름으로 변환
            }));

            processData(salesData, returnsData);
        } catch (error) {
            console.error('데이터 가져오기 오류: ', error);
        } finally {
            setLoading(false);
        }
    };

    const processData = (salesData, returnsData) => {
        const processedData = {};
        const markets = new Set();

        salesData.forEach((doc) => {
            const date = dayjs(doc.updatedAt).format('YYYY-MM-DD');
            if (!processedData[date]) {
                processedData[date] = {};
            }
            if (!processedData[date][doc.marketName]) {
                processedData[date][doc.marketName] = {
                    quantity: 0,
                    amount: 0,
                    returnQuantity: 0,
                    returnAmount: 0
                };
            }

            doc.summary.forEach((item) => {
                processedData[date][doc.marketName].quantity += item.totalQuantity;
                processedData[date][doc.marketName].amount += item.totalPrice;
            });

            markets.add(doc.marketName);
        });

        returnsData.forEach((returnDoc) => {
            const date = dayjs(returnDoc.receiptDate).format('YYYY-MM-DD');
            if (!processedData[date]) {
                processedData[date] = {};
            }
            if (!processedData[date][returnDoc.returnMember]) {
                processedData[date][returnDoc.returnMember] = {
                    quantity: 0,
                    amount: 0,
                    returnQuantity: 0,
                    returnAmount: 0
                };
            }

            processedData[date][returnDoc.returnMember].returnQuantity += returnDoc.returnQuantity;
            processedData[date][returnDoc.returnMember].returnAmount += returnDoc.returnAmount;
            markets.add(returnDoc.returnMember);
        });

        const sortedData = Object.entries(processedData)
            .sort(([dateA], [dateB]) => dayjs(dateB).diff(dayjs(dateA)))
            .map(([date, marketData]) => ({
                date,
                ...marketData
            }));

        const totalSummary = {};
        markets.forEach(market => {
            totalSummary[market] = {
                quantity: 0,
                amount: 0,
                returnQuantity: 0,
                returnAmount: 0
            };
        });

        sortedData.forEach(dayData => {
            markets.forEach(market => {
                if (dayData[market]) {
                    totalSummary[market].quantity += dayData[market].quantity;
                    totalSummary[market].amount += dayData[market].amount;
                    totalSummary[market].returnQuantity += dayData[market].returnQuantity;
                    totalSummary[market].returnAmount += dayData[market].returnAmount;
                }
            });
        });

        setReportData(sortedData);
        setMarketNames([...markets]);
        setTotalSummary(totalSummary);
    };
    const handleDateChange = (newValue) => {
        // null 체크 및 유효한 날짜인지 확인
        if (newValue && newValue[0] && newValue[1] &&
            dayjs(newValue[0]).isValid() && dayjs(newValue[1]).isValid()) {
            setDateRange(newValue);
        } else {
            console.error('Invalid date range selected');
            // 필요하다면 여기에 사용자에게 오류 메시지를 표시하는 로직을 추가할 수 있습니다.
        }
    };

    const handleLastMonthSelect = () => {
        const lastMonth = dayjs().subtract(1, 'month');
        setDateRange([
            lastMonth.startOf('month'),
            lastMonth.endOf('month')
        ]);
    };



    useEffect(() => {
        fetchMarketNames(); // 컴포넌트가 마운트될 때 마켓 이름을 가져옵니다.
    }, [dateRange]);

    // marketNameMap이 로딩된 후, dateRange 변경 시 데이터를 가져옵니다.
    useEffect(() => {
        if (Object.keys(marketNameMap).length > 0) {
            fetchData();
        }
    }, [dateRange, marketNameMap]);
    // *** 변경 코드 끝 ***

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
            <Container maxWidth="lg">
                <Typography variant="h4" gutterBottom align="center" style={{ margin: '20px 0' }}>
                    일자별 판매 및 반품 레포트
                </Typography>
                <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={8}>
                            <DateRangePicker
                                startText="시작 날짜"
                                endText="종료 날짜"
                                value={dateRange}
                                onChange={handleDateChange}
                                renderInput={(startProps, endProps) => (
                                    <>
                                        <TextField {...startProps} fullWidth />
                                        <Box sx={{ mx: 2 }}> ~ </Box>
                                        <TextField {...endProps} fullWidth />
                                    </>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button variant="outlined" color="primary" onClick={handleLastMonthSelect} fullWidth>
                                저번 달 선택
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button variant="contained" color="primary" onClick={fetchData} fullWidth>
                                데이터 갱신
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            {/* 엑셀 다운로드 버튼 추가 */}
                            <ExportToExcelButton
                                totalSummary={totalSummary}
                                reportData={reportData}
                                marketNames={marketNames}
                                dateRange={dateRange}
                            />
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
                                            <TableCell align="right">반품수량</TableCell>
                                            <TableCell align="right">총 판매금액</TableCell>
                                            <TableCell align="right">반품금액</TableCell>
                                            <TableCell align="right">정산금액</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {marketNames.map((market) => (
                                            <TableRow key={market}>
                                                <TableCell>{market}</TableCell>
                                                <TableCell align="right">{totalSummary[market]?.quantity || 0}</TableCell>
                                                <TableCell align="right">{totalSummary[market]?.returnQuantity || 0}</TableCell>
                                                <TableCell align="right">{(totalSummary[market]?.amount || 0).toLocaleString()} 원</TableCell>
                                                <TableCell align="right">{(totalSummary[market]?.returnAmount || 0).toLocaleString()} 원</TableCell>
                                                <TableCell align="right">{((totalSummary[market]?.amount || 0) - (totalSummary[market]?.returnAmount || 0)).toLocaleString()} 원</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell><strong>총계</strong></TableCell>
                                            <TableCell align="right"><strong>
                                                {marketNames.reduce((sum, market) => sum + (totalSummary[market]?.quantity || 0), 0)}
                                            </strong></TableCell>
                                            <TableCell align="right"><strong>
                                                {marketNames.reduce((sum, market) => sum + (totalSummary[market]?.returnQuantity || 0), 0)}
                                            </strong></TableCell>
                                            <TableCell align="right"><strong>
                                                {marketNames.reduce((sum, market) => sum + (totalSummary[market]?.amount || 0), 0).toLocaleString()} 원
                                            </strong></TableCell>
                                            <TableCell align="right"><strong>
                                                {marketNames.reduce((sum, market) => sum + (totalSummary[market]?.returnAmount || 0), 0).toLocaleString()} 원
                                            </strong></TableCell>
                                            <TableCell align="right"><strong>
                                                {marketNames.reduce((sum, market) => sum + (totalSummary[market]?.amount || 0) - (totalSummary[market]?.returnAmount || 0), 0).toLocaleString()} 원
                                            </strong></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>

                        {reportData.map((dayData) => (
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
                                                <TableCell align="right">반품수량</TableCell>
                                                <TableCell align="right">판매금액</TableCell>
                                                <TableCell align="right">반품금액</TableCell>
                                                <TableCell align="right">정산금액</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {marketNames.map((market) => (
                                                <TableRow key={market}>
                                                    <TableCell>{market}</TableCell>
                                                    <TableCell align="right">{dayData[market]?.quantity || 0}</TableCell>
                                                    <TableCell align="right">{dayData[market]?.returnQuantity || 0}</TableCell>
                                                    <TableCell align="right">{(dayData[market]?.amount || 0).toLocaleString()} 원</TableCell>
                                                    <TableCell align="right">{(dayData[market]?.returnAmount || 0).toLocaleString()} 원</TableCell>
                                                    <TableCell align="right">{((dayData[market]?.amount || 0) - (dayData[market]?.returnAmount || 0)).toLocaleString()} 원</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell><strong>총계</strong></TableCell>
                                                <TableCell align="right"><strong>
                                                    {marketNames.reduce((sum, market) => sum + (dayData[market]?.quantity || 0), 0)}
                                                </strong></TableCell>
                                                <TableCell align="right"><strong>
                                                    {marketNames.reduce((sum, market) => sum + (dayData[market]?.returnQuantity || 0), 0)}
                                                </strong></TableCell>
                                                <TableCell align="right"><strong>
                                                    {marketNames.reduce((sum, market) => sum + (dayData[market]?.amount || 0), 0).toLocaleString()} 원
                                                </strong></TableCell>
                                                <TableCell align="right"><strong>
                                                    {marketNames.reduce((sum, market) => sum + (dayData[market]?.returnAmount || 0), 0).toLocaleString()} 원
                                                </strong></TableCell>
                                                <TableCell align="right"><strong>
                                                    {marketNames.reduce((sum, market) => sum + (dayData[market]?.amount || 0) - (dayData[market]?.returnAmount || 0), 0).toLocaleString()} 원
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