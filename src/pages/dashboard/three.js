import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, Grid, Paper,
  IconButton, Snackbar, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const ProductCreationPage = () => {
  const [productInfo, setProductInfo] = useState({
    registeredProductName: '',
    deliveryProductName: '',
    boxType: '',
    price: '',
    productPrice: '',
  });

  const [openMarkets, setOpenMarkets] = useState([{ name: '', optionId: '' }]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleProductInfoChange = (e) => {
    const { name, value } = e.target;
    setProductInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenMarketChange = (index, field, value) => {
    const newOpenMarkets = [...openMarkets];
    newOpenMarkets[index][field] = value;
    setOpenMarkets(newOpenMarkets);
  };

  const addOpenMarket = () => {
    setOpenMarkets([...openMarkets, { name: '', optionId: '' }]);
  };

  const removeOpenMarket = (index) => {
    const newOpenMarkets = openMarkets.filter((_, i) => i !== index);
    setOpenMarkets(newOpenMarkets);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productInfo,
        price: Number(productInfo.price),
        productPrice: Number(productInfo.productPrice),
        openMarketOptions: openMarkets,
      });
      setSnackbar({ open: true, message: '상품이 성공적으로 생성되었습니다.' });
      // Reset form
      setProductInfo({
        registeredProductName: '',
        deliveryProductName: '',
        boxType: '',
        price: '',
        productPrice: '',
      });
      setOpenMarkets([{ name: '', optionId: '' }]);
    } catch (error) {
      setSnackbar({ open: true, message: '상품 생성 중 오류가 발생했습니다.' });
      console.error("Error adding document: ", error);
    }
  };

  const boxTypes = ['소', '중', '대']; // 박스 타입 옵션

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        상품 생성
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="등록된 상품명"
                name="registeredProductName"
                value={productInfo.registeredProductName}
                onChange={handleProductInfoChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="택배 상품명"
                name="deliveryProductName"
                value={productInfo.deliveryProductName}
                onChange={handleProductInfoChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="박스 타입"
                name="boxType"
                value={productInfo.boxType}
                onChange={handleProductInfoChange}
                required
              >
                {boxTypes.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="가격"
                name="price"
                type="number"
                value={productInfo.price}
                onChange={handleProductInfoChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="상품 가격"
                name="productPrice"
                type="number"
                value={productInfo.productPrice}
                onChange={handleProductInfoChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                오픈마켓 정보
              </Typography>
              {openMarkets.map((market, index) => (
                <Grid container spacing={2} key={index} alignItems="center">
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="오픈마켓 이름"
                      value={market.name}
                      onChange={(e) => handleOpenMarketChange(index, 'name', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      label="옵션 ID"
                      value={market.optionId}
                      onChange={(e) => handleOpenMarketChange(index, 'optionId', e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={() => removeOpenMarket(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addOpenMarket}
                style={{ marginTop: '10px' }}
              >
                오픈마켓 추가
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                상품 생성
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default ProductCreationPage;