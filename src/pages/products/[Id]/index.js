import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';

const ProductDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(id)
        const fetchProduct = async () => {
            if (!id) return;

            try {
                const productDoc = await getDoc(doc(db, 'products', id));
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

        if (id) {
            fetchProduct();
        }
    }, [id]);

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
            {product ? (
                <Box mt={5}>
                    <Typography variant="h4">{product.name}</Typography>
                    <Typography variant="h6">Category: {product.category}</Typography>
                    {product.types && product.types.map((type, index) => (
                        <Box key={index} mt={2}>
                            <Typography variant="subtitle1">{type.typeName}</Typography>
                            {type.variants && type.variants.map((variant, vIndex) => (
                                <Box key={vIndex} mt={1}>
                                    <Typography variant="body1">Variant: {variant.variantName}</Typography>
                                    <Typography variant="body1">Price: {variant.price}</Typography>
                                    <Typography variant="body1">Stock: {variant.stock}</Typography>
                                </Box>
                            ))}
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography variant="h6">No product data available</Typography>
            )}
        </Layout>
    );
};

export default ProductDetailPage;
