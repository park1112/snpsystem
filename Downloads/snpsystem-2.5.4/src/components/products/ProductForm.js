import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductForm = ({ initialData = {}, onSubmit }) => {
  const [formState, setFormState] = useState({
    name: '',
    category: '',
    weight: '',
    typeName: '',
    price: '',
    quantity: '',
    logistics: [],
    createdAt: '',
    updatedAt: '',
  });

  const [logistics, setLogistics] = useState([]);

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

    if (initialData && Object.keys(initialData).length > 0) {
      setFormState({
        name: initialData.name || '',
        category: initialData.category || '',
        weight: initialData.types?.[0]?.variants?.[0]?.weight.replace('kg', '') || '',
        typeName: initialData.types?.[0]?.typeName || '',
        price: initialData.types?.[0]?.variants?.[0]?.price || '',
        quantity: initialData.types?.[0]?.variants?.[0]?.quantity || '',
        logistics: initialData.logistics || [],
        createdAt: initialData.createdAt || '',
        updatedAt: initialData.updatedAt || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    if (formState.category && formState.weight && formState.typeName) {
      const generatedName = `${formState.category}-${formState.weight}kg-${formState.typeName}`;
      setFormState((prevState) => ({
        ...prevState,
        name: generatedName,
      }));
    }
  }, [formState.category, formState.weight, formState.typeName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLogisticsChange = (index, field, value) => {
    const updatedLogistics = formState.logistics.map((logistic, i) =>
      i === index ? { ...logistic, [field]: value } : logistic
    );
    setFormState((prevState) => ({
      ...prevState,
      logistics: updatedLogistics,
    }));
  };

  const addLogistics = () => {
    setFormState((prevState) => ({
      ...prevState,
      logistics: [...prevState.logistics, { uid: '', name: '', unit: 1 }],
    }));
  };

  const removeLogistics = (index) => {
    const updatedLogistics = formState.logistics.filter((_, i) => i !== index);
    setFormState((prevState) => ({
      ...prevState,
      logistics: updatedLogistics,
    }));
  };

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const productData = {
      name: formState.name,
      category: formState.category,
      types: [
        {
          typeName: formState.typeName,
          variants: [
            {
              weight: `${formState.weight}kg`,
              price: parseFloat(formState.price),
              quantity: parseInt(formState.quantity),
            },
          ],
        },
      ],
      logistics: formState.logistics,
      createdAt: formState.createdAt || now,
      updatedAt: now,
    };
    onSubmit(productData);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={5}>
      <Typography variant="h4">{initialData.id ? 'Edit Product' : 'Add Product'}</Typography>
      <TextField label="Name" name="name" value={formState.name} margin="normal" fullWidth disabled />
      <TextField
        label="Category (상품종류)"
        name="category"
        value={formState.category}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      <TextField
        label="Weight (숫자만 입력)"
        name="weight"
        type="number"
        value={formState.weight}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      <TextField
        label="Type Name (상품구분)"
        name="typeName"
        value={formState.typeName}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      <TextField
        label="Price(작업단가)"
        name="price"
        type="number"
        value={formState.price}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      <TextField
        label="Quantity(상품수량)"
        name="quantity"
        type="number"
        value={formState.quantity}
        onChange={handleChange}
        margin="normal"
        fullWidth
      />
      <Typography variant="h6" mt={2}>
        Logistics
      </Typography>
      {formState.logistics.map((logistic, index) => (
        <Grid container spacing={2} key={index}>
          <Grid item xs={5}>
            <FormControl fullWidth margin="normal">
              <InputLabel>물류기기 선택</InputLabel>
              <Select
                name="logisticsUid"
                value={logistic.uid}
                onChange={(e) => handleLogisticsChange(index, 'uid', e.target.value)}
              >
                {logistics.map((logistic) => (
                  <MenuItem key={logistic.uid} value={logistic.uid}>
                    {logistic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <TextField
              label="물류기기 기본단위"
              name="unit"
              type="number"
              value={logistic.unit}
              onChange={(e) => handleLogisticsChange(index, 'unit', e.target.value)}
              margin="normal"
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={() => removeLogistics(index)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button onClick={addLogistics} variant="outlined" sx={{ mt: 2 }}>
        물류기기 추가
      </Button>
      {initialData.id && (
        <TextField label="Created At" name="createdAt" value={formState.createdAt} margin="normal" fullWidth disabled />
      )}
      <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
        {initialData.id ? '상품 업데이트' : '상품 생성'}
      </Button>
    </Box>
  );
};

export default ProductForm;
