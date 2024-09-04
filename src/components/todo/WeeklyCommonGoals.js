// components/WeeklyCommonGoals.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, TextField, Button, Checkbox, CircularProgress, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GoalItem from './GoalItem';

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

    const formatDateForInput = (date) => {
        if (!date) return '';
        let d;
        if (date instanceof Date) {
            d = date;
        } else if (date instanceof Timestamp) {
            d = date.toDate();
        } else if (typeof date === 'string') {
            d = new Date(date);
        } else {
            console.error('Invalid date format:', date);
            return '';
        }
        if (isNaN(d.getTime())) {
            console.error('Invalid date:', date);
            return '';
        }
        return d.toISOString().split('T')[0];
    };

    const startEditing = (goal) => {
        setEditingGoal({
            ...goal,
            deadline: formatDateForInput(goal.deadline)
        });
    };


    const saveEdit = async (editedGoal) => {
        setLoading(true);
        setError(null);
        try {
            const goalRef = doc(db, 'weeklyCommonGoals', editedGoal.id);
            await updateDoc(goalRef, {
                title: editedGoal.title,
                deadline: Timestamp.fromDate(new Date(editedGoal.deadline))
            });
            await fetchGoals();
        } catch (err) {
            console.error("Error updating goal:", err);
            setError("목표 수정에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
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
                    <StyledListItem key={goal.id}>
                        <GoalItem
                            goal={goal}
                            onToggle={toggleGoal}
                            onDelete={deleteGoal}
                            onSave={saveEdit}
                            formatDateForInput={formatDateForInput}
                            loading={loading}
                        />
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