import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, query, where, orderBy, onSnapshot, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { Typography, List, TextField, Button, Checkbox, CircularProgress, Snackbar, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GoalItem from './GoalItem';
import FormattedDate from './FormattedDate';

const StyledListItem = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
}));

export default function WeeklyCommonGoals({ user }) {
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState('');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showOlderGoals, setShowOlderGoals] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToGoals();
        return () => unsubscribe();
    }, []);

    const subscribeToGoals = () => {
        setLoading(true);
        setError(null);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const q = query(
            collection(db, 'weeklyCommonGoals'),
            where('createdAt', '>', oneWeekAgo),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedGoals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGoals(fetchedGoals);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching goals:", err);
            setError("목표를 불러오는 데 실패했습니다. 다시 시도해 주세요.");
            setLoading(false);
        });

        return unsubscribe;
    };

    const addGoal = async () => {
        if (newGoal.trim() === '' || !user || loading) return;
        setLoading(true);
        setError(null);
        try {
            await addDoc(collection(db, 'weeklyCommonGoals'), {
                title: newGoal,
                deadline: Timestamp.fromDate(new Date(newGoalDeadline)),
                completed: false,
                createdAt: Timestamp.fromDate(new Date()),
                createdBy: user.name || user.email || '알 수 없는 사용자',
                completedAt: null
            });
            setNewGoal('');
            setNewGoalDeadline('');
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
                completedAt: !completed ? Timestamp.fromDate(new Date()) : null
            });
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
        } catch (err) {
            console.error("Error deleting goal:", err);
            setError("목표 삭제에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    const formatDateForInput = (date) => {
        if (!date) return '';
        let d = date instanceof Timestamp ? date.toDate() : new Date(date);
        return d.toISOString().split('T')[0];
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
        } catch (err) {
            console.error("Error updating goal:", err);
            setError("목표 수정에 실패했습니다. 다시 시도해 주세요.");
        } finally {
            setLoading(false);
        }
    };

    const groupGoalsByCompletionDate = (goals) => {
        const grouped = {};
        goals.forEach(goal => {
            if (goal.completed && goal.completedAt) {
                const date = goal.completedAt.toDate().toDateString();
                if (!grouped[date]) {
                    grouped[date] = [];
                }
                grouped[date].push(goal);
            }
        });
        return grouped;
    };

    const renderGroupedGoals = () => {
        const groupedGoals = groupGoalsByCompletionDate(goals);
        const sortedDates = Object.keys(groupedGoals).sort((a, b) => new Date(b) - new Date(a));

        return sortedDates.map(date => (
            <Accordion key={date}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                        <FormattedDate date={new Date(date)} showTime={false} />
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <List>
                        {groupedGoals[date].map((goal) => (
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
                </AccordionDetails>
            </Accordion>
        ));
    };

    // const loadOlderGoals = async () => {
    //     // Implement loading of goals older than a week
    //     // This would involve creating a new query with a different date range
    //     // and appending the results to the existing goals
    // };

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
                {goals.filter(goal => !goal.completed).map((goal) => (
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
            {renderGroupedGoals()}
            {!showOlderGoals && (
                <Button onClick={() => setShowOlderGoals(true)}>
                    더 오래된 목표 보기
                </Button>
            )}
            <Snackbar
                open={error !== null}
                autoHideDuration={6000}
                onClose={() => setError(null)}
                message={error}
            />
        </div>
    );
}