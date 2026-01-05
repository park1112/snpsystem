import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Grid, Paper,
    IconButton, Snackbar, Alert, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Chip, Divider
} from '@mui/material';
import { Delete, Edit, ArrowBack, Store, Code, Add, Business, Save, Close } from '@mui/icons-material';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useRouter } from 'next/router';

const OpenMarketManagementPage = () => {
    const [marketInfo, setMarketInfo] = useState({ name: '', code: '' });
    const [markets, setMarkets] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [editingMarket, setEditingMarket] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, market: null });
    const router = useRouter();

    useEffect(() => {
        fetchMarkets();
    }, []);

    const fetchMarkets = async () => {
        const querySnapshot = await getDocs(collection(db, 'markets'));
        setMarkets(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMarketInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMarket) {
                await updateDoc(doc(db, 'markets', editingMarket.id), marketInfo);
                setSnackbar({ open: true, message: '거래처 정보가 수정되었습니다.', severity: 'success' });
                setEditingMarket(null);
            } else {
                await addDoc(collection(db, 'markets'), marketInfo);
                setSnackbar({ open: true, message: '거래처가 추가되었습니다.', severity: 'success' });
            }
            setMarketInfo({ name: '', code: '' });
            fetchMarkets();
        } catch (error) {
            setSnackbar({ open: true, message: '오류가 발생했습니다.', severity: 'error' });
            console.error("Error adding/updating document: ", error);
        }
    };

    const handleEdit = (market) => {
        setMarketInfo({ name: market.name, code: market.code });
        setEditingMarket(market);
    };

    const handleCancelEdit = () => {
        setMarketInfo({ name: '', code: '' });
        setEditingMarket(null);
    };

    const handleDeleteClick = (market) => {
        setDeleteDialog({ open: true, market });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.market) return;
        try {
            await deleteDoc(doc(db, 'markets', deleteDialog.market.id));
            setSnackbar({ open: true, message: '거래처가 삭제되었습니다.', severity: 'success' });
            fetchMarkets();
        } catch (error) {
            setSnackbar({ open: true, message: '삭제 중 오류가 발생했습니다.', severity: 'error' });
            console.error("Error deleting document: ", error);
        }
        setDeleteDialog({ open: false, market: null });
    };

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#fafafa',
            transition: 'all 0.2s',
            '&:hover': {
                backgroundColor: '#f5f5f5',
            },
            '&.Mui-focused': {
                backgroundColor: 'white',
                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
            },
            '& fieldset': {
                borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
                borderColor: '#cbd5e1',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#667eea',
            }
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: '#667eea',
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.back()}
                    sx={{
                        mb: 2,
                        color: '#667eea',
                        '&:hover': { backgroundColor: 'rgba(102,126,234,0.04)' }
                    }}
                >
                    뒤로가기
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}>
                        <Business />
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#374151' }}>
                            거래처 관리
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                            거래처 정보를 추가하고 관리합니다
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Form Section */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: '#f0f4ff', color: '#667eea' }}>
                        {editingMarket ? <Edit fontSize="small" /> : <Add fontSize="small" />}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                        {editingMarket ? '거래처 수정' : '새 거래처 추가'}
                    </Typography>
                    {editingMarket && (
                        <Chip
                            label="수정 모드"
                            size="small"
                            sx={{ ml: 'auto', backgroundColor: '#fef3c7', color: '#d97706' }}
                        />
                    )}
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="거래처 이름"
                                name="name"
                                value={marketInfo.name}
                                onChange={handleInputChange}
                                required
                                size="small"
                                InputProps={{
                                    startAdornment: <Store sx={{ mr: 1, color: '#9ca3af' }} />
                                }}
                                sx={inputStyle}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="거래처 코드"
                                name="code"
                                value={marketInfo.code}
                                onChange={handleInputChange}
                                required
                                size="small"
                                InputProps={{
                                    startAdornment: <Code sx={{ mr: 1, color: '#9ca3af' }} />
                                }}
                                sx={inputStyle}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={editingMarket ? <Save /> : <Add />}
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                                        }
                                    }}
                                >
                                    {editingMarket ? '수정 완료' : '거래처 추가'}
                                </Button>
                                {editingMarket && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<Close />}
                                        onClick={handleCancelEdit}
                                        sx={{
                                            borderColor: '#e2e8f0',
                                            color: '#6b7280',
                                            borderRadius: 2,
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            '&:hover': {
                                                borderColor: '#cbd5e1',
                                                backgroundColor: '#f8fafc'
                                            }
                                        }}
                                    >
                                        취소
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {/* List Section */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                }}
            >
                <Box sx={{
                    px: 3,
                    py: 2,
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Store sx={{ color: '#667eea' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                            등록된 거래처 목록
                        </Typography>
                    </Box>
                    <Chip
                        label={`${markets.length}개`}
                        size="small"
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: 600
                        }}
                    />
                </Box>

                {markets.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <Store sx={{ fontSize: 48, color: '#e2e8f0', mb: 2 }} />
                        <Typography variant="body1" sx={{ color: '#9ca3af' }}>
                            등록된 거래처가 없습니다
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {markets.map((market, index) => (
                            <Box key={market.id}>
                                <Box
                                    sx={{
                                        px: 3,
                                        py: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.15s',
                                        '&:hover': {
                                            backgroundColor: '#f8fafc'
                                        }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 2,
                                            backgroundColor: '#f0f4ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#667eea',
                                            fontWeight: 600
                                        }}>
                                            {market.name.charAt(0)}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                                                {market.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#9ca3af', fontFamily: 'monospace' }}>
                                                {market.code}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton
                                            onClick={() => handleEdit(market)}
                                            sx={{
                                                color: '#667eea',
                                                '&:hover': { backgroundColor: 'rgba(102,126,234,0.08)' }
                                            }}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDeleteClick(market)}
                                            sx={{
                                                color: '#ef4444',
                                                '&:hover': { backgroundColor: 'rgba(239,68,68,0.08)' }
                                            }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                {index < markets.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                )}
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, market: null })}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>거래처 삭제</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <strong>{deleteDialog.market?.name}</strong>을(를) 정말 삭제하시겠습니까?
                        <br />이 작업은 되돌릴 수 없습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setDeleteDialog({ open: false, market: null })}
                        sx={{ color: '#6b7280' }}
                    >
                        취소
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        sx={{
                            backgroundColor: '#ef4444',
                            '&:hover': { backgroundColor: '#dc2626' }
                        }}
                    >
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OpenMarketManagementPage;
