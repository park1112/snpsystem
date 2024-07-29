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

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [orderDirection, setOrderDirection] = useState('asc');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
            weight: parseFloat(data.types?.[0]?.variants?.[0]?.weight.replace('kg', '')) || 0,
            logistics: data.logistics || [],
          };
        });
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products');
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter((product) => product.id !== id));
        setSuccess('Product successfully deleted');
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product');
      }
    }
  };

  const handleSort = (property, direction) => {
    setOrderBy(property);
    setOrderDirection(direction);
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (orderBy === 'weight') {
      return (a[orderBy] - b[orderBy]) * (orderDirection === 'asc' ? 1 : -1);
    }
    if (a[orderBy] < b[orderBy]) return orderDirection === 'asc' ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return orderDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'category', label: 'Category' },
    { id: 'weight', label: 'Weight' },
    { id: 'logistics', label: 'Logistics' },
  ];

  return (
    <Box mt={5}>
      <Typography variant="h4" gutterBottom>
        상품 검색
      </Typography>
      <TextField
        label="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        margin="normal"
        fullWidth
        sx={{ mb: 3 }}
      />
      <Button variant="contained" color="primary" onClick={() => router.push('/products/add')} sx={{ mb: 3 }}>
        상품 추가
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
            {sortedProducts.map((product, index) => (
              <TableRow
                key={product.id}
                sx={{
                  backgroundColor: index % 2 === 1 ? 'rgba(240, 240, 240, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                  '&:hover': { backgroundColor: 'rgba(200, 200, 200, 0.5)' },
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.weight}kg</TableCell>
                <TableCell>
                  {product.logistics.length > 0 ? (
                    product.logistics.map((logistic) => (
                      <Typography key={logistic.uid}>
                        {logistic.name} ({logistic.unit})
                      </Typography>
                    ))
                  ) : (
                    <Typography>None</Typography>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <IconButton onClick={() => router.push(`/products/${product.id}/edit`)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProduct(product.id)}>
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

export default ProductList;
