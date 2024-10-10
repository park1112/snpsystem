import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Grid, Card, CardHeader, CardContent,
    TextField, Button, MenuItem, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle,
    DialogContent, DialogActions
} from '@mui/material';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReturnDetailDialog from './components/ReturnDetailDialog'
import dayjs from 'dayjs';

const ReturnManagement = () => {
    const [markets, setMarkets] = useState([]);
    const [members, setMembers] = useState([]);
    const [returnData, setReturnData] = useState({
        receiptDate: dayjs().format('YYYY-MM-DD'),
        returnNumber: '', // 새로운 필드 추가
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
    const [selectedReturn, setSelectedReturn] = useState(null);

    useEffect(() => {
        fetchMarkets();
        fetchMembers();
        fetchReturns();
    }, []);

    const fetchMarkets = async () => {
        const snapshot = await getDocs(collection(db, 'open_market'));
        setMarkets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchMembers = async () => {
        const snapshot = await getDocs(collection(db, 'markets'));
        setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchReturns = async () => {
        const q = query(collection(db, 'returns'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setReturns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReturnData({
            ...returnData,
            [name]: name === 'returnQuantity' || name === 'returnAmount' ? Number(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, 'returns'), {
                ...returnData,
                returnQuantity: Number(returnData.returnQuantity),
                returnAmount: Number(returnData.returnAmount),
                receiveStatus: '접수',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log("Document written with ID: ", docRef.id);
            setReturnData({
                receiptDate: dayjs().format('YYYY-MM-DD'),
                returnNumber: '', // 초기화에 추가
                productName: '',
                returnQuantity: '',
                returnAmount: '',
                returnReason: '',
                returnMarket: '',
                returnMember: '',
            });
            fetchReturns();
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const handleEdit = (returnItem) => {
        setEditingReturn(returnItem);
        setReturnData({
            ...returnItem,
            receiptDate: dayjs(returnItem.receiptDate).format('YYYY-MM-DD')
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const returnRef = doc(db, 'returns', editingReturn.id);
            await updateDoc(returnRef, {
                ...returnData,
                returnQuantity: Number(returnData.returnQuantity),
                returnAmount: Number(returnData.returnAmount),
                updatedAt: new Date()
            });
            console.log("문서가 성공적으로 업데이트되었습니다.");
            setEditingReturn(null);
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
            fetchReturns();
        } catch (error) {
            console.error("문서 업데이트 중 오류 발생: ", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
            try {
                await deleteDoc(doc(db, 'returns', id));
                console.log("문서가 성공적으로 삭제되었습니다.");
                fetchReturns();
            } catch (error) {
                console.error("문서 삭제 중 오류 발생: ", error);
            }
        }
    };


    const handleRowClick = (returnItem) => {
        setSelectedReturn(returnItem);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                반품 관리
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title={editingReturn ? "반품 수정" : "반품 접수"} />
                        <CardContent>
                            <form onSubmit={editingReturn ? handleUpdate : handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="접수일"
                                    type="date"
                                    name="receiptDate"
                                    value={returnData.receiptDate}
                                    onChange={handleInputChange}
                                    InputLabelProps={{ shrink: true }}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    select
                                    label="반품 오픈마켓"
                                    name="returnMarket"
                                    value={returnData.returnMarket}
                                    onChange={handleInputChange}
                                    margin="normal"
                                >
                                    {markets.map((market) => (
                                        <MenuItem key={market.id} value={market.id}>
                                            {market.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    select
                                    label="반품 회원"
                                    name="returnMember"
                                    value={returnData.returnMember}
                                    onChange={handleInputChange}
                                    margin="normal"
                                >
                                    {members.map((member) => (
                                        <MenuItem key={member.id} value={member.id}>
                                            {member.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    fullWidth
                                    label="반품접수번호"
                                    name="returnNumber"
                                    value={returnData.returnNumber}
                                    onChange={handleInputChange}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="상품 이름"
                                    name="productName"
                                    value={returnData.productName}
                                    onChange={handleInputChange}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="반품 수량"
                                    name="returnQuantity"
                                    type="number"
                                    value={returnData.returnQuantity}
                                    onChange={handleInputChange}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="반품 금액"
                                    name="returnAmount"
                                    type="number"
                                    value={returnData.returnAmount}
                                    onChange={handleInputChange}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="반품 사유"
                                    name="returnReason"
                                    value={returnData.returnReason}
                                    onChange={handleInputChange}
                                    margin="normal"
                                />

                                <Button type="submit" variant="contained" color="primary" fullWidth>
                                    {editingReturn ? "반품 수정" : "반품 접수"}
                                </Button>
                                {editingReturn && (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        fullWidth
                                        onClick={() => setEditingReturn(null)}
                                        style={{ marginTop: '10px' }}
                                    >
                                        수정 취소
                                    </Button>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="반품 목록" />
                        <CardContent>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>상품명</TableCell>
                                            <TableCell>수량</TableCell>
                                            <TableCell>금액</TableCell>
                                            <TableCell>오픈마켓</TableCell>
                                            <TableCell>회원</TableCell>
                                            <TableCell>상태</TableCell>
                                            <TableCell>작업</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {returns.map((returnItem) => (
                                            <TableRow
                                                key={returnItem.id}
                                                onClick={() => handleRowClick(returnItem)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <TableCell>{returnItem.productName}</TableCell>
                                                <TableCell>{returnItem.returnQuantity}</TableCell>
                                                <TableCell>{returnItem.returnAmount.toLocaleString()}원</TableCell>
                                                <TableCell>{markets.find(m => m.id === returnItem.returnMarket)?.name || '알 수 없음'}</TableCell>
                                                <TableCell>{members.find(m => m.id === returnItem.returnMember)?.name || '알 수 없음'}</TableCell>
                                                <TableCell>{returnItem.receiveStatus}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(returnItem);
                                                        }}
                                                        style={{ marginRight: '8px' }}
                                                    >
                                                        수정
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="secondary"
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(returnItem.id);
                                                        }}
                                                    >
                                                        삭제
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <ReturnDetailDialog
                    open={openDialog}
                    handleClose={handleCloseDialog}
                    selectedReturn={selectedReturn}
                    markets={markets}
                    members={members}
                />
            </Dialog>
        </Container>
    );
};

export default ReturnManagement;