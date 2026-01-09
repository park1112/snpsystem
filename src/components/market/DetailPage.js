import React, { useEffect, useState, useRef } from 'react';
import {
    Container, Typography, Grid, Card, CardHeader, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Tooltip, Snackbar, Alert, Box
} from '@mui/material';
import { useRouter } from 'next/router';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import dynamic from 'next/dynamic';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { logActivity, LOG_ACTIONS, LOG_CATEGORIES } from '../../utils/activityLogger';



const DetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const contentRef = useRef(null);
    const [generatePDF, setGeneratePDF] = useState(null);

    // 삭제 다이얼로그 상태
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // 스낵바 상태
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    useEffect(() => {
        import('./SummaryPDF').then(module => {
            setGeneratePDF(() => module.default);
        });
    }, []);

    const fetchData = async (docId) => {
        setLoading(true);
        try {
            const docRef = doc(db, 'daily_summaries', docId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setData(docSnap.data());
            } else {
                setError('No such document!');
            }
        } catch (err) {
            setError('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (data) {
            try {
                const generateSummaryPDF = (await import('./SummaryPDF')).default;
                await generateSummaryPDF(data);
            } catch (error) {
                console.error('PDF 생성 중 오류 발생:', error);
                // 사용자에게 오류 메시지를 표시하는 로직을 여기에 추가할 수 있습니다.
                alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        }
    };


    const downloadExcel = () => {
        const worksheetData = [
            ["Market Name", `${data?.marketName || 'Unknown Market'}`],
            ["총 수량", data?.totalQuantity || 0],
            [],
            ["상품명", "총 수량", "박스 타입", "상품가격", "합계가격"]
        ];

        data?.summary?.forEach(item => {
            const row = [
                item.productName,
                item.totalQuantity,
                item.boxType,
                item.productPrice,
                item.totalPrice
            ];
            worksheetData.push(row);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Detail');

        // 숫자 형식 지정
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            for (let R = range.s.r; R <= range.e.r; ++R) {
                const cellAddress = { c: C, r: R };
                const cellRef = XLSX.utils.encode_cell(cellAddress);
                const cell = worksheet[cellRef];
                if (cell && typeof cell.v === 'number') {
                    if (C >= 3) { // 상품가격과 합계가격 열
                        cell.z = '#,##0';
                    } else if (C === 1 && R <= 1) { // 총 수량 행
                        cell.z = '#,##0';
                    }
                }
            }
        }

        const date = data?.updatedAt ? dayjs(data.updatedAt.toDate()).format('YYYY-MM-DD') : 'Unknown_Date';
        const fileName = `${data?.marketName || 'Unknown Market'}_${date}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    // 수정 페이지로 이동
    const handleEdit = () => {
        router.push(`/market/day-edit/${id}`);
    };

    // 삭제 다이얼로그 열기
    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    // 삭제 다이얼로그 닫기
    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    // 삭제 확인
    const handleDeleteConfirm = async () => {
        setDeleting(true);
        try {
            const docRef = doc(db, 'daily_summaries', id);
            await deleteDoc(docRef);

            // 로그 기록
            await logActivity({
                action: LOG_ACTIONS.DELETE,
                category: LOG_CATEGORIES.DAILY_SUMMARIES,
                targetId: id,
                targetName: data?.marketName || 'Unknown',
                description: `출고상품 "${data?.marketName || 'Unknown'}" 삭제`,
            });

            setSnackbar({ open: true, message: '삭제되었습니다.', severity: 'success' });
            setDeleteDialogOpen(false);
            // 삭제 후 목록 페이지로 이동
            setTimeout(() => {
                router.push('/market/day-list');
            }, 1000);
        } catch (err) {
            console.error('삭제 중 오류 발생:', err);
            setSnackbar({ open: true, message: '삭제 중 오류가 발생했습니다.', severity: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    // 뒤로 가기
    const handleBack = () => {
        router.push('/market/day-list');
    };

    // 스낵바 닫기
    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };


    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="md">
            {/* 상단 네비게이션 */}
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{ color: '#374151' }}
                >
                    목록으로
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="수정">
                        <IconButton
                            onClick={handleEdit}
                            sx={{
                                bgcolor: '#667eea',
                                color: 'white',
                                '&:hover': { bgcolor: '#5a6fd6' }
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                        <IconButton
                            onClick={handleDeleteClick}
                            sx={{
                                bgcolor: '#ef4444',
                                color: 'white',
                                '&:hover': { bgcolor: '#dc2626' }
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Card>
                <CardHeader title={`상세보기 - ${data?.marketName || 'Unknown Market'}`} />
                <CardContent ref={contentRef}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                날짜: {data?.updatedAt
                                    ? dayjs(data.updatedAt.toDate()).format('YYYY-MM-DD HH:mm')
                                    : 'N/A'}
                            </Typography>
                            {data?.addDate && Array.isArray(data.addDate) && data.addDate.length > 0 && (
                                <Typography variant="h6">
                                    추가된 시간:
                                    <ul>
                                        {data.addDate.map((date, index) => (
                                            <li key={index}>{dayjs(date.toDate()).format('YYYY-MM-DD HH:mm')}</li>
                                        ))}
                                    </ul>
                                </Typography>
                            )}
                            <Typography variant="h6">총 수량: {data?.totalQuantity}</Typography>
                            <Typography variant="h6">총 합계가격: {data?.totalPrice.toLocaleString()} 원</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TableContainer component={Paper} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow style={{ backgroundColor: '#f0f0f0' }}>
                                            <TableCell style={{ padding: '16px', fontWeight: 'bold' }}>상품명</TableCell>
                                            <TableCell align="right" style={{ padding: '16px', fontWeight: 'bold' }}>총 수량</TableCell>
                                            <TableCell style={{ padding: '16px', fontWeight: 'bold' }}>박스 타입</TableCell>
                                            <TableCell align="right" style={{ padding: '16px', fontWeight: 'bold' }}>상품가격</TableCell>
                                            <TableCell align="right" style={{ padding: '16px', fontWeight: 'bold' }}>합계가격</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data?.summary?.map((item, index) => (
                                            <TableRow
                                                key={index}
                                                style={{
                                                    backgroundColor: index % 2 !== 0 ? '#f9f9f9' : 'inherit',
                                                    borderRadius: index === data.summary.length - 1 ? '0 0 12px 12px' : '0',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <TableCell style={{ padding: '16px' }}>{item.productName}</TableCell>
                                                <TableCell align="right" style={{ padding: '16px' }}>{item.totalQuantity}</TableCell>
                                                <TableCell style={{ padding: '16px' }}>{item.boxType}</TableCell>
                                                <TableCell align="right" style={{ padding: '16px' }}>{item.productPrice.toLocaleString()} 원</TableCell>
                                                <TableCell align="right" style={{ padding: '16px' }}>{item.totalPrice.toLocaleString()} 원</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                        <Grid item xs={12} container justifyContent="flex-end" spacing={2} style={{ marginTop: '16px' }}>
                            <Grid item className="no-print">
                                <Button variant="contained" color="primary" onClick={downloadPDF}>
                                    PDF 다운로드
                                </Button>
                            </Grid>
                            <Grid item className="no-print">
                                <Button variant="contained" color="secondary" onClick={downloadExcel}>
                                    Excel 다운로드
                                </Button>
                            </Grid>

                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }

                    #content, #content * {
                        visibility: visible;
                    }

                    #content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>

            {/* 삭제 확인 다이얼로그 */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    삭제 확인
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        "{data?.marketName}" ({data?.updatedAt ? dayjs(data.updatedAt.toDate()).format('YYYY-MM-DD') : 'N/A'}) 데이터를 삭제하시겠습니까?
                        <br />
                        <Typography color="error" component="span" sx={{ fontWeight: 'bold' }}>
                            이 작업은 되돌릴 수 없습니다.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={deleting}>
                        취소
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                    >
                        {deleting ? <CircularProgress size={20} /> : '삭제'}
                    </Button>
                </DialogActions>
            </Dialog>

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

export default DetailPage;
