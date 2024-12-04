import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Button,
    CircularProgress,
    Snackbar,
    Alert,
    Box,
} from '@mui/material';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const ChecklistCategoryManagementPage = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const categoriesQuery = query(collection(db, 'Categories'), where('type', '==', 'checklist'));
            const querySnapshot = await getDocs(categoriesQuery);
            const fetchedCategories = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(fetchedCategories);
        } catch (error) {
            console.error('카테고리 로딩 오류:', error);
            setSnackbar({ open: true, message: '카테고리를 불러오는 데 실패했습니다.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        setSubmitting(true);
        try {
            await addDoc(collection(db, 'Categories'), {
                name: newCategory.trim(),
                type: 'checklist'
            });
            setNewCategory('');
            fetchCategories();
            setSnackbar({ open: true, message: '카테고리가 성공적으로 추가되었습니다.', severity: 'success' });
        } catch (error) {
            console.error('카테고리 추가 오류:', error);
            setSnackbar({ open: true, message: '카테고리 추가에 실패했습니다.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            await deleteDoc(doc(db, 'Categories', categoryId));
            fetchCategories();
            setSnackbar({ open: true, message: '카테고리가 성공적으로 삭제되었습니다.', severity: 'success' });
        } catch (error) {
            console.error('카테고리 삭제 오류:', error);
            setSnackbar({ open: true, message: '카테고리 삭제에 실패했습니다.', severity: 'error' });
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setNewCategory(category.name);
    };

    const handleUpdateCategory = async () => {
        if (!newCategory.trim() || !editingCategory) return;
        setSubmitting(true);
        try {
            await updateDoc(doc(db, 'Categories', editingCategory.id), {
                name: newCategory.trim()
            });
            setNewCategory('');
            setEditingCategory(null);
            fetchCategories();
            setSnackbar({ open: true, message: '카테고리가 성공적으로 수정되었습니다.', severity: 'success' });
        } catch (error) {
            console.error('카테고리 수정 오류:', error);
            setSnackbar({ open: true, message: '카테고리 수정에 실패했습니다.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    체크리스트 카테고리 로딩 중...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                체크리스트 카테고리 관리
            </Typography>
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Box sx={{ display: 'flex', mb: 3 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label={editingCategory ? "카테고리 수정" : "새 카테고리 추가"}
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        sx={{ mr: 2 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={editingCategory ? <EditIcon /> : <AddIcon />}
                        onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                        disabled={submitting || !newCategory.trim()}
                    >
                        {editingCategory ? '수정' : '추가'}
                    </Button>
                </Box>
                <List>
                    {categories.map((category) => (
                        <ListItem key={category.id} divider>
                            <ListItemText primary={category.name} />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="edit"
                                    onClick={() => handleEditCategory(category)}
                                    sx={{ mr: 1 }}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDeleteCategory(category.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
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



export default ChecklistCategoryManagementPage;