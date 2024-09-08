import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { collection, getDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import DeleteIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Product from '../../models/Product';
import LoadingButton from '../LoadingButton';
import { getKoreaTime } from '../../models/time';


const ProductForm = ({ initialData = {}, onSubmit }) => {
  const [formState, setFormState] = useState(new Product({
    ...initialData,
    logistics: initialData.logistics?.map(logistic => ({
      ...logistic,
      isDefault: logistic.isDefault ?? true,
      uid: logistic.uid || ''  // uid가 undefined일 경우 빈 문자열로 설정
    })) || []
  }));
  const [logistics, setLogistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!initialData.id;

  useEffect(() => {
    const fetchLogistics = async () => {
      const logisticsCollection = collection(db, 'logistics');
      const logisticsSnapshot = await getDocs(logisticsCollection);
      const logisticsList = logisticsSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
      setLogistics(logisticsList);
    };

    fetchLogistics();
  }, []);


  useEffect(() => {
    if (formState.category && formState.weight && formState.typeName) {
      const generatedName = `${formState.category}(${formState.subCategory})-${formState.weight}kg-${formState.typeName}`;
      setFormState((prevState) => new Product({ ...prevState, name: generatedName }));
    }
  }, [formState.category, formState.weight, formState.typeName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => new Product({ ...prevState, [name]: value }));
  };


  const handleLogisticsChange = async (index, field, value) => {
    const updatedLogistics = formState.logistics.map((logistic, i) => {
      if (i === index) {
        const updatedLogistic = { ...logistic, [field]: value };
        if (field === 'uid') {
          const selectedLogistic = logistics.find(l => l.uid === value);
          if (selectedLogistic) {
            updatedLogistic.name = selectedLogistic.name;
            updatedLogistic.unit = 1;
            updatedLogistic.isDefault = true;
          }
        }
        return updatedLogistic;
      }
      return logistic;
    });

    setFormState((prevState) => new Product({ ...prevState, logistics: updatedLogistics }));
  };

  const addLogistics = () => {
    setFormState(
      (prevState) =>
        new Product({
          ...prevState,
          logistics: [...prevState.logistics, { uid: '', name: '', unit: 1, isDefault: true }],
        })
    );
  };

  const removeLogistics = (index) => {
    const updatedLogistics = formState.logistics.filter((_, i) => i !== index);
    setFormState((prevState) => new Product({ ...prevState, logistics: updatedLogistics }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    // undefined 필드를 제거하는 함수
    const removeUndefinedFields = (obj) => {
      return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null)); // null과 undefined 모두 필터링
    };

    try {
      const productData = removeUndefinedFields(formState.toFirestore()); // undefined 필드 제거
      const now = getKoreaTime().toISOString();

      if (isEditMode) {
        productData.updatedAt = now;
        delete productData.createdAt;
        console.log('Updating product data:', productData);
        await onSubmit(productData);
      } else {
        productData.createdAt = now;
        productData.updatedAt = now;
        console.log('Creating product data:', productData);
        await onSubmit(productData);
      }
    } catch (error) {
      console.error(isEditMode ? '업데이트 실패:' : '생성 실패:', error);
      alert(isEditMode ? '업데이트 실패: ' + error.message : '생성 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box component={Paper} elevation={3} p={3} mt={5}>
      <Typography variant="h4" align="center" gutterBottom>
        {isEditMode ? '상품 수정' : '상품 추가'}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField label="상품명" name="name" value={formState.name} margin="normal" fullWidth disabled />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="상품 카테고리"
            name="category"
            value={formState.category}
            onChange={handleChange}
            margin="normal"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="상품 서브카테고리"
            name="subCategory"
            value={formState.subCategory}
            onChange={handleChange}
            margin="normal"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="무게 (kg)"
            name="weight"
            type="number"
            value={formState.weight}
            onChange={handleChange}
            margin="normal"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="상품 유형"
            name="typeName"
            value={formState.typeName}
            onChange={handleChange}
            margin="normal"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="작업 단가"
            name="price"
            type="number"
            value={formState.price}
            onChange={handleChange}
            margin="normal"
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="상품 기본 수량"
            name="quantity"
            type="number"
            value={formState.quantity}
            onChange={handleChange}
            margin="normal"
            fullWidth
          />
        </Grid>
      </Grid>

      <Typography variant="h6" mt={4} mb={2}>
        물류기기
      </Typography>
      {formState.logistics.map((logistic, index) => (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }} key={index}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>물류기기 선택</InputLabel>
                <Select
                  name="logisticsUid"
                  value={logistic.uid}
                  onChange={(e) => handleLogisticsChange(index, 'uid', e.target.value)}
                >
                  {logistics.map((logisticOption) => (
                    <MenuItem key={logisticOption.uid} value={logisticOption.uid}>
                      {logisticOption.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={logistic.isDefault}
                    onChange={(e) => handleLogisticsChange(index, 'isDefault', e.target.checked)}
                  />
                }
                label={logistic.isDefault ? "변경 가능" : "기본 상태"}
              />
            </Grid>
            <Grid item xs={8} sm={2}>
              <TextField
                label="수량"
                type="number"
                value={logistic.unit}
                onChange={(e) => handleLogisticsChange(index, 'unit', e.target.value)}
                disabled={!logistic.isDefault}
                fullWidth
              />
            </Grid>
            <Grid item xs={4} sm={1}>
              <IconButton onClick={() => removeLogistics(index)} color="secondary">
                <RemoveIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Button startIcon={<DeleteIcon />} onClick={addLogistics} variant="outlined" fullWidth sx={{ mt: 2 }}>
        물류기기 추가
      </Button>

      {initialData && initialData.createdAt && (
        <TextField
          label="생성일"
          name="createdAt"
          value={initialData.createdAt}
          margin="normal"
          fullWidth
          disabled
        />
      )}

      <LoadingButton
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 4 }}
        isLoading={loading}
        buttonText={isEditMode ? '상품 업데이트' : '상품 생성'}
        disabled={loading}
        fullWidth
      />
    </Box>
  );
};

export default ProductForm;