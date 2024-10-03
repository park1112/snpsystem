// pages/reports/index.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Layout from '../../layouts';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { useRouter } from 'next/router';

const ReportsPage = () => {
  const [stores, setStores] = useState([]);
  const [checklists, setChecklists] = useState({});
  const [selectedChecklists, setSelectedChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [storeSelections, setStoreSelections] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchStoresAndChecklists = async () => {
      try {
        const storesSnapshot = await getDocs(collection(db, 'Stores'));
        const storesData = storesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStores(storesData);

        const checklistsData = {};
        for (const store of storesData) {
          const q = query(collection(db, 'Checklists'), where('storeId', '==', store.id));
          const checklistsSnapshot = await getDocs(q);
          checklistsData[store.id] = checklistsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }
        setChecklists(checklistsData);
      } catch (error) {
        console.error('스토어 및 체크리스트 가져오기 오류:', error);
        setSnackbar({ open: true, message: '데이터를 불러오는 중 오류가 발생했습니다.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchStoresAndChecklists();
  }, []);

  const handleCheckboxChange = (checklistId) => {
    setSelectedChecklists((prev) =>
      prev.includes(checklistId) ? prev.filter((id) => id !== checklistId) : [...prev, checklistId]
    );
  };

  const handleStoreSelect = (storeId) => {
    setStoreSelections((prev) => ({
      ...prev,
      [storeId]: !prev[storeId],
    }));

    const storeChecklists = checklists[storeId] || [];
    const checklistIds = storeChecklists.map((checklist) => checklist.id);

    setSelectedChecklists((prev) => {
      if (storeSelections[storeId]) {
        return prev.filter((id) => !checklistIds.includes(id));
      } else {
        return [...new Set([...prev, ...checklistIds])];
      }
    });
  };

  const handleViewDetails = async () => {
    if (selectedChecklists.length === 0) {
      setSnackbar({ open: true, message: '체크리스트를 선택해주세요.', severity: 'warning' });
      return;
    }

    try {
      const selectedData = [];
      for (const storeId of Object.keys(checklists)) {
        const storeChecklists = checklists[storeId];
        for (const checklist of storeChecklists) {
          if (selectedChecklists.includes(checklist.id)) {
            selectedData.push({
              storeName: stores.find((store) => store.id === storeId)?.name || 'Unknown Store',
              category: checklist.category,
              items: checklist.items,
            });
          }
        }
      }

      // Firestore에 선택된 데이터 저장
      const docRef = await addDoc(collection(db, 'SelectedChecklists'), {
        selectedData,
        createdAt: new Date(),
      });

      // 상세 페이지로 이동
      router.push(`/reports/details/${docRef.id}`);
    } catch (error) {
      console.error('데이터 저장 오류:', error);
      setSnackbar({ open: true, message: '데이터 저장 중 오류가 발생했습니다.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          데이터 불러오는 중...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom color="primary" align="center">
        체크리스트 선택
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {stores.map((store) => (
            <Grid item xs={12} md={6} key={store.id}>
              <Paper sx={{ p: 3, backgroundColor: '#f0f8ff' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" color="secondary">
                    {store.name}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={storeSelections[store.id]}
                        onChange={() => handleStoreSelect(store.id)}
                        color="primary"
                      />
                    }
                    label="전체 선택"
                  />
                </Box>
                <Divider sx={{ mb: 2 }} />
                {checklists[store.id]?.map((checklist) => (
                  <Box key={checklist.id}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedChecklists.includes(checklist.id)}
                              onChange={() => handleCheckboxChange(checklist.id)}
                              color="primary"
                              icon={<CheckBoxOutlineBlankIcon />}
                              checkedIcon={<CheckBoxIcon />}
                            />
                          }
                          label={checklist.category}
                        />
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="body2">{checklist.items[0] || '상품명 없음'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button variant="contained" color="primary" size="large" onClick={handleViewDetails}>
            선택 항목 상세 보기
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

ReportsPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ReportsPage;
