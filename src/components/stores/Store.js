// components/stores/Store.js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '../../utils/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Container, Typography, Button, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StorefrontIcon from '@mui/icons-material/Storefront';

const StoreList = () => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      const storesCollection = collection(db, 'Stores');
      const storeSnapshot = await getDocs(storesCollection);
      const storeList = storeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStores(storeList);
    };
    fetchStores();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <StorefrontIcon sx={{ mr: 2, fontSize: 40 }} />
          마트 목록
        </Typography>
        <Link href="/stores/add" passHref>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ borderRadius: 2 }}>
            새 마트 등록
          </Button>
        </Link>
      </Grid>
      <Grid container spacing={4}>
        {stores.map((store) => (
          <Grid item xs={12} sm={6} md={4} key={store.id}>
            <Link href={`/stores/${store.id}`} passHref style={{ textDecoration: 'none' }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: '0.3s',
                  '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 },
                }}
              >
                <CardActionArea>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {store.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>위치:</strong> {store.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>연락처:</strong> {store.contactInfo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>유형:</strong> {store.type}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
      {stores.length === 0 && (
        <Typography variant="body1" align="center" sx={{ mt: 6, fontSize: '1.2rem', color: 'text.secondary' }}>
          등록된 마트가 없습니다.
        </Typography>
      )}
    </Container>
  );
};

export default StoreList;
