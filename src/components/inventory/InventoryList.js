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
  Pagination,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SortableTableHeader from '../SortableTableHeader';
import DeleteInventoryItem from './DeleteInventoryItem';
import dayjs from 'dayjs';

const InventoryList = () => {
  const [inventories, setInventories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('createdAt');
  const [orderDirection, setOrderDirection] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const router = useRouter();

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        console.log('Fetching inventories...');
        const querySnapshot = await getDocs(collection(db, 'inventory'));
        const inventoriesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : null,
          };
        });
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
    const aValue = a[orderBy] || '';
    const bValue = b[orderBy] || '';
    if (aValue < bValue) return orderDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return orderDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedInventories = sortedInventories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
                columns={[
                  { id: 'warehouseName', label: 'Warehouse' },
                  { id: 'productName', label: '상품이름' },
                  { id: 'quantity', label: '수량' },
                  { id: 'status', label: '상태' },
                  { id: 'logisticsQuantity', label: '바렛트수량' },
                  { id: 'createdAt', label: '생성 날짜' }, // 생성 날짜 추가
                ]}
                orderBy={orderBy}
                orderDirection={orderDirection}
                onSort={handleSort}
              />
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedInventories.map((inventory, index) => (
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
                <TableCell>{inventory.status || 'N/A'}</TableCell>
                <TableCell>{inventory.logisticsQuantity || 'N/A'}</TableCell>
                <TableCell>{inventory.createdAt ? dayjs(inventory.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A'}</TableCell> {/* 생성 날짜 추가 */}
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
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(filteredInventories.length / itemsPerPage)}
          page={currentPage}
          onChange={(e, value) => setCurrentPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default InventoryList;
