import React, { useState, useEffect } from 'react';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Typography, CircularProgress, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material';
import { collection, addDoc, updateDoc, doc, getDoc, setDoc, increment, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';

// 재고 업데이트 함수
const updateInventory = async (productName, quantity) => {
    const inventoryRef = doc(db, 'inventory', productName);
    const inventoryDoc = await getDoc(inventoryRef);

    if (inventoryDoc.exists()) {
        await updateDoc(inventoryRef, {
            quantity: increment(quantity)
        });
    } else {
        await setDoc(inventoryRef, { quantity });
    }
};

// 출고 처리 시 재고 업데이트 함수
const handleStockOut = async (productName, quantity) => {
    await updateInventory(productName, -quantity);
};

// 입고 관리 컴포넌트
const StockInForm = () => {
    const [open, setOpen] = useState(false);
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStockIn = async () => {
        if (!productName || !quantity) {
            alert('상품명과 수량을 모두 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            // 입고 정보를 'stock_in' 컬렉션에 저장
            await addDoc(collection(db, 'stock_in'), {
                productName,
                quantity: parseInt(quantity),
                date: new Date()
            });

            // 재고 업데이트
            await updateInventory(productName, parseInt(quantity));

            setOpen(false);
            setProductName('');
            setQuantity('');
            alert('입고 처리가 완료되었습니다.');
        } catch (error) {
            console.error("Error processing stock in:", error);
            alert('입고 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setOpen(true)} variant="contained" color="primary">
                입고 등록
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>입고 등록</DialogTitle>
                <DialogContent>
                    <TextField
                        label="상품명"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="수량"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} disabled={loading}>취소</Button>
                    <Button onClick={handleStockIn} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : '등록'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// 재고 조회 컴포넌트
const InventoryViewer = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const inventorySnapshot = await getDocs(collection(db, 'inventory'));
            const inventoryData = inventorySnapshot.docs.map(doc => ({
                productName: doc.id,
                quantity: doc.data().quantity
            }));
            setInventory(inventoryData);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            alert('재고 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    return (
        <>
            <Typography variant="h6" gutterBottom>
                현재 재고 현황
            </Typography>
            <Button onClick={fetchInventory} disabled={loading} variant="outlined" style={{ marginBottom: '1rem' }}>
                재고 새로고침
            </Button>
            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>상품명</TableCell>
                                <TableCell align="right">수량</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventory.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell align="right">{item.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
};

export { StockInForm, InventoryViewer, updateInventory, handleStockOut };