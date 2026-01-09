import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Grid, Card, CardHeader, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
    TextField, IconButton, Box, Snackbar, Alert
} from '@mui/material';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { logActivity, LOG_ACTIONS, LOG_CATEGORIES } from '../../utils/activityLogger';

const DayEditPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (docId) => {
        setLoading(true);
        try {
            const docRef = doc(db, 'daily_summaries', docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setData(docSnap.data());
            } else {
                setError('데이터를 찾을 수 없습니다.');
            }
        } catch (err) {
            setError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 마켓 이름 변경
    const handleMarketNameChange = (e) => {
        setData({ ...data, marketName: e.target.value });
    };

    // 상품 정보 변경
    const handleSummaryChange = (index, field, value) => {
        const updatedSummary = [...data.summary];
        if (field === 'productPrice' || field === 'totalQuantity') {
            updatedSummary[index][field] = Number(value) || 0;
            // 합계가격 자동 계산
            updatedSummary[index].totalPrice = updatedSummary[index].productPrice * updatedSummary[index].totalQuantity;
        } else {
            updatedSummary[index][field] = value;
        }

        // 전체 수량 및 합계 재계산
        const totalQuantity = updatedSummary.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
        const totalPrice = updatedSummary.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

        setData({
            ...data,
            summary: updatedSummary,
            totalQuantity,
            totalPrice
        });
    };

    // 상품 행 삭제
    const handleRemoveRow = (index) => {
        const updatedSummary = data.summary.filter((_, i) => i !== index);
        const totalQuantity = updatedSummary.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
        const totalPrice = updatedSummary.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

        setData({
            ...data,
            summary: updatedSummary,
            totalQuantity,
            totalPrice
        });
    };

    // 상품 행 추가
    const handleAddRow = () => {
        const newRow = {
            productName: '',
            totalQuantity: 0,
            boxType: '',
            productPrice: 0,
            totalPrice: 0
        };
        setData({
            ...data,
            summary: [...data.summary, newRow]
        });
    };

    // 저장
    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, 'daily_summaries', id);
            await updateDoc(docRef, {
                marketName: data.marketName,
                summary: data.summary,
                totalQuantity: data.totalQuantity,
                totalPrice: data.totalPrice
            });

            // 로그 기록
            await logActivity({
                action: LOG_ACTIONS.UPDATE,
                category: LOG_CATEGORIES.DAILY_SUMMARIES,
                targetId: id,
                targetName: data.marketName,
                description: `출고상품 "${data.marketName}" 수정`,
                metadata: {
                    totalQuantity: data.totalQuantity,
                    totalPrice: data.totalPrice,
                    itemCount: data.summary?.length || 0
                }
            });

            setSnackbar({ open: true, message: '저장되었습니다.', severity: 'success' });
            setTimeout(() => {
                router.push(`/market/detail/${id}`);
            }, 1000);
        } catch (err) {
            console.error('저장 중 오류 발생:', err);
            setSnackbar({ open: true, message: '저장 중 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // 뒤로 가기
    const handleBack = () => {
        router.push(`/market/detail/${id}`);
    };

    // 스낵바 닫기
    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) return (
        <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
        </Container>
    );

    if (error) return (
        <Container maxWidth="md">
            <Typography color="error">{error}</Typography>
        </Container>
    );

    return (
        <Container maxWidth="lg">
            {/* 상단 네비게이션 */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ color: '#374151' }}
                >
                    뒤로
                </Button>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{
                        bgcolor: '#667eea',
                        '&:hover': { bgcolor: '#5a6fd6' }
                    }}
                >
                    저장
                </Button>
            </Box>

            <Card>
                <CardHeader
                    title="데이터 수정"
                    subheader={data?.updatedAt ? `생성일: ${dayjs(data.updatedAt.toDate()).format('YYYY-MM-DD HH:mm')}` : ''}
                />
                <CardContent>
                    <Grid container spacing={3}>
                        {/* 기본 정보 */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="마켓 이름"
                                value={data?.marketName || ''}
                                onChange={handleMarketNameChange}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="총 수량"
                                value={data?.totalQuantity || 0}
                                variant="outlined"
                                disabled
                                InputProps={{
                                    readOnly: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="총 합계가격"
                                value={data?.totalPrice?.toLocaleString() || 0}
                                variant="outlined"
                                disabled
                                InputProps={{
                                    readOnly: true,
                                    endAdornment: <Typography variant="body2">원</Typography>
                                }}
                            />
                        </Grid>

                        {/* 상품 목록 테이블 */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">상품 목록</Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddRow}
                                    size="small"
                                >
                                    행 추가
                                </Button>
                            </Box>
                            <TableContainer component={Paper} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow style={{ backgroundColor: '#f0f0f0' }}>
                                            <TableCell style={{ padding: '12px', fontWeight: 'bold', width: '30%' }}>상품명</TableCell>
                                            <TableCell align="center" style={{ padding: '12px', fontWeight: 'bold', width: '12%' }}>수량</TableCell>
                                            <TableCell style={{ padding: '12px', fontWeight: 'bold', width: '15%' }}>박스 타입</TableCell>
                                            <TableCell align="right" style={{ padding: '12px', fontWeight: 'bold', width: '18%' }}>상품가격</TableCell>
                                            <TableCell align="right" style={{ padding: '12px', fontWeight: 'bold', width: '18%' }}>합계가격</TableCell>
                                            <TableCell align="center" style={{ padding: '12px', fontWeight: 'bold', width: '7%' }}>삭제</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data?.summary?.map((item, index) => (
                                            <TableRow
                                                key={index}
                                                style={{
                                                    backgroundColor: index % 2 !== 0 ? '#f9f9f9' : 'inherit'
                                                }}
                                            >
                                                <TableCell style={{ padding: '8px' }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={item.productName}
                                                        onChange={(e) => handleSummaryChange(index, 'productName', e.target.value)}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell style={{ padding: '8px' }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        value={item.totalQuantity}
                                                        onChange={(e) => handleSummaryChange(index, 'totalQuantity', e.target.value)}
                                                        variant="outlined"
                                                        inputProps={{ style: { textAlign: 'center' } }}
                                                    />
                                                </TableCell>
                                                <TableCell style={{ padding: '8px' }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={item.boxType}
                                                        onChange={(e) => handleSummaryChange(index, 'boxType', e.target.value)}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell style={{ padding: '8px' }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        value={item.productPrice}
                                                        onChange={(e) => handleSummaryChange(index, 'productPrice', e.target.value)}
                                                        variant="outlined"
                                                        inputProps={{ style: { textAlign: 'right' } }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" style={{ padding: '8px' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                        {item.totalPrice?.toLocaleString()} 원
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center" style={{ padding: '8px' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveRow(index)}
                                                        sx={{ color: '#ef4444' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* 스낵바 */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default DayEditPage;
