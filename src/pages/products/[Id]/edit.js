// pages/products/[Id]/edit.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';
import ProductForm from '../../../components/products/ProductForm';
import { getKoreaTime } from '../../../models/time';

// 재귀적으로 undefined 값을 제거하는 함수
// removeUndefined 함수 수정
const removeUndefined = (obj) => {
    Object.keys(obj).forEach(key => {
        if (obj[key] && typeof obj[key] === 'object') {
            // logistics 필드를 처리할 때 undefined 값만 제거하고 필드를 남겨둡니다.
            if (key === 'logistics') {
                obj[key] = obj[key].map(logistic => Object.fromEntries(Object.entries(logistic).filter(([_, value]) => value !== undefined)));
            } else {
                removeUndefined(obj[key]);
            }
        } else if (obj[key] === undefined) {
            delete obj[key];
        }
    });
    return obj;
};


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
                    const productData = { ...productDoc.data(), id: Id };
                    console.log('Fetched product data:', productData);
                    setProduct(productData);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [router.isReady, router.query]);

    const handleUpdateProduct = async (updatedProduct) => {
        const { Id } = router.query;
        console.log('Raw updated product:', updatedProduct);
        try {
            const now = getKoreaTime();
            if (isNaN(now.getTime())) {
                throw new Error("Invalid date value from getKoreaTime");
            }

            const { id, createdAt, ...productData } = updatedProduct;

            let cleanedProduct = {
                ...productData,
                updatedAt: now.toISOString(),
                logistics: updatedProduct.logistics || []  // logistics 필드를 유지
            };

            cleanedProduct = removeUndefined(cleanedProduct);
            Object.keys(cleanedProduct).forEach(key => {
                if (cleanedProduct[key] === null || cleanedProduct[key] === '') {
                    delete cleanedProduct[key];
                }
            });

            await setDoc(doc(db, 'products', Id), cleanedProduct, { merge: false });

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