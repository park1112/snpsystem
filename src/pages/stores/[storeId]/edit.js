// pages/stores/[storeId]/edit.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import StoreForm from '../../../components/stores/StoreForm';
import { Container, Typography, Box } from '@mui/material';
import Layout from '../../../layouts';

const EditStorePage = () => {
  const router = useRouter();
  const { storeId } = router.query;
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      const fetchStore = async () => {
        try {
          const storeRef = doc(db, 'Stores', storeId);
          const storeSnap = await getDoc(storeRef);
          if (storeSnap.exists()) {
            setStoreData(storeSnap.data());
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

  const handleSubmit = async (updatedData) => {
    try {
      const storeRef = doc(db, 'Stores', storeId);
      await updateDoc(storeRef, updatedData);
      console.log('마트 정보가 성공적으로 업데이트되었습니다.');
      router.push(`/stores/${storeId}`);
    } catch (error) {
      console.error('Error updating store:', error);
      alert('마트 정보 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" align="center">
          로딩 중...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>{storeData && <StoreForm onSubmit={handleSubmit} initialData={storeData} />}</Box>
    </Container>
  );
};

EditStorePage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default EditStorePage;
