// pages/products/[Id]/edit.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';
import ProductForm from '../../../components/products/ProductForm';
import { getKoreaTime } from '../../../models/time';

const EditProductPage = () => {
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!router.isReady) return;

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
                    setProduct({ ...productDoc.data(), id: Id }); // id 추가
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
        try {
            const now = getKoreaTime();
            if (isNaN(now.getTime())) {
                throw new Error("Invalid date value from getKoreaTime");
            }
            await updateDoc(doc(db, 'products', Id), {
                ...updatedProduct,
                updatedAt: now.toISOString(),
                // createdAt 필드 제거
            });
            alert('상품이 성공적으로 업데이트되었습니다.');
            router.push(`/products/${Id}`);
        } catch (err) {
            console.error('Failed to update product:', err);
            alert('업데이트 실패: ' + err.message);
        }
    };

    if (loading) return <Layout><Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box></Layout>;
    if (error) return <Layout><Typography variant="h6" color="error">{error}</Typography></Layout>;

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