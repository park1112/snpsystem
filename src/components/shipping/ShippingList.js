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
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
            await deleteDoc(doc(db, 'shipping', id));
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
        { id: 'totalQuantity', label: '총 수량' },
        { id: 'totalCount', label: '총 카운트' },
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
                                <TableCell>{shipping.totalQuantity || 'N/A'}</TableCell>
                                <TableCell>{shipping.totalCount || 'N/A'}</TableCell>
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
