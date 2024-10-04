// pages/stores/[storeId]/checklists/add.js
import React from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../../utils/firebase';
import ChecklistForm from '../../../../components/stores/ChecklistForm';
import { Container, Box } from '@mui/material';
import Layout from '../../../../layouts';

const AddChecklistPage = () => {
  const router = useRouter();
  const { storeId } = router.query;

  const handleSubmit = async (checklistData) => {
    try {
      await addDoc(collection(db, 'Checklists'), { storeId, ...checklistData });
      console.log('체크리스트가 성공적으로 등록되었습니다.');
      router.push(`/stores/${storeId}/checklists`);
    } catch (error) {
      console.error('체크리스트 등록 중 오류가 발생했습니다:', error);
      alert('체크리스트 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <ChecklistForm onSubmit={handleSubmit} />
      </Box>
    </Container>
  );
};

AddChecklistPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default AddChecklistPage;
