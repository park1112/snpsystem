// pages/stores/[storeId]/checklists/[checklistId].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../utils/firebase';
import ChecklistDetail from '../../../../components/stores/ChecklistDetail';
import { Container, Typography } from '@mui/material';
import Layout from '../../../../layouts';

const ChecklistDetailPage = () => {
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
            setChecklistData(checklistSnap.data());
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
      {checklistData && (
        <ChecklistDetail
          checklist={checklistData}
          storeId={storeId}
          checklistId={checklistId} // 체크리스트 ID 추가
        />
      )}
    </Container>
  );
};

ChecklistDetailPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ChecklistDetailPage;
