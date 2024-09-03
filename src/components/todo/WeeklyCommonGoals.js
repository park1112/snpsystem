// components/WeeklyCommonGoals.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, TextField, Button, Checkbox, CircularProgress, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FormattedDate from './FormattedDate';

const StyledListItem = styled(ListItem)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
}));

export default function WeeklyCommonGoals({ user }) {
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [editingGoal, setEditingGoal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        setLoading(true);
        setError(null);
        try {
            const q = query(
                collection(db, 'weeklyCommonGoals'),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            setGoals(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error("Error fetching goals:", err);
            setError("목표를 불러오는 데 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    const addGoal = async () => {
        if (newGoal.trim() === '' || !user || loading) return;
        setLoading(true);
        setError(null);
        try {
            await addDoc(collection(db, 'weeklyCommonGoals'), {
                title: newGoal,
                deadline: new Date(newGoalDeadline),
                completed: false,
                createdAt: new Date(),
                createdBy: user.name || user.email || '알 수 없는 사용자',
                completedAt: null
            });
            setNewGoal('');
            setNewGoalDeadline('');
            await fetchGoals();
        } catch (err) {
            console.error("Error adding goal:", err);
            setError("목표 추가에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    const toggleGoal = async (id, completed) => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            const goalRef = doc(db, 'weeklyCommonGoals', id);
            await updateDoc(goalRef, {
                completed: !completed,
                completedAt: !completed ? new Date() : null
            });
            await fetchGoals();
        } catch (err) {
            console.error("Error toggling goal:", err);
            setError("목표 상태 변경에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    const deleteGoal = async (id) => {
        if (loading) return;
        setLoading(true);
        setError(null);
        try {
            await deleteDoc(doc(db, 'weeklyCommonGoals', id));
            await fetchGoals();
        } catch (err) {
            console.error("Error deleting goal:", err);
            setError("목표 삭제에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (goal) => {
        setEditingGoal({ ...goal });
    };

    const saveEdit = async () => {
        if (editingGoal && !loading) {
            setLoading(true);
            setError(null);
            try {
                const goalRef = doc(db, 'weeklyCommonGoals', editingGoal.id);
                await updateDoc(goalRef, {
                    title: editingGoal.title,
                    deadline: new Date(editingGoal.deadline)
                });
                setEditingGoal(null);
                await fetchGoals();
            } catch (err) {
                console.error("Error updating goal:", err);
                setError("목표 수정에 실패했습니다. 다시 시도해 주세요.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <Typography variant="h4" component="h2" gutterBottom>
                주간 공통 목표
            </Typography>
            <TextField
                fullWidth
                variant="outlined"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="새 목표 입력"
                style={{ marginBottom: '10px' }}
                disabled={loading}
            />
            <Typography variant="caption">
                목표 기간 설정
            </Typography>
            <TextField
                fullWidth
                variant="outlined"
                type="date"
                value={newGoalDeadline}
                onChange={(e) => setNewGoalDeadline(e.target.value)}
                style={{ marginBottom: '10px' }}
                disabled={loading}
            />
            <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={24} /> : <AddIcon />}
                onClick={addGoal}
                fullWidth
                style={{ marginBottom: '20px' }}
                disabled={loading}
            >
                {loading ? '처리 중...' : '목표 추가'}
            </Button>
            {loading && <CircularProgress />}
            <List>
                {goals.map((goal) => (
                    <StyledListItem key={goal.id} dense>
                        <Checkbox
                            edge="start"
                            checked={goal.completed}
                            onChange={() => toggleGoal(goal.id, goal.completed)}
                            disabled={loading}
                        />
                        {editingGoal && editingGoal.id === goal.id ? (
                            <>
                                <TextField
                                    fullWidth
                                    value={editingGoal.title}
                                    onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                                    style={{ marginRight: '10px' }}
                                    disabled={loading}
                                />
                                <TextField
                                    type="date"
                                    value={editingGoal.deadline.toDate().toISOString().split('T')[0]}
                                    onChange={(e) => setEditingGoal({ ...editingGoal, deadline: new Date(e.target.value) })}
                                    style={{ marginRight: '10px' }}
                                    disabled={loading}
                                />
                                <Button onClick={saveEdit} disabled={loading}>저장</Button>
                            </>
                        ) : (
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="h6"
                                        style={{
                                            textDecoration: goal.completed ? 'line-through' : 'none',
                                            color: goal.completed ? 'text.secondary' : 'text.primary',
                                        }}
                                    >
                                        {goal.title}
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="caption">
                                        목표 기한: {goal.deadline.toDate().toLocaleDateString()} |
                                        등록자: {goal.createdBy}
                                        <br />
                                        생성: <FormattedDate date={goal.createdAt} />
                                        {goal.completed && ` | 완료: ${<FormattedDate date={goal.completedAt} />}`}
                                    </Typography>
                                }
                            />
                        )}
                        <ListItemSecondaryAction>
                            <IconButton edge="end" onClick={() => startEditing(goal)} disabled={loading}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" onClick={() => deleteGoal(goal.id)} disabled={loading}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </StyledListItem>
                ))}
            </List>
            <Snackbar
                open={error !== null}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                message={error}
            />
        </div>
    );
}