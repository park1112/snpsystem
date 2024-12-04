// components/stores/ChecklistForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const predefinedOptions = {
  '고객 행동': [
    '건강 간식을 선호하는 소비자',
    '간편한 간식을 찾는 사람들',
    '가격 중심의 소비자',
    '브랜드 충성도 높은 소비자',
    '다양한 맛을 선호하는 소비자',
    '친환경 포장을 선호하는 소비자',
    '기타',
  ],
  '프로모션 여부': [
    '할인 행사 진행',
    '묶음 판매 진행',
    '1+1 행사 진행',
    '프로모션 없음',
    '시즌별 프로모션 진행',
    '특별 할인 쿠폰 제공',
    '기타',
  ],
};

const predefinedOrigins = ['중국', '베트남', '한국', '태국', '필리핀', '미국', '기타'];

const predefinedShelfLives = [
  '1개월 미만',
  '1개월 이상',
  '2개월 이상',
  '3개월 이상',
  '4개월 이상',
  '5개월 이상',
  '6개월 이상',
  '7개월 이상',
  '8개월 이상',
  '9개월 이상',
  '10개월 이상',
  '11개월 이상',
  '12개월 이상',
  '기타',
];

const ChecklistForm = ({ onSubmit, initialData = {} }) => {
  // 상태 관리
  const [category, setCategory] = useState(initialData.category || '');
  const [categories, setCategories] = useState([]);
  const [openAddCategoryDialog, setOpenAddCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [openManageCategoriesDialog, setOpenManageCategoriesDialog] = useState(false);

  const [상품명, set상품명] = useState(initialData.상품명 || '');
  const [브랜드, set브랜드] = useState(initialData.브랜드 || '');
  const [가격대, set가격대] = useState(initialData.가격대 || '');
  const [원산지, set원산지] = useState(initialData.원산지 || '');
  const [기타원산지, set기타원산지] = useState(initialData.기타원산지 || '');
  const [유통기한, set유통기한] = useState(initialData.유통기한 || '');
  const [기타유통기한, set기타유통기한] = useState(initialData.기타유통기한 || '');
  const [포장상태, set포장상태] = useState(initialData.포장상태 || '');
  const [제품특성, set제품특성] = useState(initialData.제품특성 || '');
  const [진열위치, set진열위치] = useState(initialData.진열위치 || '');
  const [경쟁제품, set경쟁제품] = useState(initialData.경쟁제품 || '');
  const [고객행동, set고객행동] = useState(initialData.고객행동 || '');
  const [기타고객행동, set기타고객행동] = useState(initialData.기타고객행동 || '');
  const [프로모션여부, set프로모션여부] = useState(initialData.프로모션여부 || '');
  const [기타프로모션여부, set기타프로모션여부] = useState(initialData.기타프로모션여부 || '');

  // 카테고리 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCol = collection(db, 'Categories');
        const categorySnapshot = await getDocs(categoriesCol);
        const categoryList = categorySnapshot.docs.map((doc) => doc.data().name);
        setCategories(categoryList);
      } catch (error) {
        console.error('카테고리 가져오기 오류:', error);
      }
    };
    fetchCategories();
  }, []);

  // 카테고리 추가 핸들러
  const handleAddCategory = async () => {
    if (newCategory.trim() === '') {
      alert('카테고리 이름을 입력해주세요.');
      return;
    }
    try {
      // 기존 카테고리 중복 확인
      const categoriesCol = collection(db, 'Categories');
      const categorySnapshot = await getDocs(categoriesCol);
      const exists = categorySnapshot.docs.some(
        (doc) => doc.data().name.toLowerCase() === newCategory.trim().toLowerCase()
      );
      if (exists) {
        alert('이미 존재하는 카테고리입니다.');
        return;
      }

      // Firestore에 새 카테고리 추가
      await addDoc(collection(db, 'Categories'), { name: newCategory.trim() });
      // 로컬 상태 업데이트
      setCategories((prev) => [...prev, newCategory.trim()]);
      setCategory(newCategory.trim());
      // 다이얼로그 닫기 및 입력 필드 초기화
      setOpenAddCategoryDialog(false);
      setNewCategory('');
    } catch (error) {
      console.error('카테고리 추가 오류:', error);
      alert('카테고리 추가 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 카테고리 삭제 핸들러
  const handleDeleteCategory = async (catName) => {
    if (!window.confirm(`"${catName}" 카테고리를 삭제하시겠습니까?`)) return;
    try {
      // Firestore에서 해당 카테고리 삭제
      const querySnapshot = await getDocs(collection(db, 'Categories'));
      const docToDelete = querySnapshot.docs.find((doc) => doc.data().name === catName);
      if (docToDelete) {
        await deleteDoc(doc(db, 'Categories', docToDelete.id));
        // 로컬 상태 업데이트
        setCategories((prev) => prev.filter((cat) => cat !== catName));
        if (category === catName) {
          setCategory('');
        }
      } else {
        alert('해당 카테고리를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('카테고리 삭제 오류:', error);
      alert('카테고리 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    const checklistItems = [
      `상품명: ${상품명}`,
      `브랜드: ${브랜드}`,
      `가격대: ${가격대}`,
      `원산지: ${원산지 === '기타' ? 기타원산지 : 원산지}`,
      `유통기한: ${유통기한 === '기타' ? 기타유통기한 : 유통기한}`,
      `포장 상태: ${포장상태}`,
      `제품 특성: ${제품특성}`,
      `진열 위치: ${진열위치}`,
      `경쟁 제품: ${경쟁제품}`,
      `고객 행동: ${고객행동 === '기타' ? 기타고객행동 : 고객행동}`,
      `프로모션 여부: ${프로모션여부 === '기타' ? 기타프로모션여부 : 프로모션여부}`,
    ];
    onSubmit({ category, items: checklistItems });
  };

  return (
    <Paper elevation={3} sx={{ p: 4, backgroundColor: '#ffffff' }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: 2,
        }}
      >
        <Typography variant="h5" gutterBottom color="primary">
          {initialData.category ? '체크리스트 수정' : '체크리스트 생성'}
        </Typography>
        <Grid container spacing={3}>
          {/* 카테고리 선택 및 추가/관리 */}
          <Grid item xs={12} sm={8}>
            <FormControl fullWidth>
              <InputLabel id="category-label">카테고리</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                label="카테고리"
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat, idx) => (
                  <MenuItem key={idx} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddCategoryDialog(true)}
              fullWidth
            >
              카테고리 추가
            </Button>
          </Grid>

          {/* 체크리스트 항목들 */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="상품명"
              variant="outlined"
              fullWidth
              value={상품명}
              onChange={(e) => set상품명(e.target.value)}
              placeholder="예: 베트남산 건망고, 건바나나 등"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="브랜드"
              variant="outlined"
              fullWidth
              value={브랜드}
              onChange={(e) => set브랜드(e.target.value)}
              placeholder="예: Vinamit, Fruit King 등"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="원산지-label">원산지</InputLabel>
              <Select labelId="원산지-label" value={원산지} label="원산지" onChange={(e) => set원산지(e.target.value)}>
                {predefinedOrigins.map((origin, idx) => (
                  <MenuItem key={idx} value={origin}>
                    {origin}
                  </MenuItem>
                ))}
                <MenuItem value="기타">기타</MenuItem>
              </Select>
            </FormControl>
            {원산지 === '기타' && (
              <TextField
                label="기타 원산지"
                variant="outlined"
                fullWidth
                value={기타원산지}
                onChange={(e) => set기타원산지(e.target.value)}
                placeholder="직접 입력하세요"
                sx={{ mt: 2 }}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="유통기한-label">유통기한</InputLabel>
              <Select
                labelId="유통기한-label"
                value={유통기한}
                label="유통기한"
                onChange={(e) => set유통기한(e.target.value)}
              >
                {predefinedShelfLives.map((shelf, idx) => (
                  <MenuItem key={idx} value={shelf}>
                    {shelf}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {유통기한 === '기타' && (
              <TextField
                label="기타 유통기한"
                variant="outlined"
                fullWidth
                value={기타유통기한}
                onChange={(e) => set기타유통기한(e.target.value)}
                placeholder="직접 입력하세요"
                sx={{ mt: 2 }}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="포장 상태"
              variant="outlined"
              fullWidth
              value={포장상태}
              onChange={(e) => set포장상태(e.target.value)}
              placeholder="예: 플라스틱, 종이 팩 등"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="가격대"
              variant="outlined"
              fullWidth
              value={가격대}
              onChange={(e) => set가격대(e.target.value)}
              placeholder="예: 1000원, 2000원 등"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="제품 특성"
              variant="outlined"
              fullWidth
              value={제품특성}
              onChange={(e) => set제품특성(e.target.value)}
              placeholder="예: 무설탕, 무첨가, 유기농 등"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="진열 위치"
              variant="outlined"
              fullWidth
              value={진열위치}
              onChange={(e) => set진열위치(e.target.value)}
              placeholder="예: 주요 진열대, 상단 배치 등"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="경쟁 제품"
              variant="outlined"
              fullWidth
              value={경쟁제품}
              onChange={(e) => set경쟁제품(e.target.value)}
              placeholder="예: 필리핀산 건망고 등"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* 고객 행동 */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="고객행동-label">고객 행동</InputLabel>
              <Select
                labelId="고객행동-label"
                value={고객행동}
                label="고객 행동"
                onChange={(e) => set고객행동(e.target.value)}
              >
                {predefinedOptions['고객 행동'].map((option, idx) => (
                  <MenuItem key={idx} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {고객행동 === '기타' && (
              <TextField
                label="기타 고객 행동"
                variant="outlined"
                fullWidth
                value={기타고객행동}
                onChange={(e) => set기타고객행동(e.target.value)}
                placeholder="직접 입력하세요"
                sx={{ mt: 2 }}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Grid>

          {/* 프로모션 여부 */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="프로모션여부-label">프로모션 여부</InputLabel>
              <Select
                labelId="프로모션여부-label"
                value={프로모션여부}
                label="프로모션 여부"
                onChange={(e) => set프로모션여부(e.target.value)}
              >
                {predefinedOptions['프로모션 여부'].map((option, idx) => (
                  <MenuItem key={idx} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {프로모션여부 === '기타' && (
              <TextField
                label="기타 프로모션 여부"
                variant="outlined"
                fullWidth
                value={기타프로모션여부}
                onChange={(e) => set기타프로모션여부(e.target.value)}
                placeholder="직접 입력하세요"
                sx={{ mt: 2 }}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Grid>

          {/* 제출 버튼 */}
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Button type="submit" variant="contained" color="primary" size="large">
              저장
            </Button>
          </Grid>
        </Grid>

        {/* 카테고리 추가 다이얼로그 */}
        <Dialog open={openAddCategoryDialog} onClose={() => setOpenAddCategoryDialog(false)}>
          <DialogTitle>새 카테고리 추가</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="카테고리 이름"
              type="text"
              fullWidth
              variant="outlined"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="예: 과일, 채소 등"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddCategoryDialog(false)}>취소</Button>
            <Button onClick={handleAddCategory} variant="contained" color="primary">
              추가
            </Button>
          </DialogActions>
        </Dialog>

        {/* 카테고리 관리 다이얼로그 */}
        <Dialog open={openManageCategoriesDialog} onClose={() => setOpenManageCategoriesDialog(false)}>
          <DialogTitle>카테고리 관리</DialogTitle>
          <DialogContent>
            <List>
              {categories.map((cat, idx) => (
                <ListItem key={idx} divider>
                  <ListItemText primary={cat} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCategory(cat)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenManageCategoriesDialog(false)}>닫기</Button>
          </DialogActions>
        </Dialog>

        {/* 카테고리 관리 버튼 */}
        <Box sx={{ textAlign: 'right', mt: 2 }}>
          <Button variant="text" color="secondary" onClick={() => setOpenManageCategoriesDialog(true)}>
            카테고리 관리
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

ChecklistForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    category: PropTypes.string,
    상품명: PropTypes.string,
    브랜드: PropTypes.string,
    가격대: PropTypes.string,
    원산지: PropTypes.string,
    기타원산지: PropTypes.string,
    유통기한: PropTypes.string,
    기타유통기한: PropTypes.string,
    포장상태: PropTypes.string,
    제품특성: PropTypes.string,
    진열위치: PropTypes.string,
    경쟁제품: PropTypes.string,
    고객행동: PropTypes.string,
    기타고객행동: PropTypes.string,
    프로모션여부: PropTypes.string,
    기타프로모션여부: PropTypes.string,
  }),
};

ChecklistForm.defaultProps = {
  initialData: {},
};

export default ChecklistForm;
