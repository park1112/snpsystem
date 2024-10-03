// pages/reports/generate.js
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
  TextField,
} from '@mui/material';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import Layout from '../../layouts';
import axios from 'axios';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

const GenerateReportPage = () => {
  const [stores, setStores] = useState([]);
  const [checklists, setChecklists] = useState({});
  const [selectedChecklists, setSelectedChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [storeSelections, setStoreSelections] = useState({});
  const [editableReport, setEditableReport] = useState('');
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    const fetchStoresAndChecklists = async () => {
      try {
        // 모든 스토어 가져오기
        const storesSnapshot = await getDocs(collection(db, 'Stores'));
        const storesData = storesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStores(storesData);

        // 각 스토어의 체크리스트 가져오기
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

  const handleGenerateReport = async () => {
    if (selectedChecklists.length === 0) {
      setSnackbar({ open: true, message: '체크리스트를 선택해주세요.', severity: 'warning' });
      return;
    }

    setGenerating(true);
    setReport('');

    try {
      // 선택된 체크리스트 데이터 가져오기
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

      // API 요청 보내기
      const response = await axios.post('/api/generateReport', { checklists: selectedData });
      setReport(response.data.report);
      setEditableReport(response.data.report); // 편집 가능한 상태에 설정
      setSnackbar({ open: true, message: '보고서가 성공적으로 생성되었습니다.', severity: 'success' });
    } catch (error) {
      console.error('보고서 생성 오류:', error);
      setSnackbar({ open: true, message: '보고서 생성 중 오류가 발생했습니다.', severity: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveReport = async () => {
    if (editableReport.trim() === '') {
      setSnackbar({ open: true, message: '저장할 보고서 내용이 비어 있습니다.', severity: 'warning' });
      return;
    }

    try {
      // Firestore에 보고서 저장 (예: Reports 컬렉션에 추가)
      await addDoc(collection(db, 'Reports'), {
        report: editableReport,
        createdAt: new Date(),
      });
      setSnackbar({ open: true, message: '보고서가 성공적으로 저장되었습니다.', severity: 'success' });
      // 선택된 체크리스트 초기화
      setSelectedChecklists([]);
      setReport('');
      setEditableReport('');
    } catch (error) {
      console.error('보고서 저장 오류:', error);
      setSnackbar({ open: true, message: '보고서 저장 중 오류가 발생했습니다.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleGeneratePrompt = () => {
    if (selectedChecklists.length === 0) {
      setSnackbar({ open: true, message: '체크리스트를 선택해주세요.', severity: 'warning' });
      return;
    }

    let prompt = '다음 체크리스트 항목들을 바탕으로 종합적인 보고서를 작성해주세요:\n';

    for (const storeId of Object.keys(checklists)) {
      const storeChecklists = checklists[storeId];
      const storeName = stores.find((store) => store.id === storeId)?.name || 'Unknown Store';

      for (const checklist of storeChecklists) {
        if (selectedChecklists.includes(checklist.id)) {
          prompt += `스토어: ${storeName}\n`;
          prompt += `카테고리: ${checklist.category}\n`;
          prompt += `항목:\n${checklist.items.map((item) => `- ${item}`).join('\n')}\n\n`;
        }
      }
    }

    prompt +=
      '베트남과 중국에서 수입한 과일, 농산물, 가공품, 냉동과즙을 한국 시장에 판매하기 위한 시장조사를 기반으로 종합적인 보고서를 작성해 주세요. 보고서는 시장조사 데이터를 활용한 전략적 접근과 현장 방문을 통한 실무적 데이터 모두를 반영하여 작성되어야 합니다.\n\n';

    prompt += '보고서에는 다음 항목을 포함해 주세요\n';
    prompt += '1. 시장 상황 분석: 현재 한국 수입 시장의 상황과 주요 트렌드, 경쟁 제품 분석.\n';
    prompt += '2. 소비자 분석: 소비자의 구매 행동, 주요 소비자 그룹, 시장 수요 변화.\n';
    prompt +=
      '3. 경쟁 제품 분석: 베트남 및 중국에서 수입한 제품들과 경쟁하는 태국, 필리핀 제품들과의 가격 및 품질 경쟁력 비교.\n';
    prompt += '4. 추천 수입 제품: 한국 시장에서 성공할 가능성이 높은 수입 제품과 그 이유.\n';
    prompt += '5. 가격 전략 및 유통 전략: 시장에서 경쟁력을 가질 수 있는 가격 전략과 유통 경로 확립 방안.\n';
    prompt += '6. 추가 시장조사 필요성: 향후 추가적으로 시장조사가 필요한 제품군 및 분석 방법론 제안.\n';
    prompt += '7. 결론 및 제안: 종합적인 시장 분석을 기반으로 한 전략적 제안과 실행 방안.\n';
    prompt +=
      '보고서의 내용은 체계적이고 전문적인 시장조사 기법을 기반으로 하며, 데이터에 기반한 통찰력과 구체적인 제안을 포함해야 합니다.\n';

    setPromptText(prompt);
    setSnackbar({ open: true, message: '프롬프트가 생성되었습니다. 복사하여 사용하세요.', severity: 'success' });
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
        보고서 생성
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
          <Button variant="contained" color="secondary" size="large" onClick={handleGeneratePrompt} sx={{ mr: 2 }}>
            프롬프트 생성
          </Button>
          <Button variant="contained" color="primary" size="large" onClick={handleGenerateReport} disabled={generating}>
            {generating ? <CircularProgress size={24} color="inherit" /> : '보고서 생성'}
          </Button>
        </Box>
        {promptText && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom color="primary">
              생성된 프롬프트
            </Typography>
            <Paper sx={{ p: 3, backgroundColor: '#fafafa' }}>
              <TextField
                multiline
                minRows={15}
                maxRows={30}
                fullWidth
                variant="outlined"
                value={promptText}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Paper>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  navigator.clipboard.writeText(promptText);
                  setSnackbar({ open: true, message: '프롬프트가 클립보드에 복사되었습니다.', severity: 'success' });
                }}
              >
                프롬프트 복사
              </Button>
            </Box>
          </Box>
        )}
        {report && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom color="primary">
              생성된 보고서
            </Typography>
            <Paper sx={{ p: 3, backgroundColor: '#fafafa' }}>
              <TextField
                multiline
                minRows={15}
                maxRows={30}
                fullWidth
                variant="outlined"
                value={editableReport}
                onChange={(e) => setEditableReport(e.target.value)}
                placeholder="보고서 내용이 여기에 표시됩니다. 필요에 따라 수정하세요."
              />
            </Paper>
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button variant="contained" color="primary" size="large" onClick={handleSaveReport}>
                보고서 저장
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Snackbar for notifications */}
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

// 페이지 레이아웃 설정
GenerateReportPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default GenerateReportPage;
