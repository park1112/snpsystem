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

import dayjs from 'dayjs';
import { getKoreanStatus } from '../CommonStatus';
import { deleteInventoryTransaction } from '../../services/inventoryService';

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
        const querySnapshot = await getDocs(collection(db, 'inventories'));
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

  const handleDelete = async (inventoryUid) => {
    if (!window.confirm("정말로 이 인벤토리와 관련된 모든 데이터를 삭제하시겠습니까?")) {
      return;
    }

    try {
      console.log("인벤토리 아이템 삭제 시작, inventoryUid:", inventoryUid);

      // 인벤토리 아이템 삭제
      await deleteInventoryTransaction(inventoryUid);

      console.log("인벤토리 아이템 삭제 완료");

      // 삭제된 인벤토리를 상태에서 제거하여 리랜더링 트리거
      handleDeleteInventory(inventoryUid);
      alert('인벤토리와 물류기기 상태가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('Error deleting inventory:', error);
    }
  };

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
                  { id: 'logistics', label: '물류기기' },
                  { id: 'logisticsQuantity', label: '수량' },
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
                <TableCell>
                  {inventory.products && inventory.products.length > 0 ? (
                    inventory.products.map((product, idx) => (
                      <div key={idx}>{product.productName || 'N/A'}</div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {inventory.products && inventory.products.length > 0 ? (
                    inventory.products.map((product, idx) => (
                      <div key={idx}>{product.quantity || 'N/A'}</div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </TableCell>

                <TableCell>{getKoreanStatus(inventory.status) || 'N/A'}</TableCell> {/* 상태를 한글로 변환 */}
                <TableCell>
                  {inventory.logistics && inventory.logistics.length > 0 ? (
                    inventory.logistics.map((product, idx) => (
                      <div key={idx}>{product.name || 'N/A'}</div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {inventory.logistics && inventory.logistics.length > 0 ? (
                    inventory.logistics.map((product, idx) => (
                      <div key={idx}>{product.unit || 'N/A'}</div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>{inventory.createdAt ? dayjs(inventory.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A'}</TableCell> {/* 생성 날짜 추가 */}
                < TableCell onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/inventory/${inventory.id}/edit`);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(inventory.id)}>
                    <Delete />
                  </IconButton>



                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer >
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(filteredInventories.length / itemsPerPage)}
          page={currentPage}
          onChange={(e, value) => setCurrentPage(value)}
          color="primary"
        />
      </Box>
    </Box >
  );
};

export default InventoryList;
