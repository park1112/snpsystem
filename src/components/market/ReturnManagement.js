import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Typography, Grid, Card, CardHeader, CardContent,
    TextField, Button, MenuItem, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Dialog,
    CircularProgress
} from '@mui/material';
import {
    collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../../utils/firebase';
import ReturnDetailDialog from './components/ReturnDetailDialog';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';

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
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [loading, setLoading] = useState(true); // 초기 로딩 상태를 true로 설정
    const [submitLoading, setSubmitLoading] = useState(false);
    const isListenerAttached = useRef(false);


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
                console.log('Fetched returns:', fetchedReturns);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            alert('모든 필드를 채워주세요.');
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
            console.log("Document successfully added");

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

            // 새로고침 효과를 주기 위해 반품 목록을 다시 불러옵니다.
            refreshReturns();

        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setSubmitLoading(false);
        }
    };



    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!isFormValid()) {
            alert('모든 필드를 채워주세요.');
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
            console.log("Document successfully updated");

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
        } catch (error) {
            console.error("Error updating document: ", error);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
            setLoading(true);
            try {
                await deleteDoc(doc(db, 'returns', id));
                console.log("Document successfully deleted");
            } catch (error) {
                console.error("Error deleting document: ", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEdit = (returnItem) => {
        setEditingReturn(returnItem);
        setReturnData({
            ...returnItem,
            receiptDate: dayjs(returnItem.receiptDate).format('YYYY-MM-DD')
        });
    };

    const handleRowClick = (returnItem) => {
        setSelectedReturn(returnItem);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const refreshReturns = () => {
        setLoading(true);
        const q = query(collection(db, 'returns'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReturns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('Fetched returns:', fetchedReturns);
            setReturns(fetchedReturns);
            setLoading(false);
        });

        return () => {
            unsubscribe();
        };
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
                                    value={returnData.returnQuantity}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        inputComponent: NumberFormatCustom,
                                    }}
                                    margin="normal"
                                />
                                <TextField
                                    fullWidth
                                    label="반품 금액"
                                    name="returnAmount"
                                    value={returnData.returnAmount}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        inputComponent: NumberFormatCustom,
                                    }}
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
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    disabled={!isFormValid() || submitLoading}
                                >
                                    {submitLoading ? (
                                        <CircularProgress size={24} color="inherit" />
                                    ) : (
                                        editingReturn ? "반품 수정" : "반품 접수"
                                    )}
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
                            {loading ? (
                                <CircularProgress />
                            ) : (
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
                                                    key={returnItem.id || uniqueId('return_')}
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
                            )}
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