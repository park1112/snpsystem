import React, { useState, useEffect } from 'react';
import { TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Select, MenuItem, FormControl, InputLabel, CircularProgress, Chip, Checkbox, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { collection, addDoc, doc, query, where, orderBy, onSnapshot, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import FormattedDate from './FormattedDate';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TodoItemActions from './TodoItemActions';
import { useNotification } from '../NotificationManager';

const StyledListItem = styled(ListItem)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
}));

const getUserDisplayName = (user) => user.name || user.email || '알 수 없는 사용자';

export default function AssignTodo({ currentUser, users }) {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [editingTodo, setEditingTodo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showOlderTodos, setShowOlderTodos] = useState(false);
    const { createNotification } = useNotification();

    useEffect(() => {
        if (currentUser && currentUser.uid) {
            const unsubscribe = subscribeToTodos();
            return () => unsubscribe();
        }
    }, [currentUser]);

    const subscribeToTodos = () => {
        if (!currentUser || !currentUser.uid) {
            setError("사용자 정보가 유효하지 않습니다.");
            return () => { };
        }
        setIsLoading(true);
        setError(null);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const q = query(
            collection(db, 'assignedTodos'),
            where('requestedBy', '==', currentUser.uid),
            where('createdAt', '>', oneWeekAgo),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedTodos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTodos(fetchedTodos);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching todos:", err);
            setError("할 일을 불러오는 데 실패했습니다.");
            setIsLoading(false);
        });

        return unsubscribe;
    };

    const addTodo = async () => {
        if (newTodo.trim() === '' || !selectedUser || isLoading || !currentUser || !currentUser.uid) return;
        setIsLoading(true);
        setError(null);
        try {
            const assignedUser = users.find(user => user.uid === selectedUser);
            const todoRef = await addDoc(collection(db, 'assignedTodos'), {
                title: newTodo,
                assignedTo: selectedUser,
                assignedToName: getUserDisplayName(assignedUser),
                requestedBy: currentUser.uid,
                requestedByName: getUserDisplayName(currentUser),
                completed: false,
                createdAt: Timestamp.fromDate(new Date()),
                completedAt: null
            });

            await createNotification(selectedUser, {
                title: '새로운 할 일이 할당되었습니다',
                description: `${getUserDisplayName(currentUser)}님이 새로운 할 일을 할당했습니다: ${newTodo}`,
                type: 'todo_assigned',
                todoId: todoRef.id
            });

            setNewTodo('');
            setSelectedUser('');
        } catch (err) {
            console.error("Error adding todo:", err);
            setError("할 일 추가에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTodo = async (todoId) => {
        if (!currentUser || !currentUser.uid || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            const todoRef = doc(db, 'assignedTodos', todoId);
            await deleteDoc(todoRef);
        } catch (err) {
            console.error("Error deleting todo:", err);
            setError("할 일 삭제에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = (todo) => {
        setEditingTodo(todo);
    };

    const saveEdit = async () => {
        if (!editingTodo || !currentUser || !currentUser.uid || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            const todoRef = doc(db, 'assignedTodos', editingTodo.id);
            const assignedUser = users.find(user => user.uid === editingTodo.assignedTo);
            await updateDoc(todoRef, {
                title: editingTodo.title,
                assignedTo: editingTodo.assignedTo,
                assignedToName: getUserDisplayName(assignedUser)
            });
            setEditingTodo(null);
        } catch (err) {
            console.error("Error saving edit:", err);
            setError("할 일 수정에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTodo = async (todo) => {
        if (!currentUser || !currentUser.uid || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            const todoRef = doc(db, 'assignedTodos', todo.id);
            const newStatus = !todo.completed;
            await updateDoc(todoRef, {
                completed: newStatus,
                completedAt: newStatus ? Timestamp.fromDate(new Date()) : null
            });
        } catch (err) {
            console.error("Error toggling todo:", err);
            setError("할 일 상태 변경에 실패했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const groupTodosByDate = (todos) => {
        const grouped = {};
        todos.forEach(todo => {
            const date = todo.completedAt ? todo.completedAt.toDate() : 'Incomplete';
            const dateKey = date === 'Incomplete' ? date : date.toDateString();
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(todo);
        });
        return grouped;
    };

    const renderTodoItem = (todo) => (
        <StyledListItem key={todo.id} dense>
            <Checkbox
                edge="start"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
                disabled={isLoading}
            />
            {editingTodo && editingTodo.id === todo.id ? (
                <>
                    <TextField
                        fullWidth
                        value={editingTodo.title}
                        onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                        sx={{ mr: 2 }}
                    />
                    <Select
                        value={editingTodo.assignedTo}
                        onChange={(e) => setEditingTodo({ ...editingTodo, assignedTo: e.target.value })}
                        sx={{ mr: 2 }}
                    >
                        {users.map((user) => (
                            <MenuItem key={user.uid} value={user.uid}>{getUserDisplayName(user)}</MenuItem>
                        ))}
                    </Select>
                    <Button onClick={saveEdit}>저장</Button>
                </>
            ) : (
                <ListItemText
                    primary={
                        <Typography
                            variant="body1"
                            style={{
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? 'text.secondary' : 'text.primary',
                            }}
                        >
                            {todo.title}
                            {todo.completed && (
                                <Chip
                                    icon={<CheckCircleOutlineIcon />}
                                    label="완료"
                                    color="success"
                                    size="small"
                                    sx={{ ml: 1 }}
                                />
                            )}
                        </Typography>
                    }
                    secondary={
                        <Typography variant="caption">
                            할당: {todo.assignedToName} |
                            생성: <FormattedDate date={todo.createdAt.toDate()} showTime={false} />
                            {todo.completed && ` | 완료: `}
                            {todo.completed && <FormattedDate date={todo.completedAt.toDate()} showTime={false} />}
                        </Typography>
                    }
                />
            )}
            <TodoItemActions
                onEdit={() => startEditing(todo)}
                onDelete={() => deleteTodo(todo.id)}
                disableEdit={todo.completed}
                loading={isLoading}
            />
        </StyledListItem>
    );

    const renderGroupedTodos = () => {
        const groupedTodos = groupTodosByDate(todos);
        const sortedDates = Object.keys(groupedTodos).sort((a, b) => {
            if (a === 'Incomplete') return -1;
            if (b === 'Incomplete') return 1;
            return new Date(b) - new Date(a);
        });

        return sortedDates.map(date => (
            <Accordion key={date}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                        {date === 'Incomplete' ? '미완료' : <FormattedDate date={new Date(date)} showTime={false} />}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {groupedTodos[date].map(renderTodoItem)}
                    </List>
                </AccordionDetails>
            </Accordion>
        ));
    };

    const loadOlderTodos = async () => {
        // Implement loading of todos older than a week
        // This would involve creating a new query with a different date range
        // and appending the results to the existing todos
    };

    if (!currentUser || !currentUser.uid) {
        return <Typography>사용자 정보를 불러오는 중입니다...</Typography>;
    }

    return (
        <div>
            <Typography variant="h5" gutterBottom>할 일 할당</Typography>
            {error && <Typography color="error">{error}</Typography>}
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>할당할 유저</InputLabel>
                <Select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    disabled={isLoading}
                >
                    {users.map((user) => (
                        <MenuItem key={user.uid} value={user.uid}>{getUserDisplayName(user)}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                fullWidth
                variant="outlined"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="새 할 일 입력"
                sx={{ mb: 2 }}
                disabled={isLoading}
            />
            <Button
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={24} /> : <AddIcon />}
                onClick={addTodo}
                fullWidth
                sx={{ mb: 2 }}
                disabled={isLoading || !selectedUser}
            >
                {isLoading ? '추가 중...' : '할 일 추가'}
            </Button>
            {isLoading ? (
                <CircularProgress />
            ) : (
                <>
                    <List>
                        {todos.filter(todo => !todo.completed).map(renderTodoItem)}
                    </List>
                    {renderGroupedTodos()}
                    {!showOlderTodos && (
                        <Button onClick={() => setShowOlderTodos(true)}>
                            더 오래된 할 일 보기
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}