import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import { CircularProgress, Box, Typography } from '@mui/material';

const ProductDetailPage = () => {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logisticsInfo, setLogisticsInfo] = useState({});

  useEffect(() => {
    const fetchLogisticsInfo = async (logisticsUIDs) => {
      const logisticsCollection = collection(db, 'logistics');
      const logisticsSnapshot = await getDocs(logisticsCollection);
      const logisticsData = {};

      logisticsSnapshot.forEach((doc) => {
        if (logisticsUIDs.includes(doc.id)) {
          logisticsData[doc.id] = doc.data();
        }
      });

      return logisticsData;
    };

    const fetchProduct = async (id) => {
      // console.log('Fetching product with ID:', id);
      setLoading(true);
      try {
        const productDoc = await getDoc(doc(db, 'products', id));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          // console.log('Product found:', productData);

          if (productData.logistics) {
            const logisticsUIDs = productData.logistics.map((logistic) => logistic.uid);
            const logisticsData = await fetchLogisticsInfo(logisticsUIDs);
            setLogisticsInfo(logisticsData);
          }

          setProduct(productData);
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
            <Typography variant="h6">subCategory: {product.subCategory}</Typography>
            <Typography variant="h6">weight: {product.weight}kg</Typography>
            <Typography variant="h6">typeName: {product.typeName}</Typography>
            <Typography variant="h6">quantity: {product.quantity}</Typography>
            <Typography variant="h6">price: {product.price}</Typography>
            <Typography variant="h6">updatedAt: {product.updatedAt}</Typography>

            {product.logistics &&
              product.logistics.map((logistic, lIndex) => (
                <Box key={lIndex}>
                  <Typography variant="body1">Logistic: {logisticsInfo[logistic.uid]?.name || 'Loading...'}</Typography>
                  <Typography variant="body1">Unit: {logistic.unit}</Typography>
                  <Typography variant="body1">sameAsProductQuantity: {logistic.sameAsProductQuantity}</Typography>
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
