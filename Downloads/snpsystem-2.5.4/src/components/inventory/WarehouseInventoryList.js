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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import SortableTableHeader from '../SortableTableHeader';
import { getKoreanStatus } from '../../utils/inventoryStatus';

const WarehouseInventoryList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [logistics, setLogistics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching warehouses and logistics...');
        const warehousesSnapshot = await getDocs(collection(db, 'warehouses'));

        // "바렛트" 카테고리의 물류 기기만 가져오기
        const logisticsQuery = query(collection(db, 'logistics'), where('category', '==', '바렛트'));
        const logisticsSnapshot = await getDocs(logisticsQuery);

        const warehousesData = warehousesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const logisticsData = logisticsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        console.log('Warehouses Data:', warehousesData);
        console.log('Logistics Data:', logisticsData);

        setWarehouses(warehousesData);
        setLogistics(logisticsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredWarehouses = warehouses.filter((warehouse) =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (property, direction) => {
    setOrderBy(property);
    setOrderDirection(direction);
  };

  const sortedWarehouses = [...filteredWarehouses].sort((a, b) => {
    if (a[orderBy].toLowerCase() < b[orderBy].toLowerCase()) return orderDirection === 'asc' ? -1 : 1;
    if (a[orderBy].toLowerCase() > b[orderBy].toLowerCase()) return orderDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleAddInventory = (warehouse, logistic) => {
    router.push({
      pathname: '/inventory/addInventory',
      query: {
        warehouseUid: warehouse.id, // 'Uid'로 변경
        warehouseName: warehouse.name,
        logisticsUid: logistic.id, // 'Uid'로 변경
        logisticsName: logistic.name,
        status: 'production',
      },
    });
  };

  const columns = [
    { id: 'productName', label: '상품 이름' },
    { id: 'logisticsQuantity', label: '바렛트 수량' },
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
        창고 재고 현황
      </Typography>
      <TextField
        label="창고 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
        fullWidth
      />
      {sortedWarehouses.map((warehouse) => (
        <Box key={warehouse.id} mt={4}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" gutterBottom>
                {warehouse.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" justifyContent="flex-end" flexWrap="wrap">
                {logistics.map((logistic) => (
                  <Button
                    key={logistic.id}
                    variant="contained"
                    color="primary"
                    onClick={() => handleAddInventory(warehouse, logistic)}
                    sx={{ ml: 1, mb: 1 }}
                  >
                    {`${logistic.name} 생산추가`}
                  </Button>
                ))}
              </Box>
            </Grid>
          </Grid>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(warehouse.statuses || {}).flatMap(([status, statusData]) =>
                  Object.entries(statusData.products || {}).map(([productId, productData]) => (
                    <TableRow
                      key={`${status}-${productId}`}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)', cursor: 'pointer' },
                      }}
                      onClick={() => router.push(`/warehouse/${warehouse.id}`)}
                    >
                      <TableCell>{productData.name}</TableCell>
                      <TableCell>{productData.inventoryUids?.length || 0}</TableCell>
                      <TableCell>{productData.count || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
};

export default WarehouseInventoryList;
