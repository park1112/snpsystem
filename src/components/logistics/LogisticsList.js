import { useState, useEffect } from 'react';
import { TextField, Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, TableContainer, Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SortableTableHeader from '../SortableTableHeader';

const LogisticsList = () => {
    const [logistics, setLogistics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('name');
    const [orderDirection, setOrderDirection] = useState('asc');
    const router = useRouter();

    useEffect(() => {
        const fetchLogistics = async () => {
            const querySnapshot = await getDocs(collection(db, 'logistics'));
            const logisticsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
                };
            });
            setLogistics(logisticsData);
        };

        fetchLogistics();
    }, []);

    const filteredLogistics = logistics.filter(logistic =>
        logistic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteLogistic = async (id) => {
        if (confirm('Are you sure you want to delete this logistics equipment?')) {
            await deleteDoc(doc(db, 'logistics', id));
            setLogistics(logistics.filter(logistic => logistic.id !== id));
        }
    };

    const handleSort = (property, direction) => {
        setOrderBy(property);
        setOrderDirection(direction);
    };

    const sortedLogistics = [...filteredLogistics].sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return orderDirection === 'asc' ? -1 : 1;
        if (a[orderBy] > b[orderBy]) return orderDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const columns = [
        { id: 'name', label: 'Name' },
        { id: 'category', label: 'Category' },
        { id: 'company', label: 'Company' },
        { id: 'contactPerson', label: 'Contact Person' },
        { id: 'phone', label: 'Phone' },
        { id: 'price', label: 'Price' },
        { id: 'quantity', label: 'Quantity' },
        { id: 'accountNumber', label: 'Account Number' }
    ];

    return (
        <Box mt={5}>
            <Typography variant="h4" gutterBottom>Logistics Equipment</Typography>
            <TextField
                label="Search Logistics Equipment"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                margin="normal"
                fullWidth
            />
            <Button variant="contained" color="primary" onClick={() => router.push('/logistics/add')} sx={{ mt: 2, mb: 2 }}>
                Add Logistics Equipment
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
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedLogistics.map((logistic, index) => (
                            <TableRow
                                key={logistic.id}
                                sx={{
                                    backgroundColor: index % 2 === 1 ? 'rgba(240, 240, 240, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                                    '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)', cursor: 'pointer' }
                                }}
                                onClick={() => {
                                    console.log('Row clicked, ID:', logistic.id);
                                    router.push(`/logistics/${logistic.id}`);
                                }}
                            >
                                <TableCell>{logistic.name}</TableCell>
                                <TableCell>{logistic.category}</TableCell>
                                <TableCell>{logistic.company}</TableCell>
                                <TableCell>{logistic.contactPerson}</TableCell>
                                <TableCell>{logistic.phone}</TableCell>
                                <TableCell>{logistic.price}</TableCell>
                                <TableCell>{logistic.quantity}</TableCell>
                                <TableCell>{logistic.accountNumber}</TableCell>
                                <TableCell>
                                    <IconButton onClick={(e) => { e.stopPropagation(); router.push(`/logistics/${logistic.id}/edit`); }}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteLogistic(logistic.id); }}>
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

export default LogisticsList;
