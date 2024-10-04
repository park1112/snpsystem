import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import dayjs from 'dayjs';

const WeeklySummary = () => {
    const [weeklyLogs, setWeeklyLogs] = useState([]);
    const [weekStart, setWeekStart] = useState(dayjs().startOf('week').format('YYYY-MM-DD'));
    const [weekEnd, setWeekEnd] = useState(dayjs().endOf('week').format('YYYY-MM-DD'));

    useEffect(() => {
        const fetchWeeklyLogs = async () => {
            try {
                const startOfWeek = dayjs().startOf('week').toDate();
                const endOfWeek = dayjs().endOf('week').toDate();

                console.log('Start of week:', startOfWeek);  // 로그 추가
                console.log('End of week:', endOfWeek);  // 로그 추가

                const q = query(
                    collection(db, 'daily_logs'),
                    where('date', '>=', startOfWeek),
                    where('date', '<=', endOfWeek)
                );

                const querySnapshot = await getDocs(q);

                console.log('Query Snapshot Size:', querySnapshot.size);  // 로그 추가

                const logsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log('Weekly Logs Data:', logsData);  // 로그 추가
                setWeeklyLogs(logsData);
            } catch (error) {
                console.error("주간 데이터를 불러오는 중 오류 발생:", error);
            }
        };

        fetchWeeklyLogs();
    }, []);

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>주간 요약 ({weekStart} - {weekEnd})</Typography>
            <Grid container spacing={3}>
                {weeklyLogs.length === 0 ? (
                    <Typography variant="body1">이번 주에는 데이터가 없습니다.</Typography>
                ) : (
                    weeklyLogs.map((log) => (
                        <Grid item xs={12} key={log.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{log.date}</Typography>
                                    <Typography variant="body2">주요 작업: {log.mainTask}</Typography>
                                    <Typography variant="body2">진행 상태: {log.status}</Typography>
                                    <Typography variant="body2">소요 시간: {log.timeSpent || 'N/A'}</Typography>
                                    <Typography variant="body2">카테고리: {log.category || 'N/A'}</Typography>
                                    <Typography variant="body2">메모: {log.note || 'N/A'}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
};

export default WeeklySummary;
