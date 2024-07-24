import { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, IconButton, TextField, Box, Typography, Button } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productsData);
        };

        fetchProducts();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteProduct = async (id) => {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter(product => product.id !== id));
    };

    return (
        <Box mt={5}>
            <Typography variant="h4" gutterBottom>Products</Typography>
            <TextField
                label="Search Products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                margin="normal"
                fullWidth
            />
            <Button variant="contained" color="primary" onClick={() => router.push('/products/add')}>
                Add Product
            </Button>
            <List>
                {filteredProducts.map(product => (
                    <ListItem key={product.id} button onClick={() => router.push(`/products/${product.id}`)}>
                        <ListItemText primary={product.name} />
                        <IconButton onClick={() => router.push(`/products/${product.id}/edit`)}>
                            <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteProduct(product.id)}>
                            <Delete />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default ProductList;