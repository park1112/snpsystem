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
  Snackbar,
  Alert,
} from '@mui/material';
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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLogistics = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'logistics'));
        const logisticsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
          };
        });
        // 최신순으로 정렬하여 설정
        logisticsData.sort((a, b) => b.createdAt - a.createdAt);
        setLogistics(logisticsData);
      } catch (err) {
        console.error('Error fetching logistics:', err);
        setError('Failed to fetch logistics');
      }
    };

    fetchLogistics();
  }, []);

  const filteredLogistics = logistics.filter((logistic) =>
    logistic.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteLogistic = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this logistics equipment?');
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'logistics', id));
        setLogistics(logistics.filter((logistic) => logistic.id !== id));
        setSuccess('Logistics equipment successfully deleted');
      } catch (err) {
        console.error('Error deleting logistics equipment:', err);
        setError('Failed to delete logistics equipment');
      }
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
    { id: 'quantity', label: 'Quantity' },
    { id: 'price', label: 'Price' },
    { id: 'partnerName', label: 'Partner Name' },
    { id: 'sameAsProductQuantity', label: '수량변경' },
  ];

  return (
    <Box mt={5}>
      <Typography variant="h4" gutterBottom>
        물류기기 관련
      </Typography>
      <TextField
        label="이름을 검색하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
        fullWidth
        sx={{ mb: 3 }}
      />
      <Button variant="contained" color="primary" onClick={() => router.push('/logistics/add')} sx={{ mb: 3 }}>
        새로운 물류기기 등록
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
                  '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)' },
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/logistics/${logistic.id}`)}
              >
                <TableCell>{logistic.name}</TableCell>
                <TableCell>{logistic.category}</TableCell>
                <TableCell>{logistic.quantity}</TableCell>
                <TableCell>{logistic.price}</TableCell>
                <TableCell>{logistic.partnerName}</TableCell>
                <TableCell>{logistic.sameAsProductQuantity ? '가능' : '불가능'}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <IconButton onClick={() => router.push(`/logistics/${logistic.id}/edit`)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteLogistic(logistic.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {error && (
        <Snackbar open={true} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
      {success && (
        <Snackbar open={true} autoHideDuration={6000} onClose={() => setSuccess(null)}>
          <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default LogisticsList;
