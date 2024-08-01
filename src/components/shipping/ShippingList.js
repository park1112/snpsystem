import { useState, useEffect } from 'react';
import {
    TextField,
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    IconButton,
    TableContainer,
    Paper,
    CircularProgress,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc, getDoc, runTransaction } from 'firebase/firestore';
// 기존 코드에서 runTransaction을 추가로 가져옵니다.



import { db } from '../../utils/firebase';
import SortableTableHeader from '../SortableTableHeader';

const ShippingList = () => {
    const [shippings, setShippings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('createdAt');
    const [orderDirection, setOrderDirection] = useState('desc'); // 최신순 정렬
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchShippings = async () => {
            try {
                console.log('Fetching shippings...');
                const querySnapshot = await getDocs(collection(db, 'shipping'));
                const shippingsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                console.log('Shippings Data:', shippingsData);
                setShippings(shippingsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching shippings:', error);
                setError('Failed to load shippings');
                setLoading(false);
            }
        };

        fetchShippings();
    }, []);

    const handleDeleteShipping = async (id) => {
        try {
            await runTransaction(db, async (transaction) => {
                // 1. 모든 읽기 작업
                const shippingDocRef = doc(db, 'shipping', id);
                const shippingDoc = await transaction.get(shippingDocRef);

                if (!shippingDoc.exists()) {
                    throw new Error('Shipping document does not exist');
                }

                const shippingData = shippingDoc.data();
                const { partnerId, items } = shippingData;

                // 파트너 문서 읽기
                let partnerData = null;
                if (partnerId) {
                    const partnerRef = doc(db, 'partners', partnerId);
                    const partnerDoc = await transaction.get(partnerRef);
                    if (partnerDoc.exists()) {
                        partnerData = partnerDoc.data();
                    }
                }

                // 창고 및 인벤토리 문서 읽기
                const warehouseRefs = [];
                const inventoryRefs = [];
                for (const item of items) {
                    if (item.warehouseId && item.inventoryUids) {
                        const warehouseRef = doc(db, 'warehouses', item.warehouseId);
                        const inventoryRef = doc(db, 'inventory', item.inventoryUids);
                        if (warehouseRef && inventoryRef) { // 참조 객체가 올바른지 확인
                            warehouseRefs.push(warehouseRef);
                            inventoryRefs.push(inventoryRef);
                        }
                    }
                }


                // 2. 모든 쓰기 작업
                // 출하 기록 삭제
                transaction.delete(shippingDocRef);

                // 파트너 문서에서 출하 기록 삭제
                if (partnerId && partnerData) {
                    const updatedShippingHistory = (partnerData.shippingHistory || []).filter(
                        (entry) => entry.shippingId !== id
                    );
                    const partnerRef = doc(db, 'partners', partnerId);
                    if (partnerRef) { // 참조 객체가 올바른지 확인
                        transaction.update(partnerRef, { shippingHistory: updatedShippingHistory });
                    }
                }

                // 창고 및 인벤토리 데이터 업데이트
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const warehouseRef = warehouseRefs[i];
                    const inventoryRef = inventoryRefs[i];

                    if (warehouseRef && inventoryRef) { // 참조 객체가 올바른지 확인
                        // 인벤토리 상태 업데이트
                        transaction.update(inventoryRef, {
                            status: 'inStock', // 재고로 다시 전환
                            shippingDate: null,
                            partnerId: null
                        });

                        // 창고 데이터 업데이트
                        const warehouseDoc = await transaction.get(warehouseRef);
                        if (warehouseDoc.exists()) {
                            const warehouseData = warehouseDoc.data();
                            const statusData = warehouseData.statuses[item.status];
                            const productData = statusData.products[item.productId];

                            // 상품 수량 복원
                            productData.count += item.count;
                            productData.inventoryUids.push(item.inventoryId);

                            transaction.update(warehouseRef, {
                                [`statuses.${item.status}.products.${item.productId}`]: productData
                            });
                        }
                    }
                }
            });

            // 로컬 상태 업데이트
            setShippings(shippings.filter((shipping) => shipping.id !== id));
        } catch (error) {
            console.error('Error deleting shipping:', error);
            setError('Failed to delete shipping');
        }
    };



    const filteredShippings = shippings.filter((shipping) =>
        (shipping.partnerName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSort = (property, direction) => {
        setOrderBy(property);
        setOrderDirection(direction);
    };

    const sortedShippings = [...filteredShippings].sort((a, b) => {
        if (orderBy === 'createdAt') {
            return orderDirection === 'asc'
                ? new Date(a[orderBy].seconds * 1000) - new Date(b[orderBy].seconds * 1000)
                : new Date(b[orderBy].seconds * 1000) - new Date(a[orderBy].seconds * 1000);
        } else {
            if ((a[orderBy] || '').toLowerCase() < (b[orderBy] || '').toLowerCase()) return orderDirection === 'asc' ? -1 : 1;
            if ((a[orderBy] || '').toLowerCase() > (b[orderBy] || '').toLowerCase()) return orderDirection === 'asc' ? 1 : -1;
            return 0;
        }
    });

    const columns = [
        { id: 'createdAt', label: '날짜' },
        { id: 'warehouseName', label: '창고' },
        { id: 'partnerName', label: '거래처' },
        { id: 'logisticsQuantity', label: '물류기기' },
        { id: 'totalQuantity', label: '합계' },
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box mt={5}>
            <Typography variant="h4" gutterBottom>
                Shipping List
            </Typography>
            <TextField
                label="Search Shippings"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                margin="normal"
                fullWidth
            />
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <SortableTableHeader
                                columns={columns}
                                orderBy={orderBy}
                                orderDirection={orderDirection}
                                onSort={handleSort}
                            />
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedShippings.map((shipping, index) => (
                            <TableRow
                                key={shipping.id}
                                sx={{
                                    backgroundColor: index % 2 === 1 ? 'rgba(240, 240, 240, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                                    '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)', cursor: 'pointer' },
                                }}
                                onClick={() => router.push(`/shipping/${shipping.id}`)}
                            >
                                <TableCell>{new Date(shipping.createdAt.seconds * 1000).toLocaleString()}</TableCell>
                                <TableCell>{shipping.warehouseName || 'N/A'}</TableCell>
                                <TableCell>{shipping.partnerName || 'N/A'}</TableCell>
                                <TableCell>{shipping.logisticsQuantity || 'N/A'}</TableCell>
                                <TableCell>{shipping.totalQuantity || 'N/A'}</TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/shipping/${shipping.id}/edit`);
                                        }}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteShipping(shipping.id);
                                        }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ShippingList;
