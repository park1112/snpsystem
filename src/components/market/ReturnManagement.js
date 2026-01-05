import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Box, Typography, Grid, Paper, TextField, Button, MenuItem,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
    Chip, IconButton, Pagination, InputAdornment, Snackbar, Alert
} from '@mui/material';
import {
    Add, Edit, Delete, ArrowBack, Inventory, Search, CalendarToday,
    Store, Person, Receipt, AttachMoney, Numbers, Description, Save, Close
} from '@mui/icons-material';
import {
    collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReturnDetailDialog from './components/ReturnDetailDialog';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';
import PropTypes from 'prop-types';
import { uniqueId } from 'lodash';
import { useRouter } from 'next/router';

const NumberFormatCustom = React.forwardRef(function NumberFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
        <NumericFormat
            {...other}
            getInputRef={ref}
            onValueChange={(values) => {
                onChange({
                    target: {
                        name: props.name,
                        value: values.value,
                    },
                });
            }}
            thousandSeparator
            isNumericString
        />
    );
});

NumberFormatCustom.propTypes = {
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
};

const fetchMarkets = async () => {
    const cachedMarkets = sessionStorage.getItem('markets');
    if (cachedMarkets) {
        return JSON.parse(cachedMarkets);
    } else {
        const snapshot = await getDocs(collection(db, 'open_market'));
        const marketsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        sessionStorage.setItem('markets', JSON.stringify(marketsData));
        return marketsData;
    }
};

const fetchMembers = async () => {
    const cachedMembers = sessionStorage.getItem('members');
    if (cachedMembers) {
        return JSON.parse(cachedMembers);
    } else {
        const snapshot = await getDocs(collection(db, 'markets'));
        const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        sessionStorage.setItem('members', JSON.stringify(membersData));
        return membersData;
    }
};

const ITEMS_PER_PAGE = 15;

