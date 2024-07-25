import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';

const ProductDetailPage = () => {
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async (id) => {
            // console.log('Fetching product with ID:', id);
            setLoading(true);
            try {
                const productDoc = await getDoc(doc(db, 'products', id));
                if (productDoc.exists()) {
                    // console.log('Product found:', productDoc.data());
                    setProduct(productDoc.data());
                } else {
                    // console.log('Product not found');
                    setError('Product not found');
                }
            } catch (err) {
                // console.error('Error fetching product:', err);
                setError('Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        if (router.isReady) {
            const id = router.query.id || router.query.Id; // 대소문자 모두 확인
            // console.log('Router is ready. Query:', router.query);

            if (!id) {
                console.error('No ID found in query');
                setError('No ID found in query');
                setLoading(false);
                return;
            }

            fetchProduct(id);
        }
    }, [router.isReady, router.query]);



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
                {product ? (
                    <>
                        <Typography variant="h4">{product.name}</Typography>
                        <Typography variant="h6">Category: {product.category}</Typography>
                        {product.types && product.types.map((type, index) => (
                            <Box key={index}>
                                <Typography variant="subtitle1">{type.typeName}</Typography>
                                {type.variants && type.variants.map((variant, vIndex) => (
                                    <Box key={vIndex}>
                                        <Typography variant="body1">Variant: {variant.variantName}</Typography>
                                        <Typography variant="body1">Price: {variant.price}</Typography>
                                        <Typography variant="body1">Stock: {variant.stock}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </>
                ) : (
                    <Typography variant="h6">No product data available</Typography>
                )}
            </Box>
        </Layout>
    );
};

export default ProductDetailPage;
