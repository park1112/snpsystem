import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';
import ProductForm from '../../../components/products/ProductForm';

const EditProductPage = () => {
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const { Id } = router.query;

        if (!Id) {
            setError('No ID found in query');
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                const productDoc = await getDoc(doc(db, 'products', Id));
                if (productDoc.exists()) {
                    setProduct(productDoc.data());
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                setError('Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [router.isReady, router.query]);

    const handleUpdateProduct = async (updatedProduct) => {
        const { Id } = router.query;
        const now = new Date().toISOString();
        try {
            await updateDoc(doc(db, 'products', Id), {
                ...updatedProduct,
                updatedAt: now,
                createdAt: updatedProduct.createdAt || now
            });
            router.push(`/products/${Id}`);
        } catch (err) {
            setError('Failed to update product');
        }
    };

    if (loading) {
        return (
            <Layout>
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Layout>
        );
    }

    return (
        <Layout>
            <Box mt={5}>
                <Typography variant="h4">Edit Product</Typography>
                <ProductForm initialData={product} onSubmit={handleUpdateProduct} />
            </Box>
        </Layout>
    );
};

export default EditProductPage;