const ReturnManagement = () => {
    const [markets, setMarkets] = useState([]);
    const [members, setMembers] = useState([]);
    const [returnData, setReturnData] = useState({
        receiptDate: dayjs().format('YYYY-MM-DD'),
        returnNumber: '',
        productName: '',
        returnQuantity: '',
        returnAmount: '',
        returnReason: '',
        returnMarket: '',
        returnMember: '',
    });
    const [returns, setReturns] = useState([]);
    const [editingReturn, setEditingReturn] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
    const isListenerAttached = useRef(false);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            const [marketsData, membersData] = await Promise.all([fetchMarkets(), fetchMembers()]);
            setMarkets(marketsData);
            setMembers(membersData);
        };

        loadData();

        if (!isListenerAttached.current) {
            const q = query(collection(db, 'returns'), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedReturns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReturns(fetchedReturns);
                setLoading(false);
            });

            isListenerAttached.current = true;

            return () => {
                unsubscribe();
                isListenerAttached.current = false;
            };
        }
    }, []);

    const filteredReturns = useMemo(() => {
        if (!searchTerm) return returns;
        const term = searchTerm.toLowerCase();
        return returns.filter(item =>
            item.productName?.toLowerCase().includes(term) ||
            item.returnNumber?.toLowerCase().includes(term) ||
            item.returnReason?.toLowerCase().includes(term) ||
            markets.find(m => m.id === item.returnMarket)?.name?.toLowerCase().includes(term) ||
            members.find(m => m.id === item.returnMember)?.name?.toLowerCase().includes(term)
        );
    }, [returns, searchTerm, markets, members]);

    const paginatedReturns = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredReturns.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredReturns, currentPage]);

    const totalPages = Math.ceil(filteredReturns.length / ITEMS_PER_PAGE);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReturnData({
            ...returnData,
            [name]: name === 'returnQuantity' || name === 'returnAmount' ? Number(value.replace(/,/g, '')) : value
        });
    };

    const isFormValid = () => {
        const requiredFields = [
            'receiptDate', 'returnNumber', 'productName', 'returnQuantity',
            'returnAmount', 'returnReason', 'returnMarket', 'returnMember'
        ];
        return requiredFields.every(field => returnData[field]);
    };

    const resetForm = () => {
        setReturnData({
            receiptDate: dayjs().format('YYYY-MM-DD'),
            returnNumber: '',
            productName: '',
            returnQuantity: '',
            returnAmount: '',
            returnReason: '',
            returnMarket: '',
            returnMember: '',
        });
        setEditingReturn(null);
    };

    const handleOpenFormDialog = () => {
        resetForm();
        setOpenFormDialog(true);
    };

    const handleCloseFormDialog = () => {
        setOpenFormDialog(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            setSnackbar({ open: true, message: '모든 필드를 채워주세요.', severity: 'warning' });
            return;
        }
        setSubmitLoading(true);
        try {
            const newReturnData = {
                ...returnData,
                returnQuantity: Number(returnData.returnQuantity),
                returnAmount: Number(returnData.returnAmount),
                receiveStatus: '접수',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await addDoc(collection(db, 'returns'), newReturnData);
            setSnackbar({ open: true, message: '반품이 접수되었습니다.', severity: 'success' });
            handleCloseFormDialog();
        } catch (error) {
            console.error("Error adding document: ", error);
            setSnackbar({ open: true, message: '오류가 발생했습니다.', severity: 'error' });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            setSnackbar({ open: true, message: '모든 필드를 채워주세요.', severity: 'warning' });
            return;
        }
        setSubmitLoading(true);
        try {
            const updatedData = {
                ...returnData,
                returnQuantity: Number(returnData.returnQuantity),
                returnAmount: Number(returnData.returnAmount),
                updatedAt: new Date()
            };
            const returnRef = doc(db, 'returns', editingReturn.id);
            await updateDoc(returnRef, updatedData);
            setSnackbar({ open: true, message: '반품 정보가 수정되었습니다.', severity: 'success' });
            handleCloseFormDialog();
        } catch (error) {
            console.error("Error updating document: ", error);
            setSnackbar({ open: true, message: '오류가 발생했습니다.', severity: 'error' });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteClick = (item) => {
        setDeleteDialog({ open: true, item });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.item) return;
        try {
            await deleteDoc(doc(db, 'returns', deleteDialog.item.id));
            setSnackbar({ open: true, message: '반품이 삭제되었습니다.', severity: 'success' });
        } catch (error) {
            console.error("Error deleting document: ", error);
            setSnackbar({ open: true, message: '삭제 중 오류가 발생했습니다.', severity: 'error' });
        }
        setDeleteDialog({ open: false, item: null });
    };

    const handleEdit = (returnItem) => {
        setEditingReturn(returnItem);
        setReturnData({
            ...returnItem,
            receiptDate: dayjs(returnItem.receiptDate).format('YYYY-MM-DD')
        });
        setOpenFormDialog(true);
    };

    const handleRowClick = (returnItem) => {
        setSelectedReturn(returnItem);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const formatDate = useCallback((date) => {
        if (!date) return '-';
        const d = new Date(date);
        const now = new Date();
        const isToday = d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate();
        if (isToday) {
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
        return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    const inputStyle = {
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#fafafa',
            transition: 'all 0.2s',
            '&:hover': { backgroundColor: '#f5f5f5' },
            '&.Mui-focused': {
                backgroundColor: 'white',
                boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
            },
            '& fieldset': { borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: '#cbd5e1' },
            '&.Mui-focused fieldset': { borderColor: '#667eea' }
        },
        '& .MuiInputLabel-root.Mui-focused': { color: '#667eea' }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case '접수': return { bg: '#fef3c7', color: '#d97706' };
            case '반품완료': return { bg: '#d1fae5', color: '#059669' };
            default: return { bg: '#f3f4f6', color: '#6b7280' };
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px"
                sx={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)', borderRadius: 3 }}>
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.back()}
                    sx={{ mb: 2, color: '#667eea', '&:hover': { backgroundColor: 'rgba(102,126,234,0.04)' } }}
                >
                    뒤로가기
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            p: 1.5, borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}>
                            <Inventory />
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#374151' }}>
                                반품 관리
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                반품 접수 및 처리 현황을 관리합니다
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleOpenFormDialog}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: 2,
                            px: 3,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                            }
                        }}
                    >
                        반품 접수
                    </Button>
                </Box>
            </Box>

            {/* List Section */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {/* List Header */}
                <Box sx={{
                    px: 3, py: 2, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Inventory sx={{ color: '#667eea' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151' }}>
                            반품 목록
                        </Typography>
                        <Chip label={`${filteredReturns.length}건`} size="small"
                            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 600 }} />
                    </Box>
                    <TextField
                        placeholder="검색..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9ca3af' }} /></InputAdornment>
                        }}
                        sx={{ width: 250, ...inputStyle }}
                    />
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ '& th': { backgroundColor: '#f8fafc', color: '#374151', fontWeight: 600, borderBottom: '2px solid #e2e8f0' } }}>
                                <TableCell>상품명</TableCell>
                                <TableCell align="right">수량</TableCell>
                                <TableCell align="right">금액</TableCell>
                                <TableCell>마켓</TableCell>
                                <TableCell>회원</TableCell>
                                <TableCell>상태</TableCell>
                                <TableCell align="center">작업</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedReturns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
                                        <Inventory sx={{ fontSize: 48, color: '#e2e8f0', mb: 2, display: 'block', mx: 'auto' }} />
                                        <Typography variant="body1">반품 내역이 없습니다</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedReturns.map((returnItem, index) => {
                                    const statusColor = getStatusColor(returnItem.receiveStatus);
                                    return (
                                        <TableRow
                                            key={returnItem.id || uniqueId('return_')}
                                            onClick={() => handleRowClick(returnItem)}
                                            sx={{
                                                cursor: 'pointer',
                                                backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc',
                                                transition: 'all 0.15s',
                                                '&:hover': { backgroundColor: '#f0f4ff', transform: 'scale(1.001)' }
                                            }}
                                        >
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                                                        {returnItem.productName}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                                        {returnItem.returnNumber}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: '#374151' }}>
                                                {returnItem.returnQuantity?.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: '#667eea', fontWeight: 600 }}>
                                                {returnItem.returnAmount?.toLocaleString()}원
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                    {markets.find(m => m.id === returnItem.returnMarket)?.name || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                    {members.find(m => m.id === returnItem.returnMember)?.name || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={returnItem.receiveStatus}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: statusColor.bg,
                                                        color: statusColor.color,
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(returnItem); }}
                                                        sx={{ color: '#667eea', '&:hover': { backgroundColor: 'rgba(102,126,234,0.08)' } }}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(returnItem); }}
                                                        sx={{ color: '#ef4444', '&:hover': { backgroundColor: 'rgba(239,68,68,0.08)' } }}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{
                        display: 'flex', justifyContent: 'center', py: 2,
                        borderTop: '1px solid #e2e8f0',
                        '& .MuiPaginationItem-root': {
                            borderRadius: 2, fontWeight: 500,
                            '&.Mui-selected': {
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                '&:hover': { background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)' }
                            }
                        }
                    }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={(e, page) => setCurrentPage(page)}
                            shape="rounded"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
            </Paper>

            {/* Form Dialog */}
            <Dialog
                open={openFormDialog}
                onClose={handleCloseFormDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white', py: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {editingReturn ? <Edit /> : <Add />}
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {editingReturn ? '반품 수정' : '반품 접수'}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleCloseFormDialog} sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <form onSubmit={editingReturn ? handleUpdate : handleSubmit}>
                    <DialogContent sx={{ pt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth size="small" label="접수일" type="date"
                                    name="receiptDate" value={returnData.receiptDate}
                                    onChange={handleInputChange}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{ startAdornment: <CalendarToday sx={{ mr: 1, color: '#9ca3af' }} /> }}
                                    sx={inputStyle}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth select size="small" label="오픈마켓"
                                    name="returnMarket" value={returnData.returnMarket}
                                    onChange={handleInputChange}
                                    InputProps={{ startAdornment: <Store sx={{ mr: 1, color: '#9ca3af' }} /> }}
                                    sx={inputStyle}
                                >
                                    {markets.map((market) => (
                                        <MenuItem key={market.id} value={market.id}>{market.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth select size="small" label="회원"
                                    name="returnMember" value={returnData.returnMember}
                                    onChange={handleInputChange}
                                    InputProps={{ startAdornment: <Person sx={{ mr: 1, color: '#9ca3af' }} /> }}
                                    sx={inputStyle}
                                >
                                    {members.map((member) => (
                                        <MenuItem key={member.id} value={member.id}>{member.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth size="small" label="반품접수번호"
                                    name="returnNumber" value={returnData.returnNumber}
                                    onChange={handleInputChange}
                                    InputProps={{ startAdornment: <Receipt sx={{ mr: 1, color: '#9ca3af' }} /> }}
                                    sx={inputStyle}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth size="small" label="상품 이름"
                                    name="productName" value={returnData.productName}
                                    onChange={handleInputChange}
                                    InputProps={{ startAdornment: <Inventory sx={{ mr: 1, color: '#9ca3af' }} /> }}
                                    sx={inputStyle}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth size="small" label="반품 수량"
                                    name="returnQuantity" value={returnData.returnQuantity}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        inputComponent: NumberFormatCustom,
                                        startAdornment: <Numbers sx={{ mr: 1, color: '#9ca3af' }} />
                                    }}
                                    sx={inputStyle}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth size="small" label="반품 금액"
                                    name="returnAmount" value={returnData.returnAmount}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        inputComponent: NumberFormatCustom,
                                        startAdornment: <AttachMoney sx={{ mr: 1, color: '#9ca3af' }} />,
                                        endAdornment: <InputAdornment position="end">원</InputAdornment>
                                    }}
                                    sx={inputStyle}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth size="small" label="반품 사유" multiline rows={3}
                                    name="returnReason" value={returnData.returnReason}
                                    onChange={handleInputChange}
                                    sx={inputStyle}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                        <Button
                            onClick={handleCloseFormDialog}
                            startIcon={<Close />}
                            sx={{
                                borderColor: '#e2e8f0', color: '#6b7280', borderRadius: 2,
                                px: 3, textTransform: 'none', fontWeight: 600,
                            }}
                        >
                            취소
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!isFormValid() || submitLoading}
                            startIcon={submitLoading ? <CircularProgress size={20} color="inherit" /> : (editingReturn ? <Save /> : <Add />)}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 600,
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                                },
                                '&.Mui-disabled': { background: '#e2e8f0', color: '#9ca3af' }
                            }}
                        >
                            {editingReturn ? '수정 완료' : '반품 접수'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <ReturnDetailDialog
                    open={openDialog}
                    handleClose={handleCloseDialog}
                    selectedReturn={selectedReturn}
                    markets={markets}
                    members={members}
                />
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, item: null })}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>반품 삭제</Typography>
                    <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                        <strong>{deleteDialog.item?.productName}</strong>을(를) 정말 삭제하시겠습니까?
                        <br />이 작업은 되돌릴 수 없습니다.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button onClick={() => setDeleteDialog({ open: false, item: null })} sx={{ color: '#6b7280' }}>
                            취소
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            variant="contained"
                            sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
                        >
                            삭제
                        </Button>
                    </Box>
                </Box>
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

export default ReturnManagement;
