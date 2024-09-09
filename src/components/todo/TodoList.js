import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import { db } from '../../utils/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Typography, ListItem, ListItemText, ListItemSecondaryAction, CardContent, IconButton, Card, Checkbox, List, Grid, TextField, Container, CircularProgress, Chip, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WeeklyCommonGoals from './WeeklyCommonGoals';
import AssignTodo from './AssignTodo';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TodoItemActions from './TodoItemActions';
import FormattedDate from './FormattedDate';

const StyledListItem = styled(ListItem)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
}));

export default function TodoList() {
    const { user } = useUser();
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [editingTodoId, setEditingTodoId] = useState(null);
    const [editingTodoTitle, setEditingTodoTitle] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showOlderTodos, setShowOlderTodos] = useState(false);

    useEffect(() => {
        if (user && user.uid) {
            fetchAllUsers();
            subscribeToTodos();
        }
        return () => {
            // Unsubscribe from the listener when the component unmounts
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);

    let unsubscribe = null;

    const fetchAllUsers = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            setAllUsers(usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching all users:", error);
            setError("Failed to fetch users. Please try again.");
        }
    };

    const subscribeToTodos = () => {
        if (!user || !user.uid) {
            setError("User information is not available.");
            return;
        }
        setIsLoading(true);
        setError(null);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const personalTodosQuery = query(
            collection(db, 'users', user.uid, 'todos'),
            where('createdAt', '>', oneWeekAgo),
            orderBy('createdAt', 'desc')
        );
        const assignedTodosQuery = query(
            collection(db, 'assignedTodos'),
            where('assignedTo', '==', user.uid),
            where('createdAt', '>', oneWeekAgo),
            orderBy('createdAt', 'desc')
        );

        const unsubscribePersonal = onSnapshot(personalTodosQuery, (snapshot) => {
            const personalTodos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'personal' }));
            updateTodos(personalTodos, 'personal');
        });

        const unsubscribeAssigned = onSnapshot(assignedTodosQuery, (snapshot) => {
            const assignedTodos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'assigned' }));
            updateTodos(assignedTodos, 'assigned');
        });

        unsubscribe = () => {
            unsubscribePersonal();
            unsubscribeAssigned();
        };

        setIsLoading(false);
    };

    const updateTodos = (newTodos, type) => {
        setTodos(prevTodos => {
            const updatedTodos = prevTodos.filter(todo => todo.type !== type);
            return [...updatedTodos, ...newTodos].sort((a, b) => b.createdAt - a.createdAt);
        });
    };

    const addTodo = async () => {
        if (newTodo.trim() === '' || !user || !user.uid || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            await addDoc(collection(db, 'users', user.uid, 'todos'), {
                title: newTodo,
                completed: false,
                createdAt: new Date(),
                completedAt: null
            });
            setNewTodo('');
        } catch (error) {
            console.error("Error adding todo:", error);
            setError("Failed to add todo. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTodo = async (todo) => {
        if (!user || !user.uid || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            let todoRef;
            if (todo.type === 'personal') {
                todoRef = doc(db, 'users', user.uid, 'todos', todo.id);
            } else {
                todoRef = doc(db, 'assignedTodos', todo.id);
            }
            const newStatus = !todo.completed;
            await updateDoc(todoRef, {
                completed: newStatus,
                completedAt: newStatus ? new Date() : null
            });
        } catch (error) {
            console.error("Error toggling todo:", error);
            setError("Failed to update todo status. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTodo = async (todo) => {
        if (!user || !user.uid || isLoading || todo.type === 'assigned') return;
        setIsLoading(true);
        setError(null);
        try {
            const todoRef = doc(db, 'users', user.uid, 'todos', todo.id);
            await deleteDoc(todoRef);
        } catch (error) {
            console.error("Error deleting todo:", error);
            setError("Failed to delete todo. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = useCallback((todo) => {
        if (todo.type === 'assigned') return;
        setEditingTodoId(todo.id);
        setEditingTodoTitle(todo.title);
    }, []);

    const cancelEditing = useCallback(() => {
        setEditingTodoId(null);
        setEditingTodoTitle('');
    }, []);

    const saveEdit = useCallback(async () => {
        if (!editingTodoId || !user || !user.uid || isLoading) return;
        setIsLoading(true);
        setError(null);
        try {
            const todoRef = doc(db, 'users', user.uid, 'todos', editingTodoId);
            await updateDoc(todoRef, {
                title: editingTodoTitle
            });
            setEditingTodoId(null);
            setEditingTodoTitle('');
        } catch (error) {
            console.error("Error saving edit:", error);
            setError("Failed to save changes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [editingTodoId, editingTodoTitle, user, isLoading]);

    const handleEditChange = useCallback((e) => {
        setEditingTodoTitle(e.target.value);
    }, []);

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
            />
            {editingTodoId === todo.id ? (
                <TextField
                    fullWidth
                    value={editingTodoTitle}
                    onChange={handleEditChange}
                    onBlur={saveEdit}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEditing();
                    }}
                    autoFocus
                />
            ) : (
                <ListItemText
                    primary={
                        <Typography
                            variant="h6"
                            style={{
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                color: todo.completed ? 'text.secondary' : 'text.primary',
                            }}
                        >
                            {todo.title}
                            {todo.completed && todo.type === 'assigned' && (
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
                            {todo.type === 'assigned' ? `할당자: ${todo.requestedByName} | ` : ''}
                            생성: <FormattedDate date={todo.createdAt.toDate()} showTime={false} />
                            {todo.completed && ` | 완료: `}
                            {todo.completed && <FormattedDate date={todo.completedAt.toDate()} showTime={false} />}
                        </Typography>
                    }
                />
            )}
            {todo.type === 'personal' && (
                <TodoItemActions
                    onEdit={() => startEditing(todo)}
                    onSave={saveEdit}
                    onDelete={() => deleteTodo(todo)}
                    onCancelEdit={cancelEditing}
                    isEditing={editingTodoId === todo.id}
                    disableEdit={todo.completed}
                    loading={isLoading}
                />
            )}
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
            date !== 'Incomplete' && (
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
            )
        ));
    };

    const loadOlderTodos = async () => {
        // Implement loading of todos older than a week
        // This would involve creating a new query with a different date range
        // and appending the results to the existing todos
    };

    if (!user || !user.uid) {
        return <Typography>Loading user information...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h4" component="h1" gutterBottom>
                                오늘 할일 (목표) Check List
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                value={newTodo}
                                onChange={(e) => setNewTodo(e.target.value)}
                                disabled={isLoading}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={addTodo} disabled={isLoading || !newTodo.trim()}>
                                            {isLoading ? <CircularProgress size={24} /> : <AddIcon />}
                                        </IconButton>
                                    ),
                                }}
                            />
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
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <WeeklyCommonGoals user={user} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <AssignTodo currentUser={user} users={allUsers} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}