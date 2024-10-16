import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, List, ListItem, ListItemText, ListItemSecondaryAction,
    IconButton, TextField, Button, CircularProgress, Snackbar, Alert, Box, Select,
    MenuItem, FormControl, InputLabel
} from '@mui/material';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useUser } from '../../contexts/UserContext';

const ChecklistManagementPage = () => {
    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const { user } = useUser();

    useEffect(() => {
        fetchCategories();
        fetchQuestions();
    }, []);

    const fetchCategories = async () => {
        try {
            const categoriesQuery = query(collection(db, 'Categories'), where('type', '==', 'checklist'));
            const querySnapshot = await getDocs(categoriesQuery);
            const fetchedCategories = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                order: doc.data().order || 0
            }));
            setCategories(fetchedCategories.sort((a, b) => a.order - b.order));
            if (fetchedCategories.length > 0 && !selectedCategory) {
                setSelectedCategory(fetchedCategories[0].id);
            }
        } catch (error) {
            console.error('카테고리 로딩 오류:', error);
            setSnackbar({ open: true, message: '카테고리를 불러오는 데 실패했습니다.', severity: 'error' });
        }
    };

    const fetchQuestions = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'checklist_questions'));
            const fetchedQuestions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                order: doc.data().order || 0
            }));
            setQuestions(fetchedQuestions.sort((a, b) => a.order - b.order));
        } catch (error) {
            console.error('질문 로딩 오류:', error);
            setSnackbar({ open: true, message: '질문을 불러오는 데 실패했습니다.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = async () => {
        if (!newQuestion.trim() || !selectedCategory) return;
        setSubmitting(true);
        try {
            const categoryName = categories.find(cat => cat.id === selectedCategory)?.name || '카테고리 없음';
            const maxOrder = Math.max(...questions.filter(q => q.category === selectedCategory).map(q => q.order), -1);
            await addDoc(collection(db, 'checklist_questions'), {
                text: newQuestion.trim(),
                category: selectedCategory,
                categoryName: categoryName,
                createdAt: serverTimestamp(),
                createdBy: user?.uid || 'unknown',
                createdByName: user?.name || 'Unknown User',
                order: maxOrder + 1
            });
            setNewQuestion('');
            fetchQuestions();
            setSnackbar({ open: true, message: '질문이 성공적으로 추가되었습니다.', severity: 'success' });
        } catch (error) {
            console.error('질문 추가 오류:', error);
            setSnackbar({ open: true, message: '질문 추가에 실패했습니다.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            await deleteDoc(doc(db, 'checklist_questions', questionId));
            fetchQuestions();
            setSnackbar({ open: true, message: '질문이 성공적으로 삭제되었습니다.', severity: 'success' });
        } catch (error) {
            console.error('질문 삭제 오류:', error);
            setSnackbar({ open: true, message: '질문 삭제에 실패했습니다.', severity: 'error' });
        }
    };

    const handleMoveQuestion = async (questionId, direction) => {
        const filteredQuestions = questions.filter(q => q.category === selectedCategory);
        const questionIndex = filteredQuestions.findIndex(q => q.id === questionId);
        if (questionIndex === -1) return;

        const question = filteredQuestions[questionIndex];
        const adjacentQuestion = filteredQuestions[questionIndex + direction];

        if (!adjacentQuestion) return;

        const batch = writeBatch(db);
        batch.update(doc(db, 'checklist_questions', question.id), { order: adjacentQuestion.order });
        batch.update(doc(db, 'checklist_questions', adjacentQuestion.id), { order: question.order });

        try {
            await batch.commit();
            fetchQuestions();
        } catch (error) {
            console.error('질문 순서 변경 오류:', error);
            setSnackbar({ open: true, message: '질문 순서 변경에 실패했습니다.', severity: 'error' });
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
        setNewQuestion('');
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    체크리스트 질문 로딩 중...
                </Typography>
            </Container>
        );
    }

    const filteredQuestions = questions.filter(q => q.category === selectedCategory).sort((a, b) => a.order - b.order);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                체크리스트 질문 관리
            </Typography>
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>카테고리</InputLabel>
                    <Select
                        value={selectedCategory}
                        label="카테고리"
                        onChange={handleCategoryChange}
                    >
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedCategory && (
                    <Box sx={{ display: 'flex', mb: 3 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="새 질문 추가"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            sx={{ mr: 2 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAddQuestion}
                            disabled={submitting || !newQuestion.trim()}
                        >
                            추가
                        </Button>
                    </Box>
                )}

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    질문 목록
                </Typography>
                <List>
                    {filteredQuestions.map((question, index) => (
                        <ListItem key={question.id} divider>
                            <ListItemText
                                primary={question.text}
                                secondary={`작성자: ${question.createdByName}, 작성일: ${question.createdAt?.toDate().toLocaleString() || 'Unknown'}`}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="move up"
                                    onClick={() => handleMoveQuestion(question.id, -1)}
                                    disabled={index === 0}
                                >
                                    <ArrowUpwardIcon />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    aria-label="move down"
                                    onClick={() => handleMoveQuestion(question.id, 1)}
                                    disabled={index === filteredQuestions.length - 1}
                                >
                                    <ArrowDownwardIcon />
                                </IconButton>
                                {user && user.uid === question.createdBy && (
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => handleDeleteQuestion(question.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Paper>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ChecklistManagementPage;