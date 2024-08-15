import React, { useState } from 'react';
import { Container, Grid, IconButton, Typography, Box, Alert } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../utils/firebase';
import Layout from '../../../layouts';
import Page from '../../../components/Page';
import CustomTextField from '../../../components/CustomTextField';
import LoadingButton from '../../../components/LoadingButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import BuyList from '../../../components/list-item/BuyList';
import PriceAndPaymentForm from './five';

const ProductRegistration = () => {
  const [products, setProducts] = useState([{ name: '', quantity: 0 }]);
  const [team, setTeam] = useState({ workTeam: '', transportTeam: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleProductChange = (index, event) => {
    const values = [...products];
    values[index][event.target.name] = event.target.value;
    setProducts(values);
  };

  const handleAddProduct = () => {
    setProducts([...products, { name: '', quantity: 0 }]);
  };

  const handleRemoveProduct = (index) => {
    const values = [...products];
    values.splice(index, 1);
    setProducts(values);
  };

  const handleTeamChange = (event) => {
    setTeam({
      ...team,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'buy'), {
        products,
        team,
        createdAt: new Date().toISOString(),
      });
      alert('Products registered successfully!');
      setProducts([{ name: '', quantity: 0 }]);
      setTeam({ workTeam: '', transportTeam: '' });
    } catch (error) {
      console.error('Error registering products: ', error);
      setError('Error registering products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Product Registration">
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>상품 등록</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          {products.map((product, index) => (
            <Grid container spacing={2} key={index}>
              <Grid item xs={5}>
                <CustomTextField
                  label="상품명"
                  name="name"
                  value={product.name}
                  onChange={(event) => handleProductChange(index, event)}
                />
              </Grid>
              <Grid item xs={5}>
                <CustomTextField
                  label="수량"
                  name="quantity"
                  value={product.quantity}
                  onChange={(event) => handleProductChange(index, event)}
                  type="number"
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton onClick={() => handleRemoveProduct(index)}>
                  <RemoveIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <IconButton onClick={handleAddProduct}>
            <AddIcon />
          </IconButton>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <CustomTextField
                label="작업팀"
                name="workTeam"
                value={team.workTeam}
                onChange={handleTeamChange}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField
                label="운송팀"
                name="transportTeam"
                value={team.transportTeam}
                onChange={handleTeamChange}
              />
            </Grid>
          </Grid>
          <LoadingButton
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            loading={loading}
          >
            등록
          </LoadingButton>
        </form>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>최근 등록된 구매 목록</Typography>
          <BuyList />
        </Box>

      </Container>
    </Page>
  );
};

ProductRegistration.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default ProductRegistration;