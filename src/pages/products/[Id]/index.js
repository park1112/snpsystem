import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import {
  CircularProgress,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
      setLoading(true);
      try {
        const productDoc = await getDoc(doc(db, 'products', id));
        if (productDoc.exists()) {
          const productData = productDoc.data();

          if (productData.logistics) {
            const logisticsUIDs = productData.logistics.map((logistic) => logistic.uid);
            const logisticsData = await fetchLogisticsInfo(logisticsUIDs);
            setLogisticsInfo(logisticsData);
          }

          setProduct(productData);
        } else {
          setError('상품을 찾을 수 없습니다.');
        }
      } catch (err) {
        setError('상품 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      const id = router.query.id || router.query.Id;

      if (!id) {
        setError('상품 ID를 찾을 수 없습니다.');
        setLoading(false);
        return;
      }

      fetchProduct(id);
    }
  }, [router.isReady, router.query]);

  const handleGoBack = () => {
    router.push('/products');
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          variant="outlined"
          sx={{ mb: 3 }}
        >
          상품 목록으로 돌아가기
        </Button>

        {product ? (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  기본 정보
                </Typography>
                <Box>
                  <Typography><strong>카테고리:</strong> {product.category}</Typography>
                  <Typography><strong>서브카테고리:</strong> {product.subCategory}</Typography>
                  <Typography><strong>무게:</strong> {product.weight}kg</Typography>
                  <Typography><strong>유형:</strong> {product.typeName}</Typography>
                  <Typography><strong>수량:</strong> {product.quantity}</Typography>
                  <Typography><strong>가격:</strong> {product.price}</Typography>
                  <Typography><strong>최근 업데이트:</strong> {new Date(product.updatedAt).toLocaleString()}</Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  물류 정보
                </Typography>
                {product.logistics && product.logistics.length > 0 ? (
                  <Grid container spacing={2}>
                    {product.logistics.map((logistic, lIndex) => (
                      <Grid item xs={12} key={lIndex}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1">
                              <strong>{logisticsInfo[logistic.uid]?.name || '로딩 중...'}</strong>
                            </Typography>
                            <Typography>단위: {logistic.unit}</Typography>
                            <Typography>
                              수량 변경 가능 : {logistic.isDefault ? '예' : '아니오'}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography>물류 정보가 없습니다.</Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        ) : (
          <Typography variant="h6">상품 정보를 불러올 수 없습니다.</Typography>
        )}
      </Box>
    </Layout>
  );
};

export default ProductDetailPage;