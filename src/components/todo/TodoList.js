// components/todo/TodoList.js
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import { db } from '../../utils/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { Typography, ListItem, ListItemText, ListItemSecondaryAction, CardContent, IconButton, Card, Checkbox, List, Grid, TextField, Container, CircularProgress, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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


    useEffect(() => {
        if (user && user.uid) {
            fetchTodos();
            fetchAllUsers();
        }
    }, [user]);

    useEffect(() => {
        console.log('Current editingTodoId:', editingTodoId);
        console.log('Current editingTodoTitle:', editingTodoTitle);
    }, [editingTodoId, editingTodoTitle]);


    const fetchAllUsers = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            setAllUsers(usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching all users:", error);
            setError("Failed to fetch users. Please try again.");
        }
    };

    const fetchTodos = async () => {
        if (!user || !user.uid) {
            setError("User information is not available.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const personalTodosQuery = query(
                collection(db, 'users', user.uid, 'todos'),
                orderBy('createdAt', 'desc')
            );
            const assignedTodosQuery = query(
                collection(db, 'assignedTodos'),
                where('assignedTo', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
            const [personalSnapshot, assignedSnapshot] = await Promise.all([
                getDocs(personalTodosQuery),
                getDocs(assignedTodosQuery)
            ]);
            const personalTodos = personalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'personal' }));
            const assignedTodos = assignedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'assigned' }));
            setTodos([...personalTodos, ...assignedTodos].sort((a, b) => b.createdAt - a.createdAt));
        } catch (error) {
            console.error("Error fetching todos:", error);
            setError("Failed to fetch todos. Please try again.");
        } finally {
            setIsLoading(false);
        }
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
            await fetchTodos();
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
            await fetchTodos();
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
            await fetchTodos();
        } catch (error) {
            console.error("Error deleting todo:", error);
            setError("Failed to delete todo. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = useCallback((todo) => {
        console.log('startEditing called with todo:', todo);
        if (todo.type === 'assigned') return;
        setEditingTodoId(todo.id);
        setEditingTodoTitle(todo.title);
    }, []);

    const cancelEditing = useCallback(() => {
        console.log('cancelEditing called');
        setEditingTodoId(null);
        setEditingTodoTitle('');
    }, []);

    const saveEdit = useCallback(async () => {
        console.log('saveEdit called');
        if (!editingTodoId || !user || !user.uid || isLoading) {
            console.log('saveEdit early return. editingTodoId:', editingTodoId, 'user:', user, 'isLoading:', isLoading);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const todoRef = doc(db, 'users', user.uid, 'todos', editingTodoId);
            await updateDoc(todoRef, {
                title: editingTodoTitle
            });
            console.log('Todo updated successfully');
            setEditingTodoId(null);
            setEditingTodoTitle('');
            await fetchTodos();
        } catch (error) {
            console.error("Error saving edit:", error);
            setError("Failed to save changes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [editingTodoId, editingTodoTitle, user, isLoading, fetchTodos]);

    const handleEditChange = useCallback((e) => {
        console.log('handleEditChange called with value:', e.target.value);
        setEditingTodoTitle(e.target.value);
    }, []);
    // 할 일 목록 정렬 함수
    const sortTodos = (todos) => {
        return todos.sort((a, b) => {
            if (a.completed === b.completed) {
                return b.createdAt - a.createdAt;
            }
            return a.completed ? 1 : -1;
        });
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
                                <List>
                                    {sortTodos(todos).map((todo) => (
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
                                                    onBlur={() => {
                                                        console.log('TextField onBlur triggered');
                                                        // saveEdit 함수 호출 제거
                                                    }}
                                                    onKeyPress={(e) => {
                                                        console.log('TextField onKeyPress triggered, key:', e.key);
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
                                                            생성: <FormattedDate date={todo.createdAt} />
                                                            {todo.completed && ` | 완료: `}
                                                            {todo.completed && <FormattedDate date={todo.completedAt} />}
                                                        </Typography>
                                                    }
                                                />
                                            )}
                                            {todo.type === 'personal' && (
                                                <TodoItemActions
                                                    onEdit={() => {
                                                        console.log('Edit button clicked for todo:', todo);
                                                        startEditing(todo);
                                                    }}
                                                    onSave={() => {
                                                        console.log('Save button clicked');
                                                        saveEdit();
                                                    }}
                                                    onDelete={() => deleteTodo(todo)}
                                                    onCancelEdit={cancelEditing}
                                                    isEditing={editingTodoId === todo.id}
                                                    disableEdit={todo.completed}
                                                    loading={isLoading}
                                                />
                                            )}
                                        </StyledListItem>
                                    ))}
                                </List>
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