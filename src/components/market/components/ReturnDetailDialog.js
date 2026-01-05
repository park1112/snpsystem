import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
    Grid, IconButton, Paper, Box, Chip, CircularProgress, Divider
} from '@mui/material';
import {
    Close, Inventory, CalendarToday, Receipt, Numbers, AttachMoney,
    Description, Store, Person, CheckCircle, Pending, Refresh
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';

const ReturnDetailDialog = ({ open, handleClose, selectedReturn, markets, members, onStatusUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [localReturn, setLocalReturn] = useState(selectedReturn);

    useEffect(() => {
        setLocalReturn(selectedReturn);
    }, [selectedReturn]);

    if (!localReturn) return null;

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        try {
            const returnRef = doc(db, 'returns', localReturn.id);
            await updateDoc(returnRef, {
                receiveStatus: newStatus,
                updatedAt: new Date()
            });
            setLocalReturn(prev => ({ ...prev, receiveStatus: newStatus }));
            if (typeof onStatusUpdate === 'function') {
                onStatusUpdate(localReturn.id, newStatus);
            }
        } catch (error) {
            console.error("상태 업데이트 중 오류 발생:", error);
            alert('상태 업데이트에 실패했습니다. 다시 시도해 주세요.');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case '접수':
                return { bg: '#fef3c7', color: '#d97706', icon: <Pending fontSize="small" /> };
            case '반품완료':
                return { bg: '#d1fae5', color: '#059669', icon: <CheckCircle fontSize="small" /> };
            default:
                return { bg: '#f3f4f6', color: '#6b7280', icon: <Pending fontSize="small" /> };
        }
    };

    const statusConfig = getStatusConfig(localReturn.receiveStatus);

    const InfoCard = ({ icon, label, value, color = '#667eea', fullWidth = false }) => (
        <Grid item xs={fullWidth ? 12 : 6}>
            <Paper elevation={0} sx={{
                p: 2, borderRadius: 2, border: '1px solid #e2e8f0', height: '100%',
                transition: 'all 0.2s',
                '&:hover': { borderColor: color, boxShadow: `0 2px 8px ${color}15` }
            }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ p: 0.75, borderRadius: 1.5, backgroundColor: `${color}15`, color: color }}>
                        {icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 500, display: 'block' }}>
                            {label}
                        </Typography>
                        <Typography variant="body1" sx={{
                            color: '#374151', fontWeight: 600,
                            wordBreak: 'break-word'
                        }}>
                            {value || '-'}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Grid>
    );

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
        >
            {/* Header */}
            <DialogTitle sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', py: 2, px: 3
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Inventory />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        반품 상세 정보
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* Product Name Header */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    mb: 3, pb: 2, borderBottom: '1px solid #e2e8f0'
                }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#374151', mb: 0.5 }}>
                            {selectedReturn.productName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af', fontFamily: 'monospace' }}>
                            {selectedReturn.returnNumber}
                        </Typography>
                    </Box>
                    <Chip
                        icon={statusConfig.icon}
                        label={localReturn.receiveStatus}
                        sx={{
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.color,
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: statusConfig.color }
                        }}
                    />
                </Box>

                {/* Info Cards */}
                <Grid container spacing={2}>
                    <InfoCard
                        icon={<CalendarToday fontSize="small" />}
                        label="접수일"
                        value={dayjs(selectedReturn.receiptDate).format('YYYY-MM-DD')}
                        color="#667eea"
                    />
                    <InfoCard
                        icon={<Numbers fontSize="small" />}
                        label="반품 수량"
                        value={`${selectedReturn.returnQuantity?.toLocaleString()}개`}
                        color="#8b5cf6"
                    />
                    <InfoCard
                        icon={<AttachMoney fontSize="small" />}
                        label="반품 금액"
                        value={`${selectedReturn.returnAmount?.toLocaleString()}원`}
                        color="#10b981"
                    />
                    <InfoCard
                        icon={<Store fontSize="small" />}
                        label="오픈마켓"
                        value={markets.find(m => m.id === selectedReturn.returnMarket)?.name}
                        color="#f59e0b"
                    />
                    <InfoCard
                        icon={<Person fontSize="small" />}
                        label="회원"
                        value={members.find(m => m.id === selectedReturn.returnMember)?.name}
                        color="#ec4899"
                    />
                    <InfoCard
                        icon={<Description fontSize="small" />}
                        label="반품 사유"
                        value={selectedReturn.returnReason}
                        color="#06b6d4"
                        fullWidth
                    />
                </Grid>

                {/* Status Change Section */}
                <Paper elevation={0} sx={{
                    mt: 3, p: 2.5, borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Refresh sx={{ color: '#667eea' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#374151' }}>
                            상태 변경
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                현재 상태
                            </Typography>
                            <Chip
                                icon={statusConfig.icon}
                                label={localReturn.receiveStatus}
                                sx={{
                                    backgroundColor: statusConfig.bg,
                                    color: statusConfig.color,
                                    fontWeight: 600,
                                    '& .MuiChip-icon': { color: statusConfig.color }
                                }}
                            />
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box sx={{ flex: 1 }}>
                            {localReturn.receiveStatus === '접수' && (
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => handleStatusUpdate('반품완료')}
                                    disabled={isUpdating}
                                    startIcon={isUpdating ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
                                    sx={{
                                        backgroundColor: '#10b981',
                                        borderRadius: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': { backgroundColor: '#059669' }
                                    }}
                                >
                                    반품완료로 변경
                                </Button>
                            )}
                            {localReturn.receiveStatus === '반품완료' && (
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => handleStatusUpdate('접수')}
                                    disabled={isUpdating}
                                    startIcon={isUpdating ? <CircularProgress size={18} color="inherit" /> : <Pending />}
                                    sx={{
                                        borderColor: '#d97706',
                                        color: '#d97706',
                                        borderRadius: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': {
                                            borderColor: '#b45309',
                                            backgroundColor: 'rgba(217, 119, 6, 0.04)'
                                        }
                                    }}
                                >
                                    접수 상태로 변경
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={handleClose}
                    variant="contained"
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 2,
                        px: 4,
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
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReturnDetailDialog;
