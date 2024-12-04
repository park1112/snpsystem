import React, { useState, useEffect } from 'react';
import {
    Container, Typography, TextField, Button, Grid, Paper,
    List, ListItem, ListItemText, ListItemSecondaryAction,
    IconButton, Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const OpenMarketCreate = () => {
    const [marketInfo, setMarketInfo] = useState({ name: '', tex: '' });
    const [open_market, setopen_market] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '' });
    const [editingMarket, setEditingMarket] = useState(null);

    useEffect(() => {
        fetchopen_market();
    }, []);

    const fetchopen_market = async () => {
        const querySnapshot = await getDocs(collection(db, 'open_market'));
        setopen_market(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMarketInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMarket) {
                await updateDoc(doc(db, 'open_market', editingMarket.id), marketInfo);
                setSnackbar({ open: true, message: '오픈마켓 정보가 수정되었습니다.' });
                setEditingMarket(null);
            } else {
                await addDoc(collection(db, 'open_market'), marketInfo);
                setSnackbar({ open: true, message: '오픈마켓이 추가되었습니다.' });
            }
            setMarketInfo({ name: '', tex: '' });
            fetchopen_market();
        } catch (error) {
            setSnackbar({ open: true, message: '오류가 발생했습니다.' });
            console.error("Error adding/updating document: ", error);
        }
    };

    const handleEdit = (market) => {
        setMarketInfo({ name: market.name, tex: market.tex });
        setEditingMarket(market);
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'open_market', id));
            setSnackbar({ open: true, message: '오픈마켓이 삭제되었습니다.' });
            fetchopen_market();
        } catch (error) {
            setSnackbar({ open: true, message: '삭제 중 오류가 발생했습니다.' });
            console.error("Error deleting document: ", error);
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                오픈마켓 관리
            </Typography>
            <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="오픈마켓 이름"
                                name="name"
                                value={marketInfo.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="오픈마켓 수수료"
                                name="tex"
                                value={marketInfo.tex}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary">
                                {editingMarket ? '오픈마켓 수정' : '오픈마켓 추가'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <Typography variant="h5" gutterBottom>
                등록된 오픈마켓 목록
            </Typography>
            <List>
                {open_market.map((market) => (
                    <ListItem key={market.id}>
                        <ListItemText primary={market.name} secondary={market.tex} />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(market)}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(market.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
            />
        </Container>
    );
};

export default OpenMarketCreate;