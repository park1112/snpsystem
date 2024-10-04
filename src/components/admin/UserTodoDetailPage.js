import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Typography, Box, Card, CardContent, Grid, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import FormattedDate from '../todo/FormattedDate';

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

const UserTodoDetailPage = () => {
    const router = useRouter();
    const { id: userId } = router.query;
    const [user, setUser] = useState(null);
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchUserAndTodos();
        }
    }, [userId]);

    const fetchUserAndTodos = async () => {
        try {
            setLoading(true);
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
                throw new Error('사용자를 찾을 수 없습니다');
            }
            setUser({ id: userDocSnap.id, ...userDocSnap.data() });

            const personalTodosQuery = query(
                collection(db, 'users', userId, 'todos'),
                orderBy('createdAt', 'desc')
            );
            const assignedTodosQuery = query(
                collection(db, 'assignedTodos'),
                where('assignedTo', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const [personalTodosSnapshot, assignedTodosSnapshot] = await Promise.all([
                getDocs(personalTodosQuery),
                getDocs(assignedTodosQuery)
            ]);
            const personalTodos = personalTodosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'personal' }));
            const assignedTodos = assignedTodosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'assigned' }));

            const allTodos = [...personalTodos, ...assignedTodos].sort((a, b) => b.createdAt - a.createdAt);
            setTodos(allTodos);
            setLoading(false);
        } catch (err) {
            console.error("사용자 및 할 일 목록 가져오기 오류:", err);
            setError("사용자 및 할 일 목록을 가져오는데 실패했습니다. 다시 시도해 주세요.");
            setLoading(false);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (!user) {
        return <Typography>사용자를 찾을 수 없습니다</Typography>;
    }

    const completedTodos = todos.filter(todo => todo.completed);
    const completionRate = todos.length > 0 ? (completedTodos.length / todos.length * 100).toFixed(2) : 0;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {user.name || user.email}의 할 일 목록 보고서
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>사용자 정보</Typography>
                            <Typography>이메일: {user.email}</Typography>
                            <Typography>가입일: <FormattedDate date={user.createdAt} /></Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <StyledCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>할 일 통계</Typography>
                            <Typography>전체 할 일: {todos.length}</Typography>
                            <Typography>완료된 할 일: {completedTodos.length}</Typography>
                            <Typography>완료율: {completionRate}%</Typography>
                        </CardContent>
                    </StyledCard>
                </Grid>
            </Grid>
            <StyledCard>
                <CardContent>
                    <Typography variant="h6" gutterBottom>할 일 목록</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>제목</StyledTableCell>
                                    <StyledTableCell>상태</StyledTableCell>
                                    <StyledTableCell>생성일</StyledTableCell>
                                    <StyledTableCell>완료일</StyledTableCell>
                                    <StyledTableCell>유형</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <br />
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
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </StyledCard>
        </Box>
    );
};

export default UserTodoDetailPage;