import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import dayjs from 'dayjs';

const Dashboard = () => {
    const [allLogs, setAllLogs] = useState([]);

    const [weeklyLogs, setWeeklyLogs] = useState([]);
    const [weekRange, setWeekRange] = useState({ start: null, end: null });
    const router = useRouter();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'daily_logs'));
                const logsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: dayjs(doc.data().date)
                }));
                console.log("All logs:", logsData);
                setAllLogs(logsData);

                // 주간 요약 계산
                const today = dayjs();
                const startOfWeek = today.startOf('week');
                const endOfWeek = today.endOf('week');

                setWeekRange({ start: startOfWeek, end: endOfWeek });

                const weeklyLogsData = logsData.filter(log =>
                    log.date.isAfter(startOfWeek) && log.date.isBefore(endOfWeek)
                );

                console.log("Weekly logs:", weeklyLogsData);
                setWeeklyLogs(weeklyLogsData);
            } catch (error) {
                console.error("데이터를 불러오는 중 오류 발생:", error);
            }
        };

        fetchLogs();
    }, []);


    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'daily_logs', id));
            setAllLogs(allLogs.filter(log => log.id !== id));
            alert('업무일지가 삭제되었습니다.');
        } catch (error) {
            console.error('삭제 중 오류 발생:', error);
            alert('삭제 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>대시보드</Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => router.push('work-log/create')}
                style={{ marginBottom: '20px' }}
            >
                새로운 업무일지 작성
            </Button>

            {/* Daily Logs Section */}
            <Typography variant="h5" gutterBottom>모든 업무 일지</Typography>
            <Grid container spacing={3}>
                {allLogs.map((log) => (
                    <Grid item xs={12} key={log.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">
                                    {log.date.format('YYYY-MM-DD')}
                                </Typography>
                                <Typography variant="body2">주요 작업: {log.mainTask}</Typography>
                                <Typography variant="body2">진행 상태: {log.status}</Typography>
                                <Button
                                    variant="outlined"
                                    style={{ marginRight: '10px' }}
                                    onClick={() => router.push(`work-log/detail/${log.id}`)}
                                >
                                    상세보기
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    style={{ marginRight: '10px' }}
                                    onClick={() => router.push(`work-log/edit/${log.id}`)}
                                >
                                    수정
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => handleDelete(log.id)}
                                >
                                    삭제
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Weekly Summary Section */}
            <Typography variant="h5" gutterBottom style={{ marginTop: '40px' }}>
                주간 요약 ({weekRange.start?.format('YYYY-MM-DD')} ~ {weekRange.end?.format('YYYY-MM-DD')})
            </Typography>
            <Grid container spacing={3}>
                {weeklyLogs.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography variant="body1">이번 주에는 데이터가 없습니다. (총 로그 수: {allLogs.length})</Typography>
                    </Grid>
                ) : (
                    weeklyLogs.map((log) => (
                        <Grid item xs={12} key={log.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">
                                        {log.date.format('YYYY-MM-DD')}
                                    </Typography>
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

export default Dashboard;



// 일일 업무일지
// 날짜: 2024년 9월 2일(월요일)
// 작성자: 홍길동
// 부서: 마케팅팀
// 업무 시간

// 시작: 09:00
// 종료: 18:00

// 주요 업무 내용 및 진행 상황

// 신제품 출시 마케팅 계획 수립(진행률: 70 %)

// 주요 타겟 고객층 분석 완료
// 온라인 마케팅 전략 초안 작성 중


// 월간 성과 보고서 작성(진행률: 100 %)

// 8월 마케팅 캠페인 결과 분석 및 보고서 작성 완료
// 팀장님께 검토 요청 드림


// 신규 협력사 미팅(14:00 - 15: 30)

// ABC 광고대행사와 향후 협력 방안 논의
// 후속 미팅 9월 9일로 예정



// 완료된 업무

// 월간 성과 보고서 작성
// 주간 팀 미팅 참석 및 회의록 작성

// 진행 중인 업무

// 신제품 출시 마케팅 계획 수립(마감일: 9월 5일)
// Q4 마케팅 예산 초안 작성(마감일: 9월 10일)

// 내일 계획

// 신제품 마케팅 계획 세부 실행 방안 작성
// Q4 마케팅 예산 초안 작업 진행
// 디자인팀과 신제품 홍보물 관련 미팅(11:00)

// 특이사항 / 문제점

// 신제품 출시일이 1주일 앞당겨져 마케팅 계획 일정 조정 필요

// 자원 사용 현황

// 마케팅 예산 사용률: 78 % (8월 말 기준)

// 요청사항

// Q4 마케팅 예산 관련 재무팀 미팅 요청 드립니다.