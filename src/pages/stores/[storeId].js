// pages/stores/[storeId].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import StoreDetail from '../../components/stores/StoreDetail';
import { Container, Typography } from '@mui/material';
import Layout from '../../layouts';

const StoreDetailPage = () => {
  const router = useRouter();
  const { storeId } = router.query;
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      const fetchStore = async () => {
        try {
          const storeRef = doc(db, 'Stores', storeId);
          const storeSnap = await getDoc(storeRef);
          if (storeSnap.exists()) {
            setStore({ id: storeSnap.id, ...storeSnap.data() });
          } else {
            console.log('No such document!');
            alert('해당 마트를 찾을 수 없습니다.');
            router.push('/stores');
          }
        } catch (error) {
          console.error('Error fetching store:', error);
          alert('마트 정보를 가져오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      fetchStore();
    }
  }, [storeId, router]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" align="center">
          로딩 중...
        </Typography>
      </Container>
    );
  }

  return <Container maxWidth="md">{store && <StoreDetail store={store} />}</Container>;
};

StoreDetailPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default StoreDetailPage;
