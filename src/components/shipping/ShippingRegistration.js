import { useState, useEffect } from 'react';
import {
    TextField,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Paper,
    CircularProgress,
    Button,
    Grid,
} from '@mui/material';
import { useRouter } from 'next/router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SortableTableHeader from '../SortableTableHeader';

const ShippingRegistration = () => {
    const [partners, setPartners] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('name');
    const [orderDirection, setOrderDirection] = useState('asc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching partners...');
                const partnersSnapshot = await getDocs(collection(db, 'partners'));
                const partnersData = partnersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                console.log('Partners Data:', partnersData);
                setPartners(partnersData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredPartners = partners.filter((partner) =>
        partner.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSort = (property, direction) => {
        setOrderBy(property);
        setOrderDirection(direction);
    };

    const sortedPartners = [...filteredPartners].sort((a, b) => {
        if (a[orderBy].toLowerCase() < b[orderBy].toLowerCase()) return orderDirection === 'asc' ? -1 : 1;
        if (a[orderBy].toLowerCase() > b[orderBy].toLowerCase()) return orderDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const handleAddShipping = (partner) => {
        router.push({
            pathname: '/shipping/add',
            query: {
                partnerId: partner.id,
                partnerName: partner.name,
                lastShippingDate: partner.lastShippingDate || '',
                lastPalletQuantity: partner.lastPalletQuantity || '0',
                lastTotalQuantity: partner.lastTotalQuantity || '0',
            },
        });
    };

    const columns = [
        { id: 'date', label: '날짜' },
        { id: 'name', label: '거래처' },
        { id: 'palletQuantity', label: '바렛트 수량' },
        { id: 'totalQuantity', label: '총 수량' },
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
                출고 등록
            </Typography>
            <TextField
                label="거래처 검색"
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
                        {sortedPartners.map((partner) => (
                            <TableRow
                                key={partner.id}
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                    '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)', cursor: 'pointer' },
                                }}
                            >
                                <TableCell>{partner.lastShippingDate || 'N/A'}</TableCell>
                                <TableCell>{partner.name}</TableCell>
                                <TableCell>{partner.lastPalletQuantity || 0}</TableCell>
                                <TableCell>{partner.lastTotalQuantity || 0}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleAddShipping(partner)}
                                    >
                                        출고 등록
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ShippingRegistration;