import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/router';
import FormattedDate from '../todo/FormattedDate';

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
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const UserTodoListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const usersWithTodos = await Promise.all(usersData.map(async (user) => {
                const todosQuery = query(collection(db, 'users', user.id, 'todos'));
                const todosSnapshot = await getDocs(todosQuery);
                const todos = todosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const completedTodos = todos.filter(todo => todo.completed);
                const latestTodo = todos.sort((a, b) => b.createdAt - a.createdAt)[0];

                return {
                    ...user,
                    totalTodos: todos.length,
                    completedTodos: completedTodos.length,
                    latestTodo: latestTodo
                };
            }));

            setUsers(usersWithTodos);
            setLoading(false);
        } catch (err) {
            console.error("사용자 및 할 일 목록 가져오기 오류:", err);
            setError("사용자 및 할 일 목록을 가져오는데 실패했습니다. 다시 시도해 주세요.");
            setLoading(false);
        }
    };

    if (loading) {
        return <Typography>로딩 중...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <TableContainer component={Paper}>
            <Typography variant="h4" gutterBottom component="div" sx={{ p: 2 }}>
                사용자 할 일 목록
            </Typography>
            <Table sx={{ minWidth: 650 }} aria-label="사용자 할 일 목록">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>사용자 이름</StyledTableCell>
                        <StyledTableCell>이메일</StyledTableCell>
                        <StyledTableCell>가입일</StyledTableCell>
                        <StyledTableCell>전체 할 일</StyledTableCell>
                        <StyledTableCell>완료된 할 일</StyledTableCell>
                        <StyledTableCell>최근 할 일</StyledTableCell>
                    </TableRow>
                </TableHead>
                <br />
                <TableBody>
                    {users.map((user) => (
                        <StyledTableRow key={user.id}>
                            <TableCell component="th" scope="row">
                                <Link href={`/admin/todo/${user.id}`} passHref>
                                    <a style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {user.name || '미설정'}
                                    </a>
                                </Link>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                <FormattedDate date={user.createdAt} />
                            </TableCell>
                            <TableCell>{user.totalTodos}</TableCell>
                            <TableCell>{user.completedTodos}</TableCell>
                            <TableCell>
                                {user.latestTodo ? (
                                    <>
                                        {user.latestTodo.title} (
                                        <FormattedDate date={user.latestTodo.createdAt} />)
                                    </>
                                ) : '없음'}
                            </TableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UserTodoListPage;