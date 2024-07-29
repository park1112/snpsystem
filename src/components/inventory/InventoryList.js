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
import { collection, getDocs, deleteDoc, doc, runTransaction, deleteField } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SortableTableHeader from '../SortableTableHeader';
import DeleteInventoryItem from './DeleteInventoryItem';

const InventoryList = () => {
  const [inventories, setInventories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('productName');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        console.log('Fetching inventories...');
        const querySnapshot = await getDocs(collection(db, 'inventory'));
        const inventoriesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log('Inventories Data:', inventoriesData);
        setInventories(inventoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventories:', error);
        setError('Failed to load inventories');
        setLoading(false);
      }
    };

    fetchInventories();
  }, []);

  const handleStart = () => {
    router.push('/inventory/select');
  };

  const filteredInventories = inventories.filter((inventory) =>
    (inventory.productName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteInventory = (deletedId) => {
    setInventories(inventories.filter((inv) => inv.id !== deletedId));
  };

  const handleSort = (property, direction) => {
    setOrderBy(property);
    setOrderDirection(direction);
  };

  const sortedInventories = [...filteredInventories].sort((a, b) => {
    if ((a[orderBy] || '').toLowerCase() < (b[orderBy] || '').toLowerCase()) return orderDirection === 'asc' ? -1 : 1;
    if ((a[orderBy] || '').toLowerCase() > (b[orderBy] || '').toLowerCase()) return orderDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const columns = [
    { id: 'warehouseName', label: 'Warehouse' },
    { id: 'productName', label: '상품이름' },
    { id: 'quantity', label: '수량' },
    { id: 'logisticsName', label: '바렛트종류' },
    { id: 'logisticsQuantity', label: '바렛트수량' },
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
        Inventories
      </Typography>
      <TextField
        label="Search Inventories"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={() => router.push('/inventory/add')} sx={{ mt: 2, mb: 2 }}>
        Add Inventory
      </Button>
      <Box mt={5}>
        <Typography variant="h4" gutterBottom>
          Inventory Management
        </Typography>
        <Button variant="contained" color="primary" onClick={handleStart} sx={{ mt: 2, mb: 2 }}>
          창고선택
        </Button>
      </Box>
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
            {sortedInventories.map((inventory, index) => (
              <TableRow
                key={inventory.id}
                sx={{
                  backgroundColor: index % 2 === 1 ? 'rgba(240, 240, 240, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)', cursor: 'pointer' },
                }}
                onClick={() => router.push(`/inventory/${inventory.id}`)}
              >
                <TableCell>{inventory.warehouseName || 'N/A'}</TableCell>
                <TableCell>{inventory.productName || 'N/A'}</TableCell>
                <TableCell>{inventory.quantity || 'N/A'}</TableCell>
                <TableCell>{inventory.logisticsName || 'N/A'}</TableCell>
                <TableCell>{inventory.logisticsQuantity || 'N/A'}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/inventory/${inventory.id}/edit`);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <DeleteInventoryItem inventory={inventory} onDelete={handleDeleteInventory} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryList;
