// pages/stores/add.js
import React from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import StoreForm from '../../components/stores/StoreForm';
import { Container, Box } from '@mui/material';

const AddStore = () => {
  const router = useRouter();

  const handleSubmit = async (storeData) => {
    try {
      await addDoc(collection(db, 'Stores'), storeData);
      console.log('마트가 성공적으로 등록되었습니다.');
      router.push('/stores');
    } catch (error) {
      console.error('마트 등록 중 오류가 발생했습니다:', error);
      alert('마트 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <StoreForm onSubmit={handleSubmit} />
      </Box>
    </Container>
  );
};

export default AddStore;
