// pages/stores/[storeId]/checklists/[checklistId]/edit.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../../utils/firebase';
import ChecklistForm from '../../../../../components/stores/ChecklistForm';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import Layout from '../../../../../layouts';

const EditChecklistPage = () => {
  const router = useRouter();
  const { storeId, checklistId } = router.query;
  const [checklistData, setChecklistData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checklistId) {
      const fetchChecklist = async () => {
        try {
          const checklistRef = doc(db, 'Checklists', checklistId);
          const checklistSnap = await getDoc(checklistRef);
          if (checklistSnap.exists()) {
            const data = checklistSnap.data();
            const parsedData = parseChecklistItems(data.items);
            setChecklistData({ category: data.category, ...parsedData });
          } else {
            console.log('No such checklist!');
            alert('해당 체크리스트를 찾을 수 없습니다.');
            router.push(`/stores/${storeId}/checklists`);
          }
        } catch (error) {
          console.error('Error fetching checklist:', error);
          alert('체크리스트 정보를 가져오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      };
      fetchChecklist();
    }
  }, [checklistId, storeId, router]);

  // items 배열을 개별 필드로 변환하는 함수
  const parseChecklistItems = (items) => {
    const parsed = {};
    items.forEach((item) => {
      const [key, value] = item.split(':').map((part) => part.trim());
      parsed[key] = value;
    });
    return parsed;
  };

  const handleSubmit = async (updatedData) => {
    try {
      const checklistRef = doc(db, 'Checklists', checklistId);
      // items 배열로 변환
      const itemsArray = Object.keys(updatedData)
        .filter((key) => key !== 'category')
        .map((key) => `${key}: ${updatedData[key]}`);
      await updateDoc(checklistRef, { category: updatedData.category, items: itemsArray });
      console.log('체크리스트 정보가 성공적으로 업데이트되었습니다.');
      router.push(`/stores/${storeId}/checklists`);
    } catch (error) {
      console.error('Error updating checklist:', error);
      alert('체크리스트 정보 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          로딩 중...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>{checklistData && <ChecklistForm onSubmit={handleSubmit} initialData={checklistData} />}</Box>
    </Container>
  );
};

EditChecklistPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default EditChecklistPage;
