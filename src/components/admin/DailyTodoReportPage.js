import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Typography, Box, Card, CardContent, Grid, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, TextField, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormattedDate from '../todo/FormattedDate';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import generateTodoReportPDF from './generateTodoReportPDF';



const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DailyTodoReportPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [userTodos, setUserTodos] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const overallChartRef = useRef(null);
    const userChartRef = useRef(null);

    useEffect(() => {
        if (selectedDate) {
            fetchTodos(selectedDate);
        }
    }, [selectedDate]);

    const calculateOverallCompletionRate = (userTodos) => {
        const allTodos = Object.values(userTodos).flat();
        const completedTodos = allTodos.filter(todo => todo.completed);
        return allTodos.length > 0 ? (completedTodos.length / allTodos.length) * 100 : 0;
    };

    const fetchTodos = async (date) => {
        setLoading(true);
        setError(null);
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Fetch all users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const users = usersSnapshot.docs.reduce((acc, doc) => {
                acc[doc.id] = { id: doc.id, ...doc.data() };
                return acc;
            }, {});

            // Fetch personal todos
            const personalTodosPromises = Object.keys(users).map(async (userId) => {
                const userTodosQuery = query(
                    collection(db, 'users', userId, 'todos'),
                    where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
                    where('createdAt', '<=', Timestamp.fromDate(endOfDay))
                );
                const userTodosSnapshot = await getDocs(userTodosQuery);
                return userTodosSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    type: 'personal',
                    userId: userId
                }));
            });

            const personalTodos = (await Promise.all(personalTodosPromises)).flat();

            // Fetch assigned todos
            const assignedTodosQuery = query(
                collection(db, 'assignedTodos'),
                where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
                where('createdAt', '<=', Timestamp.fromDate(endOfDay))
            );
            const assignedTodosSnapshot = await getDocs(assignedTodosQuery);
            const assignedTodos = assignedTodosSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'assigned'
            }));

            // Organize todos by user
            const organizedTodos = [...personalTodos, ...assignedTodos].reduce((acc, todo) => {
                const userId = todo.type === 'personal' ? todo.userId : todo.assignedTo;
                if (!acc[userId]) {
                    acc[userId] = [];
                }
                acc[userId].push({
                    ...todo,
                    userName: users[userId]?.name || users[userId]?.email || 'Unknown User',
                    assignedByName: todo.type === 'assigned' ? (users[todo.requestedBy]?.name || users[todo.requestedBy]?.email || 'Unknown User') : null
                });
                return acc;
            }, {});

            setUserTodos(organizedTodos);
        } catch (err) {
            console.error("할 일 목록 가져오기 오류:", err);
            setError("할 일 목록을 가져오는데 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = async () => {
        // 차트 이미지 생성
        const overallChartImage = await html2canvas(overallChartRef.current);
        const userChartImage = await html2canvas(userChartRef.current);

        const pdfData = {
            date: selectedDate,
            overallStats,
            userTodos,
            overallChartUrl: overallChartImage.toDataURL(),
            userChartUrl: userChartImage.toDataURL()
        };

        await generateTodoReportPDF(pdfData);
    };


    const renderTodoTable = (todos) => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>제목</StyledTableCell>
                        <StyledTableCell>상태</StyledTableCell>
                        <StyledTableCell>생성일</StyledTableCell>
                        <StyledTableCell>완료일</StyledTableCell>
                        <StyledTableCell>유형</StyledTableCell>
                        <StyledTableCell>할당자</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {todos.map((todo) => (
                        <StyledTableRow key={todo.id}>
                            <TableCell>{todo.title}</TableCell>
                            <TableCell>
                                <Chip
                                    label={todo.completed ? "완료" : "미완료"}
                                    color={todo.completed ? "success" : "warning"}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell><FormattedDate date={todo.createdAt} /></TableCell>
                            <TableCell>
                                {todo.completed ? <FormattedDate date={todo.completedAt} /> : '-'}
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={todo.type === 'personal' ? "개인" : "할당됨"}
                                    color={todo.type === 'personal' ? "primary" : "secondary"}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>{todo.type === 'assigned' ? todo.assignedByName : '-'}</TableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
    const calculateCompletionRate = (todos) => {
        const completedTodos = todos.filter(todo => todo.completed).length;
        return todos.length > 0 ? (completedTodos / todos.length) * 100 : 0;
    };
    const renderOverallCompletionChart = () => {
        const allTodos = Object.values(userTodos).flat();
        const completedTodos = allTodos.filter(todo => todo.completed).length;
        const incompleteTodos = allTodos.length - completedTodos;

        const data = [
            { name: '완료', value: completedTodos },
            { name: '미완료', value: incompleteTodos },
        ];

        return (
            <div ref={overallChartRef}>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const renderUserCompletionChart = () => {
        const data = Object.entries(userTodos).map(([userId, todos]) => ({
            name: todos[0].userName,
            completionRate: calculateCompletionRate(todos),
        }));

        return (
            <div ref={userChartRef}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completionRate" fill="#8884d8" name="완료율 (%)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        );
    };

    const overallStats = {
        totalUsers: Object.keys(userTodos).length,
        totalTodos: Object.values(userTodos).flat().length,
        completedTodos: Object.values(userTodos).flat().filter(todo => todo.completed).length,
        overallCompletionRate: calculateOverallCompletionRate(userTodos),
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                전체 사용자 할 일 보고서
            </Typography>

            <TextField
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                sx={{ mb: 2 }}
            />
            {!loading && !error && (
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={handleGeneratePDF}>
                        PDF 다운로드
                    </Button>
                </Box>
            )}
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <>
                    <Grid container spacing={3}>
                        <Grid item xs={12} >
                            <StyledCard>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>전체 통계</Typography>
                                    <Typography>총 사용자 수: {overallStats.totalUsers}</Typography>
                                    <Typography>총 할 일 수: {overallStats.totalTodos}</Typography>
                                    <Typography>완료된 할 일 수: {overallStats.completedTodos}</Typography>
                                    <Typography>전체 완료율: {overallStats.overallCompletionRate.toFixed(2)}%</Typography>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>전체 완료율</Typography>
                                    {renderOverallCompletionChart()}
                                </CardContent>
                            </StyledCard>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <StyledCard>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>사용자별 완료율</Typography>
                                    {renderUserCompletionChart()}
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    </Grid>
                    {Object.entries(userTodos).map(([userId, todos]) => (
                        <Accordion key={userId}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>{todos[0].userName} - 할 일 {todos.length}개 (완료율: {calculateCompletionRate(todos).toFixed(2)}%)</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {renderTodoTable(todos)}
                            </AccordionDetails>
                        </Accordion>
                    ))}

                </>
            )}
        </Box>
    );
};

export default DailyTodoReportPage;