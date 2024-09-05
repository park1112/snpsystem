import { useState, useEffect } from 'react';
import { TextField, Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, TableContainer, Paper, Chip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SortableTableHeader from '../SortableTableHeader';

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('name');
    const [orderDirection, setOrderDirection] = useState('asc');
    const router = useRouter();

    useEffect(() => {
        const fetchWarehouses = async () => {
            const querySnapshot = await getDocs(collection(db, 'warehouses'));
            const warehousesData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
                };
            });
            setWarehouses(warehousesData);
        };

        fetchWarehouses();
    }, []);

    const filteredWarehouses = warehouses.filter(warehouse =>
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteWarehouse = async (id) => {
        if (confirm('정말로 이 창고를 삭제하시겠습니까?')) {
            await deleteDoc(doc(db, 'warehouses', id));
            setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
        }
    };

    const handleSort = (property, direction) => {
        setOrderBy(property);
        setOrderDirection(direction);
    };

    const sortedWarehouses = [...filteredWarehouses].sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return orderDirection === 'asc' ? -1 : 1;
        if (a[orderBy] > b[orderBy]) return orderDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const columns = [
        { id: 'name', label: '창고명' },
        { id: 'master', label: '관리자' },
        { id: 'phone', label: '연락처' },
        { id: 'status', label: '상태' }
    ];

    const getStatusChip = (status) => {
        let color = 'default';
        let label = '알 수 없음';

        switch (status) {
            case true:
                color = 'success';
                label = '활성';
                break;
            case false:
                color = 'error';
                label = '비활성';
                break;
        }

        return <Chip label={label} color={color} size="small" />;
    };

    return (
        <Box mt={5}>
            <Typography variant="h4" gutterBottom>창고 목록</Typography>
            <TextField
                label="창고 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                margin="normal"
                fullWidth
            />
            <Button variant="contained" color="primary" onClick={() => router.push('/warehouses/add')} sx={{ mt: 2, mb: 2 }}>
                창고 추가
            </Button>
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
                            <TableCell>작업</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedWarehouses.map((warehouse, index) => (
                            <TableRow
                                key={warehouse.id}
                                sx={{
                                    backgroundColor: index % 2 === 1 ? 'rgba(240, 240, 240, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                                    '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)', cursor: 'pointer' }
                                }}
                            >
                                <TableCell onClick={() => router.push(`/warehouses/${warehouse.id}`)}>{warehouse.name}</TableCell>
                                <TableCell onClick={() => router.push(`/warehouses/${warehouse.id}`)}>{warehouse.master}</TableCell>
                                <TableCell onClick={() => router.push(`/warehouses/${warehouse.id}`)}>{warehouse.phone}</TableCell>
                                <TableCell onClick={() => router.push(`/warehouses/${warehouse.id}`)}>
                                    {getStatusChip(warehouse.status)}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={(e) => { e.stopPropagation(); router.push(`/warehouses/${warehouse.id}/edit`); }}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteWarehouse(warehouse.id); }}>
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

export default WarehouseList;