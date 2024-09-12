import React, { useState, useEffect } from 'react';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Card, CardHeader, CardContent, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const DailyAggregateViewer = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [aggregateDate, setAggregateDate] = useState('');
    const [dailyAggregates, setDailyAggregates] = useState([]);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);
    const handleDateChange = (event) => setAggregateDate(event.target.value);

    const fetchDailyAggregates = async () => {
        if (!aggregateDate) return;

        const q = query(
            collection(db, 'daily_aggregates'),
            where('date', '==', aggregateDate),
            orderBy('marketId')
        );

        const querySnapshot = await getDocs(q);
        const aggregates = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        setDailyAggregates(aggregates);
    };

    const calculateTotalQuantity = (data) => data.reduce((total, item) => total + (parseInt(item.박스수량) || 0), 0);

    return (
        <>
            <Button onClick={handleOpenDialog} variant="contained" color="secondary">
                날짜별 집계 조회
            </Button>
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>날짜별 집계 조회</DialogTitle>
                <DialogContent>
                    <TextField
                        type="date"
                        value={aggregateDate}
                        onChange={handleDateChange}
                        fullWidth
                        margin="normal"
                    />
                    <Button onClick={fetchDailyAggregates} variant="contained" color="primary">
                        조회
                    </Button>
                    {dailyAggregates.map((aggregate, index) => (
                        <Card key={index} style={{ marginTop: '1rem' }}>
                            <CardHeader title={`마켓 ID: ${aggregate.marketId}`} />
                            <CardContent>
                                <Typography>총 데이터 수: {aggregate.data.length}</Typography>
                                <Typography>총 출고 수량: {calculateTotalQuantity(aggregate.data)}</Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>상품명</TableCell>
                                                <TableCell align="right">수량</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {aggregate.data.map((item, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{item.matchedProduct?.deliveryProductName || '알 수 없음'}</TableCell>
                                                    <TableCell align="right">{item.박스수량 || 0}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>닫기</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DailyAggregateViewer;