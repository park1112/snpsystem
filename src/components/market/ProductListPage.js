import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, IconButton, Snackbar
} from '@mui/material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { db } from '../../utils/firebase';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'market_products'));
                const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(productsData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching products: ", error);
                setSnackbar({ open: true, message: '상품 데이터를 불러오는 데 실패했습니다.', severity: 'error' });
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleEdit = (productId) => {
        router.push(`/market/edit/${productId}`);
    };

    const handleDelete = async (productId) => {
        try {
            await deleteDoc(doc(db, 'market_products', productId));
            setProducts(prev => prev.filter(product => product.id !== productId));
            setSnackbar({ open: true, message: '상품이 성공적으로 삭제되었습니다.', severity: 'success' });
        } catch (error) {
            console.error("Error deleting product: ", error);
            setSnackbar({ open: true, message: '상품 삭제 중 오류가 발생했습니다.', severity: 'error' });
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                상품 리스트
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>등록된 상품명</TableCell>
                            <TableCell>택배 상품명</TableCell>
                            <TableCell>상품 가격</TableCell>
                            <TableCell>박스타입</TableCell>
                            <TableCell>설정수량</TableCell>
                            <TableCell>마진</TableCell>
                            <TableCell align="right">수정</TableCell>
                            <TableCell align="right">삭제</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.registeredProductName}</TableCell>
                                <TableCell>{product.deliveryProductName}</TableCell>
                                <TableCell>{product.productPrice}</TableCell>
                                <TableCell>{product.boxType}</TableCell>
                                <TableCell>{product.count}</TableCell>
                                <TableCell>{product.margin}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleEdit(product.id)}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleDelete(product.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                message={snackbar.message}
                severity={snackbar.severity}
            />
        </Container>
    );
};

export default ProductListPage;
