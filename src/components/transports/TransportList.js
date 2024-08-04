import { useState, useEffect } from 'react';
import { TextField, Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, TableContainer, Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SortableTableHeader from '../SortableTableHeader';

const TransportList = () => {
    const [transports, setTransports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('name');
    const [orderDirection, setOrderDirection] = useState('asc');
    const router = useRouter();

    useEffect(() => {
        const fetchTransports = async () => {
            const querySnapshot = await getDocs(collection(db, 'transports'));
            const transportsData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
                };
            });
            setTransports(transportsData);
        };

        fetchTransports();
    }, []);

    const filteredTransports = transports.filter(transport =>
        transport.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteTransport = async (id) => {
        if (confirm('Are you sure you want to delete this transport company?')) {
            await deleteDoc(doc(db, 'transports', id));
            setTransports(transports.filter(transport => transport.id !== id));
        }
    };

    const handleSort = (property, direction) => {
        setOrderBy(property);
        setOrderDirection(direction);
    };

    const sortedTransports = [...filteredTransports].sort((a, b) => {
        if (a[orderBy] < b[orderBy]) return orderDirection === 'asc' ? -1 : 1;
        if (a[orderBy] > b[orderBy]) return orderDirection === 'asc' ? 1 : -1;
        return 0;
    });

    const columns = [
        { id: 'name', label: 'Name' },
        { id: 'vehicleNumber', label: 'Vehicle Number' },
        { id: 'phone', label: 'Phone' },
        { id: 'affiliation', label: 'Affiliation' },
        { id: 'accountNumber', label: 'Account Number' }
    ];

    return (
        <Box mt={5}>
            <Typography variant="h4" gutterBottom>Transport Companies</Typography>
            <TextField
                label="Search Transport Companies"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                margin="normal"
                fullWidth
                sx={{ mb: 3 }}
            />
            <Button variant="contained" color="primary" onClick={() => router.push('/transports/add')} sx={{ mb: 3 }}>
                Add Transport Company
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
                        {sortedTransports.map((transport, index) => (
                            <TableRow
                                key={transport.id}
                                sx={{
                                    backgroundColor: index % 2 === 1 ? 'rgba(240, 240, 240, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                                    '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)', cursor: 'pointer' }
                                }}
                                onClick={() => router.push(`/transports/${transport.id}`)}
                            >
                                <TableCell>{transport.name}</TableCell>
                                <TableCell>{transport.vehicleNumber}</TableCell>
                                <TableCell>{transport.phone}</TableCell>
                                <TableCell>{transport.affiliation}</TableCell>
                                <TableCell>{transport.accountNumber}</TableCell>
                                <TableCell>
                                    <IconButton onClick={(e) => { e.stopPropagation(); router.push(`/transports/${transport.id}/edit`); }}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteTransport(transport.id); }}>
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

export default TransportList;
