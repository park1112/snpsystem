import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    CircularProgress,
} from '@mui/material';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { useRouter } from 'next/router';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useUser } from '../../contexts/UserContext';

const ChecklistResultsListPage = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const router = useRouter();
    const { user } = useUser();

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const q = query(collection(db, 'checklist_results'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const fetchedResults = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toLocaleString() || 'Unknown'
            }));
            setResults(fetchedResults);
        } catch (error) {
            console.error('결과 로딩 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (resultId) => {
        router.push(`/check-list/detail/${resultId}`);
    };

    const handleEditClick = (event, resultId) => {
        event.stopPropagation();
        router.push(`/check-list?id=${resultId}`);
    };

    const handleDeleteClick = (event, resultId) => {
        event.stopPropagation();
        setDeleteTargetId(resultId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deleteTargetId) {
            try {
                await deleteDoc(doc(db, 'checklist_results', deleteTargetId));
                setResults(results.filter(result => result.id !== deleteTargetId));
                setDeleteDialogOpen(false);
                setDeleteTargetId(null);
            } catch (error) {
                console.error('삭제 오류:', error);
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setDeleteTargetId(null);
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    체크리스트 결과 로딩 중...
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                체크리스트 결과 목록
            </Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="체크리스트 결과 테이블">
                    <TableHead>
                        <TableRow>
                            <TableCell>이름</TableCell>
                            <TableCell align="right">총점</TableCell>
                            <TableCell align="right">작성자</TableCell>
                            <TableCell align="right">생성 일시</TableCell>
                            <TableCell align="right">작업</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((result) => (
                            <TableRow
                                key={result.id}
                                hover
                                onClick={() => handleViewDetails(result.id)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell component="th" scope="row">
                                    {result.personalInfo?.name || '알 수 없음'}
                                </TableCell>
                                <TableCell align="right">{result.totalScore.toFixed(2)}%</TableCell>
                                <TableCell align="right">{result.author?.name || '알 수 없음'}</TableCell>
                                <TableCell align="right">{result.createdAt}</TableCell>
                                <TableCell align="right">
                                    {user && user.uid === result.author?.id && (
                                        <>
                                            <IconButton
                                                onClick={(event) => handleEditClick(event, result.id)}
                                                sx={{ '&:hover': { color: 'primary.main' } }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={(event) => handleDeleteClick(event, result.id)}
                                                sx={{ '&:hover': { color: 'error.main' } }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"체크리스트 결과 삭제"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        정말로 이 체크리스트 결과를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>취소</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};


export default ChecklistResultsListPage;